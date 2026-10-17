"""인용 정확도 심사 — 생성 모델(Haiku)과 다른 모델(Sonnet 5.5)이 (문장, 인용 근거) 쌍을 판정한다 (D-10, D-11).

런타임 검증(citations.verify)은 번호·누락·숫자만 본다. "근거가 이 문장을 실제로 뒷받침하나"는 여기서 잰다.
심사는 생성 모델과 같은 근거 형식(제목 › 섹션 + 본문)과 "모두 정태환 본인 사이트"라는 맥락을 받는다 (D-28).
심사도 LLM 출력이므로, 쌍 목록을 CSV로 내보내 사람이 표본을 검수하고 일치율을 함께 보고한다.
같은 입력의 재심사에서 판정이 뒤집히는 일이 있어(11건 중 3건), 기본은 3회 다수결이다 (D-25).
"""

from __future__ import annotations

import json
from dataclasses import dataclass

from ..graph import prompts
from ..llm import Usage
from ..models import Hit

JUDGE_MODEL = "claude-sonnet-5-5"

SYSTEM = """\
You check whether each claim is supported by the sources it cites. A claim is supported only if the cited \
sources state it (paraphrase is fine). Numbers must match exactly. A claim that adds facts not in the cited \
sources is not supported. Return one verdict per claim.

Context: every source is a section of 정태환 (Jeong Taehwan)'s own portfolio site, and describes his own work. \
Each source's title attribute gives the page and section it comes from (e.g. a project name). Attributing a \
source's content to him ("정태환은…", "he…"), or naming the project or page given in the source's title, is \
not an added fact."""

SCHEMA = {
    "type": "object",
    "properties": {
        "verdicts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"i": {"type": "integer"}, "supported": {"type": "boolean"}},
                "required": ["i", "supported"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["verdicts"],
    "additionalProperties": False,
}


@dataclass(frozen=True)
class Pair:
    qid: str
    sentence: str
    cites: tuple[int, ...]
    sources: tuple[str, ...]  # 인용한 근거 본문


class AnthropicJudge:
    name = JUDGE_MODEL

    def __init__(self):
        import anthropic

        self.client = anthropic.Anthropic(timeout=60, max_retries=2)

    def judge(self, pairs: list[Pair], evidence: list[Hit]) -> tuple[list[bool | None], Usage]:
        # 생성 모델과 같은 형식(title="문서 › 섹션")으로 준다. v1은 본문만 줘서 이름·프로젝트명 귀속을 오판했다 (D-28)
        sources = prompts.sources_block(evidence)
        claims = "\n".join(
            f'<claim i="{k}" cites="{",".join(map(str, p.cites))}">{p.sentence}</claim>' for k, p in enumerate(pairs)
        )
        r = self.client.beta.messages.create(
            model=JUDGE_MODEL,
            max_tokens=2000,
            system=SYSTEM,
            messages=[{"role": "user", "content": f"{sources}\n{claims}"}],
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
        usage = Usage("judge", JUDGE_MODEL, r.usage.input_tokens, r.usage.output_tokens)
        if r.stop_reason == "refusal":
            return [None] * len(pairs), usage
        text = "".join(b.text for b in r.content if b.type == "text")
        verdicts = {v["i"]: v["supported"] for v in json.loads(text).get("verdicts", [])}
        return [verdicts.get(k) for k in range(len(pairs))], usage


def majority(votes: list[bool | None]) -> bool | None:
    """True/False 중 많은 쪽. 동수이거나 표가 없으면(거절만 나온 경우 포함) None — 집계에서 뺀다."""
    t, f = votes.count(True), votes.count(False)
    return True if t > f else False if f > t else None


class MajorityJudge:
    """같은 쌍 묶음을 runs번 따로 심사해 쌍마다 표를 모은다. 판정은 majority()로 낸다 (D-25)."""

    def __init__(self, inner, runs: int = 3):
        if runs < 1:
            raise ValueError("runs >= 1")
        self.inner, self.runs = inner, runs
        self.name = inner.name if runs == 1 else f"{inner.name} ×{runs} 다수결"

    def vote(self, pairs: list[Pair], evidence: list[Hit]) -> tuple[list[list[bool | None]], float]:
        votes: list[list[bool | None]] = [[] for _ in pairs]
        cost = 0.0
        for _ in range(self.runs):
            verdicts, usage = self.inner.judge(pairs, evidence)
            cost += usage.cost_usd
            for vs, v in zip(votes, verdicts, strict=True):
                vs.append(v)
        return votes, cost
