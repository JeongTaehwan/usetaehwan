"""그래프 상태."""

from __future__ import annotations

import operator
from typing import Annotated, Literal, TypedDict

from ..llm import Category, Lang, Usage
from ..models import Hit
from .citations import Violation

Outcome = Literal["answered", "fallback", "no_evidence", "refused"]


def _merge(a: dict, b: dict) -> dict:
    return {**a, **b}


class AskState(TypedDict, total=False):
    question: str
    lang: Lang
    category: Category
    candidates: list[Hit]  # retrieve 결과 (점수 하한 통과)
    evidence: list[Hit]  # grade 통과분 — 생성 프롬프트에서 1부터 번호
    draft: str
    violations: list[Violation]
    attempts: int  # generate 호출 수 (최대 2)
    answer: str
    citations: list[dict]  # [{n, title, section, href}]
    outcome: Outcome
    usage: Annotated[list[Usage], operator.add]  # 노드마다 덧붙인다
    timings: Annotated[dict[str, float], _merge]  # 노드별 ms
