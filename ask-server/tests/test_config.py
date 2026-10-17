"""운영 모드 판별과 시작 전 비밀 검사 (D-27). DB·키 없이 돈다."""

import os
import subprocess
import sys
from dataclasses import replace

import pytest

from ask import api
from ask.config import (
    DEV_DATABASE_URL,
    DEV_IP_HASH_SECRET,
    SERVER_ROOT,
    ConfigError,
    Settings,
    check_production,
    get_settings,
    runtime_mode,
)

RAILWAY = {"RAILWAY_ENVIRONMENT_ID": "env-123"}
NEON = "postgresql://u:p@ep-x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
OK = Settings(database_url=NEON, proxy_secret="p" * 64, ip_hash_secret="h" * 64)


@pytest.mark.parametrize(
    ("environ", "mode"),
    [
        ({}, "development"),
        ({"ASK_ENV": "development"}, "development"),
        ({"ASK_ENV": "production"}, "production"),
        ({"ASK_ENV": " Production "}, "production"),
        (RAILWAY, "production"),
        # Railway 위에서는 ASK_ENV로 검사를 끌 수 없다
        ({**RAILWAY, "ASK_ENV": "development"}, "production"),
    ],
)
def test_runtime_mode(environ, mode):
    assert runtime_mode(environ)[0] == mode


def test_unknown_ask_env_is_an_error_not_silently_development():
    with pytest.raises(ConfigError, match="ASK_ENV"):
        runtime_mode({"ASK_ENV": "prod"})


def test_development_starts_without_secrets():
    s = replace(OK, proxy_secret="", ip_hash_secret=DEV_IP_HASH_SECRET)
    assert check_production(s, {})[0] == "development"


def test_production_with_both_secrets_starts():
    assert check_production(OK, RAILWAY) == ("production", "RAILWAY_ENVIRONMENT_ID")


@pytest.mark.parametrize(
    ("overrides", "named", "not_named"),
    [
        ({"proxy_secret": ""}, ["ASK_PROXY_SECRET"], ["ASK_IP_HASH_SECRET"]),
        ({"proxy_secret": "   "}, ["ASK_PROXY_SECRET"], ["ASK_IP_HASH_SECRET"]),
        ({"ip_hash_secret": DEV_IP_HASH_SECRET}, ["ASK_IP_HASH_SECRET"], ["ASK_PROXY_SECRET"]),
        ({"ip_hash_secret": ""}, ["ASK_IP_HASH_SECRET"], ["ASK_PROXY_SECRET"]),
        ({"proxy_secret": "", "ip_hash_secret": DEV_IP_HASH_SECRET}, ["ASK_PROXY_SECRET", "ASK_IP_HASH_SECRET"], []),
    ],
)
def test_production_refuses_missing_or_default_secrets(overrides, named, not_named):
    with pytest.raises(ConfigError) as e:
        check_production(replace(OK, **overrides), RAILWAY)
    msg = str(e.value)
    assert "서버를 시작하지 않습니다" in msg and "RAILWAY_ENVIRONMENT_ID" in msg
    assert "DATABASE_URL" not in msg
    for name in named:
        assert name in msg
    for name in not_named:
        assert name not in msg


def test_app_factory_stops_before_building_the_app(monkeypatch):
    for k in ("ASK_PROXY_SECRET", "ASK_IP_HASH_SECRET", "ASK_ENV"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("RAILWAY_ENVIRONMENT_ID", "env-123")
    monkeypatch.setattr(api, "create_app", lambda *a, **k: pytest.fail("create_app가 불리면 안 된다"))
    with pytest.raises(SystemExit) as e:
        api.app_factory()
    assert e.value.code == 1


def test_uvicorn_exits_with_clear_message_in_production_without_secrets():
    """실제 시작 경로 — Dockerfile CMD와 같은 uvicorn --factory가 메시지를 찍고 0이 아닌 코드로 끝난다."""
    env = {k: v for k, v in os.environ.items() if not k.startswith(("ASK_", "RAILWAY_"))}
    env |= {"RAILWAY_ENVIRONMENT_ID": "env-123", "DATABASE_URL": NEON}
    r = subprocess.run(
        [sys.executable, "-m", "uvicorn", "ask.api:app_factory", "--factory", "--port", "0"],
        cwd=SERVER_ROOT,
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert r.returncode != 0
    assert "서버를 시작하지 않습니다" in r.stderr
    assert "ASK_PROXY_SECRET" in r.stderr and "ASK_IP_HASH_SECRET" in r.stderr
    assert "DATABASE_URL" not in r.stderr
    assert "Traceback" not in r.stderr  # 메시지가 traceback에 묻히지 않는다


# ───────── DATABASE_URL (D-32) ─────────


@pytest.mark.parametrize(
    ("url", "hint"),
    [
        (DEV_DATABASE_URL, "localhost:5433"),  # 변수가 없어 기본값으로 떨어진 경우 — Railway 첫 배포 실패 원인
        ("postgresql://ask:ask@127.0.0.1:5432/ask", "127.0.0.1"),
        ("", "호스트 없음"),
    ],
)
def test_production_refuses_missing_or_local_database_url(url, hint):
    with pytest.raises(ConfigError) as e:
        check_production(replace(OK, database_url=url), RAILWAY)
    assert "DATABASE_URL" in str(e.value) and hint in str(e.value)


def test_development_keeps_local_database_default(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    s = get_settings()
    assert s.database_url == DEV_DATABASE_URL
    assert check_production(s, {})[0] == "development"


# ───────── 검색 점수 하한 기본값 (D-31) ─────────


@pytest.mark.parametrize(
    ("env", "expected"),
    [
        ({"ASK_EMBEDDER": "gemini"}, 0.55),
        ({"ASK_EMBEDDER": "hash"}, 0.15),
        ({}, 0.15),  # 기본 임베더는 hash
        ({"ASK_EMBEDDER": "voyage"}, 0.15),  # 아직 재지 않음
        ({"ASK_EMBEDDER": "gemini", "ASK_MIN_SCORE": "0.4"}, 0.4),  # 명시하면 그 값
    ],
)
def test_min_score_default_depends_on_embedder(monkeypatch, env, expected):
    for k in ("ASK_EMBEDDER", "ASK_MIN_SCORE"):
        monkeypatch.delenv(k, raising=False)
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    s = get_settings()
    assert (s.min_score, s.top_k) == (expected, 8)
