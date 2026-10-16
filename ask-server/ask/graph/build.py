"""질문 그래프 (design §3).

pre_guard → classify → retrieve → grade → generate ⇄ verify → finalize
          ↘ refuse      ↘ no_evidence              ↘ fallback

LLM이 쓰는 노드는 classify · grade · generate 셋. 거절·근거 없음·축약 답변은 코드가 만든다.
"""

from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import dataclass
from functools import wraps

from langgraph.graph import END, START, StateGraph

from ..guard import looks_personal
from ..llm import LLM, LLMRefusal, detect_lang
from ..models import Hit
from . import citations, prompts
from .state import AskState

MAX_ATTEMPTS = 2  # 첫 생성 + 재생성 1회


@dataclass
class Deps:
    llm: LLM
    search: Callable[[str], list[Hit]]  # 질문 → 점수 하한을 통과한 top-k
    contact_email: str = ""


# ───────── 코드가 만드는 문장 ─────────

MESSAGES = {
    "personal": {
        "ko": "연봉·전화번호·나이 같은 개인적인 정보는 답하지 않아요. 업무 이야기는 이메일({email})로 보내 주세요.",
        "en": "I don't answer personal questions such as salary, phone number or age. "
        "For work inquiries, please email {email}.",
    },
    "out_of_scope": {
        "ko": "저는 정태환의 경력·프로젝트·일하는 방식에 대한 질문에만 답해요. "
        '예를 들어 "결제 연동 경험이 있나요?"처럼 물어봐 주세요.',
        "en": "I only answer questions about Taehwan's career, projects and way of working. "
        'Try something like "Has he integrated payment gateways?"',
    },
    "injection": {
        "ko": "그 요청은 따를 수 없어요. 정태환의 경력이나 프로젝트에 대해 물어봐 주세요.",
        "en": "I can't follow that request. Please ask about Taehwan's career or projects.",
    },
    "no_evidence": {
        "ko": "사이트에 있는 자료에서는 그 내용을 찾지 못했어요. 자료에 없는 내용은 추측해서 답하지 않아요.",
        "en": "I couldn't find that in the materials on this site, and I don't guess beyond them.",
    },
    "fallback": {
        "ko": "자료에서 질문에 딱 맞는 답을 확인하지 못했어요. 관련 있어 보이는 자료를 아래에 남길게요.",
        "en": "I couldn't verify a direct answer from the materials. Here are the most related sources.",
    },
}


def message(kind: str, lang: str, email: str = "") -> str:
    return MESSAGES[kind][lang].format(email=email)


def citation_list(evidence: list[Hit], numbers: list[int]) -> list[dict]:
    return [
        {"n": n, "title": evidence[n - 1].title, "section": evidence[n - 1].section, "href": evidence[n - 1].href}
        for n in sorted(numbers)
        if 1 <= n <= len(evidence)
    ]


def _timed(name: str, fn: Callable[[AskState], dict]) -> Callable[[AskState], dict]:
    @wraps(fn)
    def run(state: AskState) -> dict:
        t0 = time.perf_counter()
        out = fn(state)
        return {**out, "timings": {name: (time.perf_counter() - t0) * 1000}}

    return run


# ───────── 그래프 ─────────


def build_graph(deps: Deps):
    def pre_guard(s: AskState) -> dict:
        if looks_personal(s["question"]):
            return {"category": "personal", "lang": detect_lang(s["question"])}
        return {}

    def classify(s: AskState) -> dict:
        try:
            category, lang, usage = deps.llm.classify(s["question"])
        except LLMRefusal:
            return {"category": "injection", "lang": detect_lang(s["question"])}
        return {"category": category, "lang": lang, "usage": [usage]}

    def refuse(s: AskState) -> dict:
        kind = s.get("category", "out_of_scope")
        return {
            "answer": message(kind, s.get("lang", "ko"), deps.contact_email),
            "citations": [],
            "outcome": "refused",
        }

    def retrieve(s: AskState) -> dict:
        return {"candidates": deps.search(s["question"])}

    def grade(s: AskState) -> dict:
        cands = s.get("candidates", [])
        if not cands:
            return {"evidence": []}
        ids, usage = deps.llm.grade(s["question"], cands)
        return {"evidence": [cands[i - 1] for i in ids], "usage": [usage]}

    def no_evidence(s: AskState) -> dict:
        return {"answer": message("no_evidence", s.get("lang", "ko")), "citations": [], "outcome": "no_evidence"}

    def generate(s: AskState) -> dict:
        attempts = s.get("attempts", 0)
        previous = s.get("draft") if attempts else None
        feedback = (
            prompts.retry_feedback([f"{v.rule}: {v.sentence} {v.detail}".strip() for v in s.get("violations", [])])
            if attempts
            else None
        )
        try:
            draft, usage = deps.llm.generate(s["question"], s["evidence"], s.get("lang", "ko"), previous, feedback)
        except LLMRefusal:
            return {"draft": "", "attempts": MAX_ATTEMPTS}  # 재시도하지 않고 fallback으로
        return {"draft": draft, "attempts": attempts + 1, "usage": [usage]}

    def verify(s: AskState) -> dict:
        return {"violations": citations.verify(s.get("draft", ""), [h.body for h in s["evidence"]])}

    def finalize(s: AskState) -> dict:
        draft = s["draft"]
        return {
            "answer": draft,
            "citations": citation_list(s["evidence"], citations.cited_numbers(draft)),
            "outcome": "answered",
        }

    def fallback(s: AskState) -> dict:
        evidence = s["evidence"]
        kept = citations.salvage(s.get("draft", ""), [h.body for h in evidence])
        if kept:
            return {
                "answer": kept,
                "citations": citation_list(evidence, citations.cited_numbers(kept)),
                "outcome": "fallback",
            }
        return {
            "answer": message("fallback", s.get("lang", "ko")),
            "citations": citation_list(evidence, list(range(1, len(evidence) + 1))),
            "outcome": "fallback",
        }

    g = StateGraph(AskState)
    for name, fn in [
        ("pre_guard", pre_guard),
        ("classify", classify),
        ("refuse", refuse),
        ("retrieve", retrieve),
        ("grade", grade),
        ("no_evidence", no_evidence),
        ("generate", generate),
        ("verify", verify),
        ("finalize", finalize),
        ("fallback", fallback),
    ]:
        g.add_node(name, _timed(name, fn))

    g.add_edge(START, "pre_guard")
    g.add_conditional_edges("pre_guard", lambda s: "refuse" if s.get("category") else "classify")
    g.add_conditional_edges("classify", lambda s: "retrieve" if s["category"] == "in_scope" else "refuse")
    g.add_edge("retrieve", "grade")
    g.add_conditional_edges("grade", lambda s: "generate" if s["evidence"] else "no_evidence")
    g.add_edge("generate", "verify")
    g.add_conditional_edges(
        "verify",
        lambda s: "finalize" if not s["violations"] else ("generate" if s["attempts"] < MAX_ATTEMPTS else "fallback"),
    )
    for terminal in ("refuse", "no_evidence", "finalize", "fallback"):
        g.add_edge(terminal, END)
    return g.compile()
