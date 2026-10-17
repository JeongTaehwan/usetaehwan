"""환경변수 설정 — 키가 없으면 오프라인 모드(가짜 LLM · 해시 임베더)로 돈다 (decisions D-20)."""

from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

SERVER_ROOT = Path(__file__).resolve().parent.parent  # ask-server/
REPO_ROOT = SERVER_ROOT.parent  # 사이트 저장소
DEV_IP_HASH_SECRET = "dev-only-secret"  # 로컬 개발 전용 기본값 — 운영에서는 시작을 거부한다 (D-27)


def _int(name: str, default: int) -> int:
    return int(os.environ.get(name, default))


@dataclass(frozen=True)
class Settings:
    database_url: str = field(
        default_factory=lambda: os.environ.get("DATABASE_URL", "postgresql://ask:ask@localhost:5433/ask")
    )
    llm: str = field(default_factory=lambda: os.environ.get("ASK_LLM", "fake"))  # fake | anthropic
    embedder: str = field(default_factory=lambda: os.environ.get("ASK_EMBEDDER", "hash"))  # hash | voyage | gemini
    anthropic_model: str = field(default_factory=lambda: os.environ.get("ASK_ANTHROPIC_MODEL", "claude-haiku-5-5"))

    # 검색
    top_k: int = field(default_factory=lambda: _int("ASK_TOP_K", 8))
    min_score: float = field(default_factory=lambda: float(os.environ.get("ASK_MIN_SCORE", "0.15")))

    # 가드레일 (design §6)
    max_question_chars: int = field(default_factory=lambda: _int("ASK_MAX_QUESTION_CHARS", 300))
    per_ip_per_minute: int = field(default_factory=lambda: _int("ASK_PER_IP_PER_MINUTE", 5))
    per_ip_per_day: int = field(default_factory=lambda: _int("ASK_PER_IP_PER_DAY", 30))
    daily_cap: int = field(default_factory=lambda: _int("ASK_DAILY_CAP", 300))
    proxy_secret: str = field(default_factory=lambda: os.environ.get("ASK_PROXY_SECRET", ""))
    ip_hash_secret: str = field(default_factory=lambda: os.environ.get("ASK_IP_HASH_SECRET", DEV_IP_HASH_SECRET))

    # 인제스트 필터 — 공개된 이메일만 허용, 고객사명 등 기밀 목록은 커밋하지 않는 파일에서 읽는다 (D-18)
    public_emails: tuple[str, ...] = field(
        default_factory=lambda: tuple(os.environ.get("ASK_PUBLIC_EMAILS", "kt26625417@gmail.com").split(","))
    )
    denylist_path: str | None = field(default_factory=lambda: os.environ.get("ASK_DENYLIST_PATH"))


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


def check_production(s: Settings, environ: Mapping[str, str] = os.environ) -> tuple[Mode, str]:
    """운영 모드면 비밀 두 개를 확인하고, 하나라도 문제면 무엇을 고칠지 적어 ConfigError를 낸다."""
    mode, reason = runtime_mode(environ)
    if mode == "development":
        return mode, reason
    problems = []
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
    if problems:
        lines = "\n".join(f"  - {p}" for p in problems)
        raise ConfigError(
            f"운영 모드({reason})인데 필수 비밀이 없어 서버를 시작하지 않습니다.\n{lines}\n"
            "  값 만들기: openssl rand -hex 32"
        )
    return mode, reason
