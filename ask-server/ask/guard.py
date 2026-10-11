"""가드레일 — LLM 앞에서 코드가 막는 것들 (design §6).

- looks_personal: 명백한 개인정보 질문은 분류 LLM을 부르지 않고 거절한다.
- RateLimiter: IP당 분당(메모리) · IP당 일당 · 전체 일당(DB, 재시작해도 유지).
"""

from __future__ import annotations

import hashlib
import hmac
import re
import threading
import time
from collections import defaultdict, deque
from datetime import UTC, date, datetime, timedelta, timezone

import psycopg

# 이메일·연락은 공개 정보라 여기 넣지 않는다 (decisions D-06 확정 내용)
PERSONAL = re.compile(
    r"연봉|급여|월급|처우|희망\s?연봉|전화\s?번호|휴대\s?폰|핸드폰|폰\s?번호|집\s?주소|사는\s?곳|어디\s?살|"
    r"몇\s?살|나이가|나이는|생일|생년월일|결혼|여자\s?친구|남자\s?친구|애인|종교|정치\s?성향|건강\s?상태|"
    r"\b(salary|compensation|phone number|home address|how old|birthday|married|girlfriend|boyfriend|religion)\b",
    re.I,
)


def looks_personal(question: str) -> bool:
    return bool(PERSONAL.search(question))


KST = timezone(timedelta(hours=9))


def today_kst() -> date:
    return datetime.now(UTC).astimezone(KST).date()


def ip_hash(secret: str, ip: str, day: date) -> bytes:
    """IP 원문 대신 저장하는 값. 날짜가 섞여서 날이 바뀌면 같은 사람도 연결되지 않는다 (D-19)."""
    return hmac.new(secret.encode(), f"{ip}|{day.isoformat()}".encode(), hashlib.sha256).digest()


class Limited(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code  # per_minute | per_ip_day | daily_cap


class MinuteWindow:
    """IP당 분당 — 메모리. 인스턴스 하나(Railway 단일 컨테이너) 기준이고, 재시작하면 비워진다."""

    def __init__(self, limit: int, clock=time.monotonic):
        self.limit, self.clock = limit, clock
        self._hits: dict[bytes, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: bytes) -> None:
        now = self.clock()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] >= 60:
                q.popleft()
            if len(q) >= self.limit:
                raise Limited("per_minute")
            q.append(now)


def reserve_daily(conn: psycopg.Connection, day: date, key: bytes, per_ip: int, total: int) -> None:
    """일일 상한을 원자적으로 하나 올린다. 넘으면 올리지 않고 Limited. 커밋은 여기서 한다."""
    with conn.transaction():
        used = conn.execute(
            """insert into ask_usage_daily (day, questions) values (%s, 1)
               on conflict (day) do update set questions = ask_usage_daily.questions + 1
               where ask_usage_daily.questions < %s
               returning questions""",
            (day, total),
        ).fetchone()
        if used is None:
            raise Limited("daily_cap")
        mine = conn.execute(
            """insert into ask_ip_daily (day, ip_hash, questions) values (%s, %s, 1)
               on conflict (day, ip_hash) do update set questions = ask_ip_daily.questions + 1
               where ask_ip_daily.questions < %s
               returning questions""",
            (day, key, per_ip),
        ).fetchone()
        if mine is None:
            # 예외로 transaction 블록을 빠져나가면 위의 전체 카운터 증가도 함께 롤백된다
            raise Limited("per_ip_day")


def remaining_today(conn: psycopg.Connection, day: date, total: int) -> int:
    row = conn.execute("select questions from ask_usage_daily where day = %s", (day,)).fetchone()
    return max(0, total - (row[0] if row else 0))


def add_cost(conn: psycopg.Connection, day: date, cost_usd: float) -> None:
    conn.execute("update ask_usage_daily set cost_usd = cost_usd + %s where day = %s", (cost_usd, day))
