"""환경변수 설정 — 키가 없으면 오프라인 모드(가짜 LLM · 해시 임베더)로 돈다 (decisions D-20)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

SERVER_ROOT = Path(__file__).resolve().parent.parent  # ask-server/
REPO_ROOT = SERVER_ROOT.parent  # 사이트 저장소


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
    ip_hash_secret: str = field(default_factory=lambda: os.environ.get("ASK_IP_HASH_SECRET", "dev-only-secret"))

    # 인제스트 필터 — 공개된 이메일만 허용, 고객사명 등 기밀 목록은 커밋하지 않는 파일에서 읽는다 (D-18)
    public_emails: tuple[str, ...] = field(
        default_factory=lambda: tuple(os.environ.get("ASK_PUBLIC_EMAILS", "kt26625417@gmail.com").split(","))
    )
    denylist_path: str | None = field(default_factory=lambda: os.environ.get("ASK_DENYLIST_PATH"))


def get_settings() -> Settings:
    return Settings()
