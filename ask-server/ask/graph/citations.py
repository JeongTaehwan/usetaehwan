"""인용 검증 — 순수 함수, LLM 없음 (design §3.2, decisions D-10).

R1 범위   — 인용 번호는 1..n
R2 누락   — 사실 문장에는 인용이 1개 이상
R3 숫자   — 문장 속 숫자는 인용한 근거 청크에 있어야 한다 (이력 챗봇에서 가장 해로운 환각은 숫자)
R4 형식   — 빈 답, 인용이 하나도 없는 답
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

CITE = re.compile(r"\[(\d+(?:\s*,\s*\d+)*)\]")
NUMBER = re.compile(r"(?<![\w.])\d{1,3}(?:,\d{3})+(?:\.\d+)?|(?<![\w.])\d+(?:\.\d+)?")
LIST_MARK = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+")
LEADING_CITES = re.compile(r"^((?:\[\d+(?:\s*,\s*\d+)*\]\s*)+)(.*)$", re.S)

# 인용 없이 허용하는 문장 — "자료에 없다" 안내와 맺음말뿐. 목록을 늘릴 때는 테스트를 먼저 쓴다.
NO_INFO = [
    re.compile(r"자료에(는|서)?\s?(나와\s?있지|찾을\s?수|없)"),
    re.compile(r"not (in|covered by) the (provided )?(materials|sources)", re.I),
]
CLOSING = [
    re.compile(r"(더\s)?궁금한\s?(점|게|것)"),
    re.compile(r"feel free to ask", re.I),
]
UNCITED_OK = NO_INFO + CLOSING
MIN_CONTENT_CHARS = 6  # 이보다 짧은 조각(머리말·접속어)은 문장으로 치지 않는다


@dataclass(frozen=True)
class Violation:
    rule: str  # out_of_range | uncited | number_unsupported | empty
    sentence: str
    detail: str = ""


@dataclass(frozen=True)
class Sentence:
    text: str  # 인용 표기를 포함한 원문
    cites: tuple[int, ...]

    @property
    def content(self) -> str:
        return CITE.sub("", self.text).strip()


def split_sentences(answer: str) -> list[Sentence]:
    out: list[Sentence] = []
    for raw_line in answer.splitlines():
        line = LIST_MARK.sub("", raw_line).strip()
        if not line:
            continue
        for part in re.split(r"(?<=[.!?])\s+", line):
            # "…했습니다. [1] 다음 문장" 처럼 마침표 뒤에 붙은 인용은 앞 문장 것이다
            m = LEADING_CITES.match(part)
            if m and out:
                prev = out[-1]
                out[-1] = Sentence(prev.text + " " + m.group(1).strip(), prev.cites + _cites(m.group(1)))
                part = m.group(2).strip()
            if part:
                out.append(Sentence(part, _cites(part)))
    return [s for s in out if len(re.sub(r"\W", "", s.content)) >= MIN_CONTENT_CHARS or s.cites]


def _cites(text: str) -> tuple[int, ...]:
    return tuple(int(n) for m in CITE.finditer(text) for n in m.group(1).split(","))


def _numbers(text: str) -> set[Decimal]:
    nums: set[Decimal] = set()
    for m in NUMBER.finditer(CITE.sub(" ", text)):
        try:
            nums.add(Decimal(m.group(0).replace(",", "")).normalize())
        except InvalidOperation:
            continue
    return nums


def verify(answer: str, evidence: list[str]) -> list[Violation]:
    """evidence[i]는 [i+1]번 근거의 본문."""
    sentences = split_sentences(answer)
    if not sentences:
        return [Violation("empty", answer.strip()[:80], "문장이 없음")]
    if not any(s.cites for s in sentences):
        return [Violation("empty", sentences[0].text[:80], "인용이 하나도 없음")]

    n = len(evidence)
    evidence_numbers = [_numbers(e) for e in evidence]
    violations: list[Violation] = []
    for s in sentences:
        bad = [c for c in s.cites if not 1 <= c <= n]
        if bad:
            violations.append(Violation("out_of_range", s.text, f"근거는 1..{n}, 인용 {bad}"))
        valid = [c for c in s.cites if 1 <= c <= n]
        if not s.cites:
            if not any(p.search(s.text) for p in UNCITED_OK):
                violations.append(Violation("uncited", s.text))
            continue
        if valid:
            supported = set().union(*(evidence_numbers[c - 1] for c in valid))
            missing = sorted(_numbers(s.content) - supported)
            if missing:
                violations.append(
                    Violation("number_unsupported", s.text, f"근거에 없는 숫자 {[str(x) for x in missing]}")
                )
    return violations


def salvage(answer: str, evidence: list[str]) -> str | None:
    """재생성까지 실패했을 때 — 검증을 통과한 인용 문장만 남긴다. 남는 게 없으면 None.

    마지막 안전장치를 다시 LLM에 맡기지 않는다 (D-10).
    """
    n = len(evidence)
    kept = []
    for s in split_sentences(answer):
        if not s.cites:
            continue
        if verify(s.text, evidence):
            continue
        if all(1 <= c <= n for c in s.cites):
            kept.append(s.text)
    return " ".join(kept) if kept else None


def cited_numbers(answer: str) -> list[int]:
    """답에 실제로 쓰인 인용 번호(등장 순, 중복 제거)."""
    seen: list[int] = []
    for c in _cites(answer):
        if c not in seen:
            seen.append(c)
    return seen
