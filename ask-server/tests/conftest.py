import os
import uuid

import psycopg
import pytest

from ask import store

TEST_DB = os.environ.get("ASK_TEST_DATABASE_URL", "postgresql://ask:ask@localhost:5433/ask")


@pytest.fixture
def conn():
    """테스트마다 새 스키마 — 실제 pgvector에서 돌고, 끝나면 지운다."""
    try:
        c = psycopg.connect(TEST_DB, connect_timeout=2)
    except psycopg.OperationalError:
        pytest.skip("pgvector 없음 (docker compose up -d)")
    schema = f"t_{uuid.uuid4().hex[:8]}"
    c.execute("create extension if not exists vector")
    c.execute(f"create schema {schema}")
    c.execute(f"set search_path to {schema}, public")
    c.commit()
    store.migrate(c)
    yield c
    c.rollback()
    c.execute(f"drop schema {schema} cascade")
    c.commit()
    c.close()


@pytest.fixture
def db_url_and_schema(conn):
    """같은 스키마를 다른 연결(풀)에서도 쓰도록 URL과 스키마 이름을 넘긴다."""
    schema = conn.execute("select current_schema()").fetchone()[0]
    return TEST_DB, schema
