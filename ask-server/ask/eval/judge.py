"""인용 정확도 심사 — 생성 모델(Haiku)과 다른 모델(Sonnet 5.5)이 (문장, 인용 근거) 쌍을 판정한다 (D-10, D-11).

런타임 검증(citations.verify)은 번호·누락·숫자만 본다. "근거가 이 문장을 실제로 뒷받침하나"는 여기서 잰다.
심사도 LLM 출력이므로, 쌍 목록을 CSV로 내보내 사람이 표본을 검수하고 일치율을 함께 보고한다.
"""

from __future__ import annotations

import json
from dataclasses import dataclass

from ..llm import Usage
from ..models import Hit

JUDGE_MODEL = "claude-sonnet-5-5"

SYSTEM = """\
You check whether each claim is supported by the sources it cites. A claim is supported only if the cited \
sources state it (paraphrase is fine). Numbers must match exactly. A claim that adds facts not in the cited \
sources is not supported. Return one verdict per claim."""

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
        sources = "\n".join(f'<source id="{i}">\n{h.body}\n</source>' for i, h in enumerate(evidence, 1))
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
