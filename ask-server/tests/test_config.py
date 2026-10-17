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
    env_presence,
    get_settings,
    lookalike_env_names,
    required_env,
    runtime_mode,
)

RAILWAY = {"RAILWAY_ENVIRONMENT_ID": "env-123", "ANTHROPIC_API_KEY": "sk-test", "GEMINI_API_KEY": "g-test"}
NEON = "postgresql://u:p@ep-x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
OK = Settings(database_url=NEON, proxy_secret="p" * 64, ip_hash_secret="h" * 64, llm="anthropic", embedder="gemini")
MODEL_KEYS = ("ANTHROPIC_API_KEY", "GEMINI_API_KEY", "VOYAGE_API_KEY")


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
    env = {k: v for k, v in os.environ.items() if not k.startswith(("ASK_", "RAILWAY_", *MODEL_KEYS))}
    env |= {"RAILWAY_ENVIRONMENT_ID": "env-123", "DATABASE_URL": NEON, "ASK_LLM": "anthropic"}
    env |= {"ASK_EMBEDDER": "gemini", "ANTHROPIC_API_KEY": "sk-test", "GEMINI_API_KEY": "g-test"}
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
    assert "ASK_PROXY_SECRET이" in r.stderr and "ASK_IP_HASH_SECRET이" in r.stderr
    assert "DATABASE_URL이" not in r.stderr  # DB는 문제없음
    # 검사보다 먼저 있음/없음을 찍는다 — 값은 찍지 않는다
    assert "env: DATABASE_URL=있음 · ASK_PROXY_SECRET=없음 · ASK_IP_HASH_SECRET=없음" in r.stderr
    assert NEON not in r.stderr and "sk-test" not in r.stderr
    assert "Traceback" not in r.stderr


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


# ───────── 환경변수가 항상 이긴다 — 파일은 읽지 않는다 (D-32 변경) ─────────


def test_package_never_loads_dotenv_files():
    """Railway에서 'DATABASE_URL이 없습니다'가 났을 때 의심한 경로 — 코드가 .env를 읽어 실제 값을 덮는지."""
    offenders = [
        str(f.relative_to(SERVER_ROOT))
        for f in (SERVER_ROOT / "ask").rglob("*.py")
        if any(w in f.read_text() for w in ("dotenv", "env_file", "env_prefix", "BaseSettings"))
    ]
    assert offenders == []


def _settings_in(cwd, extra_env):
    env = {k: v for k, v in os.environ.items() if not k.startswith(("ASK_", "RAILWAY_", "DATABASE_URL", *MODEL_KEYS))}
    env |= {"PYTHONPATH": str(SERVER_ROOT)} | extra_env
    code = "\n".join(
        [
            "import os",
            "from ask.config import get_settings, check_production",
            "s = get_settings()",
            "print(s.database_url == os.environ.get('DATABASE_URL'), s.database_url.startswith('postgresql://ask:ask@localhost'))",
            "print(check_production(s)[0])",
        ]
    )
    return subprocess.run([sys.executable, "-c", code], cwd=cwd, env=env, capture_output=True, text=True, timeout=30)


def test_real_env_wins_over_empty_dotenv_files_in_cwd(tmp_path):
    # 이미지 안에 빈 값의 .env/.env.example이 있어도(실제로는 .dockerignore로 빠진다) 환경변수가 쓰인다
    (tmp_path / ".env").write_text("DATABASE_URL=\nASK_PROXY_SECRET=\nASK_IP_HASH_SECRET=\n")
    (tmp_path / ".env.example").write_text("DATABASE_URL=postgresql://ask:ask@localhost:5433/ask\n")
    prod = {**RAILWAY, "DATABASE_URL": NEON, "ASK_PROXY_SECRET": "p", "ASK_IP_HASH_SECRET": "h"}
    prod |= {"ASK_LLM": "anthropic", "ASK_EMBEDDER": "gemini"}
    r = _settings_in(tmp_path, prod)
    assert r.returncode == 0, r.stderr
    assert r.stdout.split() == ["True", "False", "production"]


def test_dotenv_file_alone_is_ignored(tmp_path):
    # 반대로 파일에만 값이 있으면 읽지 않는다 — 환경변수가 유일한 출처
    (tmp_path / ".env").write_text(f"DATABASE_URL={NEON}\n")
    r = _settings_in(tmp_path, {})
    assert r.stdout.split() == ["False", "True", "development"]


# ───────── 있음/없음 로그 (D-32 변경) ─────────


def test_env_presence_reports_state_never_values():
    environ = {"DATABASE_URL": NEON, "ASK_PROXY_SECRET": "   ", "ANTHROPIC_API_KEY": "sk-ant-secret"}
    out = env_presence(("DATABASE_URL", "ASK_PROXY_SECRET", "ASK_IP_HASH_SECRET", "ANTHROPIC_API_KEY"), environ)
    assert out == "DATABASE_URL=있음 · ASK_PROXY_SECRET=비어 있음 · ASK_IP_HASH_SECRET=없음 · ANTHROPIC_API_KEY=있음"
    assert NEON not in out and "sk-ant-secret" not in out


def test_required_env_follows_chosen_models():
    assert required_env(OK)[-2:] == ("ANTHROPIC_API_KEY", "GEMINI_API_KEY")
    assert required_env(replace(OK, llm="fake", embedder="hash")) == (
        "DATABASE_URL",
        "ASK_PROXY_SECRET",
        "ASK_IP_HASH_SECRET",
        "ASK_LLM",
        "ASK_EMBEDDER",
    )


def test_lookalike_names_reveal_invisible_and_spelling_differences():
    environ = {
        "DATABASE_URL\u200b": "x",  # 보이지 않는 문자
        "DATABASE_URL ": "x",  # 뒤 공백
        "database_url": "x",
        "DATABASE-URL": "x",
        "PGHOST": "x",
        "NEON_DATABASE_URL": "x",
        "ASK_PROXY_SECRET": "x",
    }
    got = lookalike_env_names("DATABASE_URL", environ)
    assert "'DATABASE_URL\\u200b'" in got and "'DATABASE_URL '" in got
    assert {"'database_url'", "'DATABASE-URL'", "'PGHOST'", "'NEON_DATABASE_URL'"} <= set(got)
    assert "'ASK_PROXY_SECRET'" not in got
    assert lookalike_env_names("DATABASE_URL", {"DATABASE_URL": "x"}) == []


def test_app_factory_logs_presence_and_lookalikes_before_failing(monkeypatch, caplog):
    for k in [k for k in os.environ if k.startswith(("ASK_", "RAILWAY_", "DATABASE_URL", *MODEL_KEYS))]:
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("RAILWAY_ENVIRONMENT_ID", "env-123")
    monkeypatch.setenv("DATABASE_URL\u200b", NEON)  # 이름에 보이지 않는 문자가 섞인 경우
    monkeypatch.setenv("ASK_PROXY_SECRET", "secret-proxy-value")
    caplog.set_level("INFO", logger="uvicorn.error")
    with pytest.raises(SystemExit):
        api.app_factory()
    text = caplog.text
    assert "env: DATABASE_URL=없음 · ASK_PROXY_SECRET=있음 · ASK_IP_HASH_SECRET=없음" in text
    assert "RAILWAY_* 1개" in text
    assert "비슷한 이름의 변수가 있습니다: 'DATABASE_URL\\u200b'" in text
    assert "secret-proxy-value" not in text and NEON not in text


# ───────── 모델 설정 (D-32 변경) ─────────


@pytest.mark.parametrize(
    ("overrides", "environ_drop", "needle"),
    [
        ({"llm": "fake"}, (), "ASK_LLM이 없거나 fake"),
        ({"embedder": "hash"}, (), "ASK_EMBEDDER가 없거나 hash"),
        ({}, ("ANTHROPIC_API_KEY",), "ANTHROPIC_API_KEY가 없습니다"),
        ({}, ("GEMINI_API_KEY",), "GEMINI_API_KEY가 없습니다"),
    ],
)
def test_production_refuses_fake_models_or_missing_keys(overrides, environ_drop, needle):
    environ = {k: v for k, v in RAILWAY.items() if k not in environ_drop}
    with pytest.raises(ConfigError, match=needle):
        check_production(replace(OK, **overrides), environ)
