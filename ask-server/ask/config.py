"""환경변수 설정 — 키가 없으면 오프라인 모드(가짜 LLM · 해시 임베더)로 돈다 (decisions D-20)."""

from __future__ import annotations

import os
import re
import unicodedata
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal
from urllib.parse import urlparse

SERVER_ROOT = Path(__file__).resolve().parent.parent  # ask-server/
REPO_ROOT = SERVER_ROOT.parent  # 사이트 저장소
DEV_IP_HASH_SECRET = "dev-only-secret"  # 로컬 개발 전용 기본값 — 운영에서는 시작을 거부한다 (D-27)
DEV_DATABASE_URL = "postgresql://ask:ask@localhost:5433/ask"  # compose.yaml의 로컬 pgvector — 운영에서는 거부 (D-32)
LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1"}

# 검색 점수 하한 기본값 — 임베더마다 코사인 점수 분포가 달라 따로 둔다 (D-31).
# gemini는 baseline·tuned 평가로 정했다. voyage는 아직 재지 않아 해시 기준값을 그대로 쓴다.
MIN_SCORE_DEFAULTS = {"hash": 0.15, "gemini": 0.55}


def _int(name: str, default: int) -> int:
    return int(os.environ.get(name, default))


def _min_score() -> float:
    explicit = os.environ.get("ASK_MIN_SCORE", "").strip()
    if explicit:
        return float(explicit)
    return MIN_SCORE_DEFAULTS.get(os.environ.get("ASK_EMBEDDER", "hash"), MIN_SCORE_DEFAULTS["hash"])


def _csv(name: str) -> tuple[str, ...]:
    return tuple(t.strip() for t in os.environ.get(name, "").split(",") if t.strip())


@dataclass(frozen=True)
class Settings:
    # 앞뒤 공백·줄바꿈은 걷어 낸다 — 붙은 채로는 libpq가 URI로 읽지 못한다 (D-38)
    database_url: str = field(default_factory=lambda: os.environ.get("DATABASE_URL", DEV_DATABASE_URL).strip())
    llm: str = field(default_factory=lambda: os.environ.get("ASK_LLM", "fake"))  # fake | anthropic
    embedder: str = field(default_factory=lambda: os.environ.get("ASK_EMBEDDER", "hash"))  # hash | voyage | gemini
    anthropic_model: str = field(default_factory=lambda: os.environ.get("ASK_ANTHROPIC_MODEL", "claude-haiku-5-5"))

    # 검색
    top_k: int = field(default_factory=lambda: _int("ASK_TOP_K", 15))  # 생성 프롬프트 v3와 함께 8 → 15 (D-37)
    min_score: float = field(default_factory=_min_score)

    # 가드레일 (design §6)
    max_question_chars: int = field(default_factory=lambda: _int("ASK_MAX_QUESTION_CHARS", 300))
    per_ip_per_minute: int = field(default_factory=lambda: _int("ASK_PER_IP_PER_MINUTE", 5))
    per_ip_per_day: int = field(default_factory=lambda: _int("ASK_PER_IP_PER_DAY", 30))
    daily_cap: int = field(default_factory=lambda: _int("ASK_DAILY_CAP", 300))
    proxy_secret: str = field(default_factory=lambda: os.environ.get("ASK_PROXY_SECRET", ""))
    ip_hash_secret: str = field(default_factory=lambda: os.environ.get("ASK_IP_HASH_SECRET", DEV_IP_HASH_SECRET))

    # 인제스트 필터 — 공개된 이메일만 허용한다. 고객사명 등 기밀 목록은 커밋하지 않는
    # 파일이나 환경변수에서 읽는다 (D-18, D-33).
    # 서버(api)는 이 목록을 쓰지 않는다 — 걸러진 코퍼스가 이미 DB에 있다.
    public_emails: tuple[str, ...] = field(
        default_factory=lambda: tuple(os.environ.get("ASK_PUBLIC_EMAILS", "kt26625417@gmail.com").split(","))
    )
    denylist_path: str | None = field(default_factory=lambda: os.environ.get("ASK_DENYLIST_PATH") or None)
    denylist_inline: tuple[str, ...] = field(default_factory=lambda: _csv("ASK_DENYLIST"))  # 쉼표 구분


def get_settings() -> Settings:
    return Settings()


# ───────── 운영 모드 · 시작 전 검사 (D-27) ─────────

Mode = Literal["production", "development"]


class ConfigError(RuntimeError):
    """운영에 필요한 설정이 빠져 서버를 시작하지 않는다."""


def runtime_mode(environ: Mapping[str, str] = os.environ) -> tuple[Mode, str]:
    """(모드, 판단 근거). 운영이 아니라고 잘못 판단하면 검사가 꺼지므로, 애매하면 운영 쪽으로 기운다.

    - Railway가 모든 배포에 넣는 RAILWAY_ENVIRONMENT_ID가 있으면 운영 — 사람이 표시를 깜빡해도 켜진다.
    - ASK_ENV=production이면 운영 (로컬 Docker 등에서 운영 설정을 시험할 때).
    - 그 밖은 개발. ASK_ENV=development로 Railway 위의 검사를 끌 수는 없다.
    """
    explicit = environ.get("ASK_ENV", "").strip().lower()
    if explicit not in ("", "production", "development"):
        raise ConfigError(f"ASK_ENV는 production 또는 development여야 합니다 (지금: {explicit!r})")
    if environ.get("RAILWAY_ENVIRONMENT_ID"):
        return "production", "RAILWAY_ENVIRONMENT_ID"
    if explicit == "production":
        return "production", "ASK_ENV=production"
    return "development", "ASK_ENV=development" if explicit else "Railway 변수·ASK_ENV 없음"


EMBEDDER_KEYS = {"gemini": "GEMINI_API_KEY", "voyage": "VOYAGE_API_KEY"}
REQUIRED_ENV = ("DATABASE_URL", "ASK_PROXY_SECRET", "ASK_IP_HASH_SECRET", "ASK_LLM", "ASK_EMBEDDER")


def required_env(s: Settings) -> tuple[str, ...]:
    """운영에 필요한 변수 이름. 키는 고른 모델에 따라 달라진다."""
    names = list(REQUIRED_ENV)
    if s.llm == "anthropic":
        names.append("ANTHROPIC_API_KEY")
    if key := EMBEDDER_KEYS.get(s.embedder):
        names.append(key)
    return tuple(names)


def env_presence(names: tuple[str, ...], environ: Mapping[str, str] = os.environ) -> str:
    """'이름=있음/비어 있음/없음'만 — 값은 길이조차 내보내지 않는다 (D-32 변경)."""

    def state(n: str) -> str:
        if n not in environ:
            return "없음"
        return "있음" if environ[n].strip() else "비어 있음"

    return " · ".join(f"{n}={state(n)}" for n in names)


def _norm_name(name: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", unicodedata.normalize("NFKC", name).upper())


def lookalike_env_names(target: str, environ: Mapping[str, str] = os.environ) -> list[str]:
    """target과 정확히 같지는 않은데 비슷한 이름(공백·보이지 않는 문자·대소문자·구분자 차이, DB 관련 이름).

    이름만 돌려준다(ascii 표기라 보이지 않는 문자도 드러난다). 값은 보지 않는다.
    """
    want = _norm_name(target)
    out = []
    for name in environ:
        if name == target:
            continue
        n = _norm_name(name)
        if n == want or any(k in n for k in ("DATABASE", "POSTGRES", "NEON")) or n.startswith("PG"):
            out.append(ascii(name))
    return sorted(out)


def database_url_problem(value: str, environ: Mapping[str, str] = os.environ) -> str | None:
    """운영 DATABASE_URL의 문제를 "없음 / 비어 있음 / 있지만 형식이 잘못됨 / 있지만 로컬 주소"로 가른다 (D-38).

    예전 검사는 이름이 있는지 보지 않고, 값이 개발용 기본값과 같으면 "없음"으로 추론했다. 그래서 값이
    .env.example의 로컬 주소와 같을 때 'env: DATABASE_URL=있음'과 '이름이 없습니다'가 함께 찍혔다.
    메시지에는 값을 넣지 않는다. 호스트는 URL로 제대로 읽혔을 때만 넣는다.
    """
    if value == DEV_DATABASE_URL and "DATABASE_URL" not in environ:
        return (
            "DATABASE_URL이 없습니다. 이 프로세스의 환경변수에 그 이름이 없어서 개발용 기본값(localhost:5433)으로"
            " 떨어졌습니다 (D-32). 코드는 파일(.env)을 읽지 않고 환경변수만 읽습니다 — 위 'env:' 줄과"
            " 비슷한 이름 경고를 보고, 플랫폼이 이 서비스·이 환경에 변수를 실제로 넣는지 확인하세요."
        )
    if not value:
        return "DATABASE_URL이 비어 있습니다. 이름은 있지만 값이 없습니다. Neon 연결 문자열을 넣으세요."
    invalid = "DATABASE_URL은 있지만 형식이 잘못됐습니다"
    if value[0] in "\"'":
        return f"{invalid}: 값이 따옴표로 감싸져 있습니다. 따옴표 없이 연결 문자열만 넣으세요."
    if value.upper().startswith("DATABASE_URL="):
        return f"{invalid}: 값 앞에 'DATABASE_URL='이 붙어 있습니다. 값 칸에는 연결 문자열만 넣으세요."
    if value.lower().startswith("psql"):
        return f"{invalid}: psql 명령째 붙여 넣었습니다. Neon 콘솔에서 연결 문자열(postgresql://…)만 복사하세요."
    url = urlparse(value)
    if url.scheme not in ("postgresql", "postgres"):
        return f"{invalid}: postgresql:// 또는 postgres://로 시작하지 않습니다."
    try:
        host, _ = url.hostname, url.port  # port는 숫자가 아니면 ValueError — URL이 비밀번호 중간에서 끊긴 경우
    except ValueError:
        host = None
    if host in LOCAL_HOSTS:
        same = (
            " 저장소의 .env.example에 적힌 개발용 값과 같습니다 — 그 값이 들어간 것으로 보입니다."
            if value == DEV_DATABASE_URL
            else ""
        )
        return (
            f"DATABASE_URL은 있지만 로컬 주소({host})입니다. 운영 컨테이너 안에는 DB가 없습니다 (D-32).{same}"
            " Neon 연결 문자열을 넣으세요."
        )
    if not host or "@" not in url.netloc:
        return (
            f"{invalid}: 호스트나 사용자 정보(…@)를 읽을 수 없습니다."
            " 비밀번호에 '/'·'#'·'?'·'@' 같은 문자가 그대로 있으면 URL이 거기서 끊깁니다 —"
            " 퍼센트 인코딩해서 넣거나 Neon 콘솔의 연결 문자열을 그대로 복사하세요."
        )
    return None


def check_production(s: Settings, environ: Mapping[str, str] = os.environ) -> tuple[Mode, str]:
    """운영 모드면 DB·비밀·모델 설정을 확인하고, 하나라도 문제면 무엇을 고칠지 적어 ConfigError를 낸다."""
    mode, reason = runtime_mode(environ)
    if mode == "development":
        return mode, reason
    problems = []
    if db := database_url_problem(s.database_url, environ):
        problems.append(db)
    if not s.proxy_secret.strip():
        problems.append(
            "ASK_PROXY_SECRET이 비어 있습니다. 비어 있으면 프록시 비밀 검사가 꺼져"
            " 백엔드를 누구나 직접 호출할 수 있습니다 (D-14). Vercel의 ASK_PROXY_SECRET과 같은 값을 넣으세요."
        )
    if not s.ip_hash_secret.strip() or s.ip_hash_secret == DEV_IP_HASH_SECRET:
        problems.append(
            "ASK_IP_HASH_SECRET이 비었거나 개발용 기본값입니다. 기본값은 저장소에 공개돼 있어서,"
            " IPv4 전체를 대입하면 해시에서 IP를 되찾을 수 있습니다 (D-19). 임의의 긴 값을 넣으세요."
        )
    if s.llm == "fake":
        problems.append(
            "ASK_LLM이 없거나 fake입니다. 방문자에게 규칙 기반 가짜 LLM으로 답하게 됩니다. anthropic을 넣으세요."
        )
    elif s.llm == "anthropic" and not environ.get("ANTHROPIC_API_KEY", "").strip():
        problems.append("ANTHROPIC_API_KEY가 없습니다 (ASK_LLM=anthropic).")
    if s.embedder == "hash":
        problems.append(
            "ASK_EMBEDDER가 없거나 hash입니다. 인제스트한 임베더(gemini)와 다르면 검색이 0건입니다. gemini를 넣으세요."
        )
    elif (key := EMBEDDER_KEYS.get(s.embedder)) and not environ.get(key, "").strip():
        problems.append(f"{key}가 없습니다 (ASK_EMBEDDER={s.embedder}). 없으면 앱을 만들다 KeyError로 죽습니다.")
    if problems:
        lines = "\n".join(f"  - {p}" for p in problems)
        raise ConfigError(
            f"운영 모드({reason})인데 필수 설정이 없어 서버를 시작하지 않습니다.\n{lines}\n"
            "  비밀 값 만들기: openssl rand -hex 32"
        )
    return mode, reason
