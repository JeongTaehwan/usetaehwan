"""LLM 어댑터 — 그래프가 쓰는 세 가지 일(분류·판정·생성)만 프로토콜로 둔다 (D-03, D-20).

- AnthropicLLM: 공식 SDK. 구조화 출력을 받아도 파싱 뒤 값을 다시 확인한다
  (각(Gak)에서 스키마의 required가 빈 문자열을 통과시킨 일 — 형식 통과와 내용 유효는 다른 검증이다).
- FakeLLM: 키 없이 그래프의 모든 분기를 결정적으로 밟기 위한 규칙 기반 구현. 품질을 흉내 내지 않는다.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Literal, Protocol

from .graph import prompts
from .models import Hit

Category = Literal["in_scope", "personal", "out_of_scope", "injection"]
Lang = Literal["ko", "en"]

# $ / 1M tokens (2026-10 기준, 프롬프트 100K 이하). 비용 지표는 이 표 × 실제 usage로 계산한다.
PRICES: dict[str, tuple[float, float]] = {
    "claude-haiku-5-5": (0.10, 0.50),
    "claude-sonnet-5-5": (2.00, 10.00),
    "fake": (0.0, 0.0),
}


@dataclass(frozen=True)
class Usage:
    node: str
    model: str
    input_tokens: int
    output_tokens: int

    @property
    def cost_usd(self) -> float:
        pin, pout = PRICES.get(self.model, (0.0, 0.0))
        return (self.input_tokens * pin + self.output_tokens * pout) / 1_000_000


class LLMRefusal(Exception):
    """stop_reason == "refusal". Haiku 5.5에는 서버 측 fallback이 없어서 코드가 처리한다."""


class LLM(Protocol):
    name: str

    def classify(self, question: str) -> tuple[Category, Lang, Usage]: ...

    def grade(self, question: str, candidates: list[Hit]) -> tuple[list[int], Usage]:
        """관련 있는 후보의 1부터 시작하는 번호."""
        ...

    def generate(
        self, question: str, evidence: list[Hit], lang: Lang, previous: str | None = None, feedback: str | None = None
    ) -> tuple[str, Usage]: ...


def detect_lang(text: str) -> Lang:
    return "ko" if re.search(r"[가-힣]", text) else "en"


# ───────── Anthropic ─────────


class AnthropicLLM:
    def __init__(self, model: str = "claude-haiku-5-5", timeout: float = 20.0):
        import anthropic

        self.name = model
        self.client = anthropic.Anthropic(timeout=timeout, max_retries=2)

    def _call(
        self, node: str, system: str, messages: list[dict], max_tokens: int, schema: dict | None = None
    ) -> tuple[str, Usage]:
        output_config: dict = {"effort": "low"}
        if schema:
            output_config["format"] = {"type": "json_schema", "schema": schema}
        r = self.client.messages.create(
            model=self.name,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
            thinking={"type": "disabled"},  # Haiku 5.5는 effort high 이하에서만 끌 수 있다 — low라서 허용
            output_config=output_config,
        )
        usage = Usage(node, self.name, r.usage.input_tokens, r.usage.output_tokens)
        if r.stop_reason == "refusal":
            raise LLMRefusal(node)
        text = "".join(b.text for b in r.content if b.type == "text").strip()
        return text, usage

    def classify(self, question: str) -> tuple[Category, Lang, Usage]:
        text, usage = self._call(
            "classify",
            prompts.CLASSIFY_SYSTEM,
            [{"role": "user", "content": prompts.question_block(question)}],
            max_tokens=200,
            schema=prompts.CLASSIFY_SCHEMA,
        )
        data = json.loads(text)
        category, lang = data.get("category"), data.get("lang")
        if category not in ("in_scope", "personal", "out_of_scope", "injection"):
            raise ValueError(f"classify: unexpected category {category!r}")
        return category, lang if lang in ("ko", "en") else detect_lang(question), usage

    def grade(self, question: str, candidates: list[Hit]) -> tuple[list[int], Usage]:
        text, usage = self._call(
            "grade",
            prompts.GRADE_SYSTEM,
            [{"role": "user", "content": prompts.sources_block(candidates) + "\n" + prompts.question_block(question)}],
            max_tokens=300,
            schema=prompts.GRADE_SCHEMA,
        )
        ids = json.loads(text).get("relevant", [])
        # 범위 밖 번호·중복은 코드가 걸러낸다
        return sorted({i for i in ids if isinstance(i, int) and 1 <= i <= len(candidates)}), usage

    def generate(
        self, question: str, evidence: list[Hit], lang: Lang, previous: str | None = None, feedback: str | None = None
    ) -> tuple[str, Usage]:
        system = prompts.GENERATE_SYSTEM.format(language="Korean" if lang == "ko" else "English")
        messages: list[dict] = [
            {"role": "user", "content": prompts.sources_block(evidence) + "\n" + prompts.question_block(question)}
        ]
        if previous is not None and feedback:
            messages += [{"role": "assistant", "content": previous}, {"role": "user", "content": feedback}]
        return self._call("generate", system, messages, max_tokens=800)


# ───────── Fake (오프라인) ─────────

PERSON_HINTS = re.compile(
    r"정태환|태환|이\s?사람|이분|그는|경험|경력|프로젝트|회사|발표|테스트|스택|기술|이력|포트폴리오|학력|자격|"
    r"연락|이메일|메일|했어|했나|해봤|써봤|만들|어떻게\s?(검증|했)|왜\s|"
    r"\b(he|his|him|taehwan|experience|project|worked|built|career)\b",
    re.I,
)
INJECTION_HINTS = re.compile(
    r"무시하고|지시(를|는)?\s?(무시|잊)|시스템\s?프롬프트|프롬프트를?\s?(보여|출력)|역할극|개발자\s?모드|"
    r"ignore (all |the )?(previous|above)|system prompt|you are now|pretend|jailbreak|developer mode",
    re.I,
)


class FakeLLM:
    name = "fake"

    @staticmethod
    def _usage(node: str, *texts: str, out: str = "") -> Usage:
        return Usage(node, "fake", sum(len(t) for t in texts) // 2, len(out) // 2)

    def classify(self, question: str) -> tuple[Category, Lang, Usage]:
        from .guard import looks_personal

        if INJECTION_HINTS.search(question):
            category: Category = "injection"
        elif looks_personal(question):
            category = "personal"
        elif PERSON_HINTS.search(question):
            category = "in_scope"
        else:
            category = "out_of_scope"
        return category, detect_lang(question), self._usage("classify", question)

    def grade(self, question: str, candidates: list[Hit]) -> tuple[list[int], Usage]:
        # 검색 점수 상위 3개 중 최고점의 80% 이상만 관련으로 본다
        if not candidates:
            return [], self._usage("grade", question)
        top = candidates[0].score
        ids = [i for i, h in enumerate(candidates[:3], 1) if h.score >= top * 0.8]
        return ids, self._usage("grade", question, *(h.body for h in candidates))

    def generate(
        self, question: str, evidence: list[Hit], lang: Lang, previous: str | None = None, feedback: str | None = None
    ) -> tuple[str, Usage]:
        # 근거마다 질문과 글자 bigram이 가장 많이 겹치는 문장 하나를 그대로 옮기고 번호를 붙인다
        def grams(s: str) -> set[str]:
            s = re.sub(r"\s", "", s)
            return {s[i : i + 2] for i in range(len(s) - 1)}

        q = grams(question)
        lines = []
        for i, h in enumerate(evidence[:3], 1):
            sentences = [
                re.sub(r"^(문제|파악|해결|설계|결과|판단|구현|기술|수치)\s*:\s*", "", s).strip(" -")
                for s in re.split(r"(?<=[.!?다])\s+|\n", h.body)
            ]
            sentences = [s for s in sentences if len(s) >= 8]
            if not sentences:
                continue
            best = max(sentences, key=lambda s: len(grams(s) & q))
            lines.append(f"{best.rstrip('.')}[{i}].")
        answer = " ".join(lines)
        return answer, self._usage("generate", question, *(h.body for h in evidence), out=answer)


def make_llm(kind: str, model: str) -> LLM:
    if kind == "fake":
        return FakeLLM()
    if kind == "anthropic":
        return AnthropicLLM(model)
    raise ValueError(f"unknown llm: {kind}")
