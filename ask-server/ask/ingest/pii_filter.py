"""민감정보 필터 — 걸린 청크는 고치지 않고 버리고 보고한다 (D-18).

가린 문장은 뜻이 깨진 채 인용될 수 있다. 고칠 곳은 원본이고, 원본은 사람이 고친다.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

RULES: list[tuple[str, re.Pattern[str]]] = [
    ("phone", re.compile(r"(?<!\d)(?:\+82[-\s]?)?0?1[016789][-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)")),
    ("rrn", re.compile(r"(?<!\d)\d{6}\s?-\s?[1-4]\d{6}(?!\d)")),
    ("birth", re.compile(r"생년월일|출생일|태어난\s?(날|해)|(?<!\d)19\d{2}[./-]\d{1,2}[./-]\d{1,2}(?!\d)")),
    ("address", re.compile(r"주소\s*[:：]|거주지|도로명|[가-힣]{1,4}(시|도)\s[가-힣]{1,4}(구|군)\s[가-힣0-9]")),
    ("salary", re.compile(r"연봉|희망\s?연봉|급여|월급|처우")),
    (
        "internal_url",
        re.compile(r"https?://[^\s)]*(gitlab|jira|confluence|wiki|intranet)[^\s)]*|\.(internal|corp|local)\b"),
    ),
    ("private_ip", re.compile(r"(?<!\d)(10\.\d{1,3}|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}(?!\d)")),
]
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


@dataclass(frozen=True)
class Finding:
    rule: str
    match: str


class DenylistMissing(Exception):
    """경로를 지정했는데 파일이 없다 — 조용히 건너뛰면 고객사명이 걸러지지 않은 채 DB에 들어간다."""


def load_denylist(path: str | None, inline: tuple[str, ...] = ()) -> list[str]:
    """고객사 실명 등 — 목록 자체가 기밀이라 커밋하지 않는다 (D-18, D-33).

    - 파일(ASK_DENYLIST_PATH): 한 줄에 하나, #은 주석. 로컬 인제스트용.
    - 환경변수(ASK_DENYLIST): 쉼표 구분. 파일을 둘 수 없는 곳(CI 시크릿 등)용.
    둘 다 주면 합친다. 경로를 지정했는데 파일이 없으면 실패한다 — 필터가 꺼진 채 도는 것보다 낫다.
    """
    terms = [t.strip() for t in inline if t.strip()]
    if path:
        if not Path(path).is_file():
            raise DenylistMissing(
                f"ASK_DENYLIST_PATH={path} 파일이 없습니다. 파일을 만들거나, 목록을 ASK_DENYLIST(쉼표 구분)로 넘기거나,"
                " 쓰지 않으려면 ASK_DENYLIST_PATH를 비우세요."
            )
        lines = Path(path).read_text().splitlines()
        terms += [t.strip() for t in lines if t.strip() and not t.strip().startswith("#")]
    return list(dict.fromkeys(terms))


def scan(text: str, public_emails: tuple[str, ...] = (), denylist: list[str] | None = None) -> list[Finding]:
    found = [Finding(rule, m.group(0)) for rule, rx in RULES for m in rx.finditer(text)]
    allowed = {e.lower() for e in public_emails}
    found += [Finding("email", m.group(0)) for m in EMAIL.finditer(text) if m.group(0).lower() not in allowed]
    for term in denylist or []:
        if term.lower() in text.lower():
            found.append(Finding("denylist", "***"))  # 보고서에도 원문을 남기지 않는다
    return found
