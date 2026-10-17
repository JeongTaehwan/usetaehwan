"""API — 실제 pgvector(테스트 스키마) + 가짜 LLM + 해시 임베더."""

import json
from dataclasses import replace

import psycopg
import pytest
from fastapi.testclient import TestClient

from ask import store
from ask.api import create_app, make_pool
from ask.config import Settings
from ask.embed import HashEmbedder
from ask.ingest import chunk
from ask.llm import FakeLLM

pytestmark = pytest.mark.db

CORPUS = {
    "version": 1,
    "documents": [
        {
            "doc_id": "home",
            "source_path": "x",
            "title": "홈",
            "url": "/",
            "kind": "home",
            "chunks": [
                {
                    "anchor": "exp-3",
                    "section": "경력: 결제 중개 서비스",
                    "text": "결제 중개 서비스에서 PayPal 결제를 주문 생성부터 capture까지 연동했습니다(MR 178건).",
                },
                {"anchor": "about", "section": "소개", "text": "3D 행성 테라포밍 화면을 만들었습니다."},
            ],
        }
    ],
}
BASE = Settings(
    database_url="",
    proxy_secret="",
    per_ip_per_minute=5,
    per_ip_per_day=30,
    daily_cap=300,
    min_score=0.05,
    public_emails=("me@example.com",),
)


@pytest.fixture
def make_client(conn, db_url_and_schema):
    url, schema = db_url_and_schema
    emb = HashEmbedder()
    docs, chunks = chunk.build(CORPUS)
    store.sync_corpus(conn, docs, chunks)
    store.upsert_embeddings(
        conn, emb.name, zip(chunks, emb.embed([c.embed_text for c in chunks], "document"), strict=True)
    )
    conn.commit()
    clients = []

    def make(check: bool = True, **overrides):
        pool = make_pool(
            url,
            max_size=2,
            kwargs={"options": f"-c search_path={schema},public", "application_name": f"ask-test-{schema}"},
            check=check,
        )
        app = create_app(replace(BASE, **overrides), llm=FakeLLM(), embedder=emb, pool=pool)
        c = TestClient(app)
        c.__enter__()
        clients.append(c)
        return c

    yield make
    for c in clients:
        c.__exit__(None, None, None)


def events(resp):
    out = []
    for block in resp.text.strip().split("\n\n"):
        lines = dict(line.split(": ", 1) for line in block.splitlines())
        out.append((lines["event"], json.loads(lines["data"])))
    return out


def test_answer_stream_and_meta_log(make_client, conn):
    c = make_client()
    r = c.post("/ask", json={"question": "결제 연동 경험 있어?"})
    assert r.status_code == 200
    ev = events(r)
    assert [d["stage"] for e, d in ev if e == "stage"] == ["classify", "retrieve", "grade", "generate", "verify"]
    kind, ans = ev[-1]
    assert kind == "answer"
    assert ans["outcome"] == "answered"
    assert ans["citations"][0]["href"] == "/#exp-3"

    row = conn.execute("select outcome, category, question_chars, cited_chunk_ids from ask_logs").fetchone()
    assert row == ("answered", "in_scope", len("결제 연동 경험 있어?"), ["home#exp-3"])
    # 로그 테이블에는 질문·답변 원문 컬럼 자체가 없다
    cols = {
        r[0] for r in conn.execute("select column_name from information_schema.columns where table_name = 'ask_logs'")
    }
    assert not cols & {"question", "answer", "ip"}
    assert conn.execute("select questions from ask_usage_daily").fetchone() == (1,)


def test_personal_question_refused_without_stages(make_client):
    ev = events(make_client().post("/ask", json={"question": "연봉 얼마 받아요?"}))
    assert [e for e, _ in ev] == ["answer"]
    assert ev[0][1]["outcome"] == "refused"


def test_question_length_limit(make_client):
    c = make_client(max_question_chars=10)
    r = c.post("/ask", json={"question": "가" * 11})
    assert r.status_code == 422
    assert r.json()["code"] == "too_long"
    assert c.post("/ask", json={"question": "   "}).status_code == 422


def test_proxy_secret_required_when_configured(make_client):
    c = make_client(proxy_secret="s3cret")
    assert c.post("/ask", json={"question": "결제 경험?"}).status_code == 403
    assert c.post("/ask", json={"question": "결제 경험?"}, headers={"X-Ask-Proxy-Secret": "nope"}).status_code == 403
    assert c.post("/ask", json={"question": "결제 경험?"}, headers={"X-Ask-Proxy-Secret": "s3cret"}).status_code == 200


def test_per_minute_limit(make_client):
    c = make_client(per_ip_per_minute=2)
    codes = [c.post("/ask", json={"question": "결제 경험?"}).status_code for _ in range(3)]
    assert codes == [200, 200, 429]


def test_per_ip_daily_limit_does_not_consume_global_cap(make_client, conn):
    c = make_client(per_ip_per_day=1)
    assert c.post("/ask", json={"question": "결제 경험?"}).status_code == 200
    r = c.post("/ask", json={"question": "결제 경험?"})
    assert (r.status_code, r.json()["code"]) == (429, "per_ip_day")
    assert conn.execute("select questions from ask_usage_daily").fetchone() == (1,)  # 거절분은 롤백


def test_global_daily_cap_across_ips(make_client):
    c = make_client(proxy_secret="s", daily_cap=1)
    h = {"X-Ask-Proxy-Secret": "s"}
    assert c.post("/ask", json={"question": "결제 경험?"}, headers={**h, "X-Client-IP": "1.1.1.1"}).status_code == 200
    r = c.post("/ask", json={"question": "결제 경험?"}, headers={**h, "X-Client-IP": "2.2.2.2"})
    assert (r.status_code, r.json()["code"]) == (429, "daily_cap")
    assert c.get("/status", headers=h).json()["remaining"] == 0


def test_client_ip_header_ignored_without_proxy_secret(make_client):
    """비밀이 없으면 X-Client-IP를 믿지 않는다 — 헤더를 바꿔 끼워 IP당 상한을 피할 수 없다."""
    c = make_client(per_ip_per_day=1)
    assert c.post("/ask", json={"question": "결제 경험?"}, headers={"X-Client-IP": "1.1.1.1"}).status_code == 200
    assert c.post("/ask", json={"question": "결제 경험?"}, headers={"X-Client-IP": "9.9.9.9"}).status_code == 429


def test_status_and_health(make_client):
    c = make_client()
    assert c.get("/healthz").json() == {"ok": True}
    st = c.get("/status").json()
    assert st["remaining"] == 300 and st["llm"] == "fake" and st["embedder"].startswith("hash-ngram")


def _kill_pool_connections(conn, schema: str) -> int:
    """Neon이 쉬는 연결을 끊는 상황을 흉내 낸다 — 풀이 연 백엔드를 서버 쪽에서 종료한다."""
    rows = conn.execute(
        "select pg_terminate_backend(pid) from pg_stat_activity where application_name = %s",
        (f"ask-test-{schema}",),
    ).fetchall()
    conn.commit()
    return len(rows)


@pytest.mark.parametrize("check", [True, False])
def test_pool_survives_server_closed_connection(make_client, conn, db_url_and_schema, check):
    """check=True(운영 설정)면 끊긴 연결을 버리고 새로 열어 200. 끄면 첫 요청이 실패한다 — 버그 재현 (D-23)."""
    _, schema = db_url_and_schema
    c = make_client(check=check)
    assert c.get("/status").status_code == 200
    assert _kill_pool_connections(conn, schema) >= 1

    if check:
        assert c.get("/status").status_code == 200
    else:
        with pytest.raises(psycopg.OperationalError):
            c.get("/status")


def test_server_never_reads_denylist(make_client, monkeypatch, tmp_path):
    """denylist는 인제스트 전용이다. Railway 이미지에 파일이 없어도(경로만 남아 있어도) 서버는 뜨고 답한다 (D-33)."""
    monkeypatch.setenv("ASK_DENYLIST_PATH", str(tmp_path / "missing.txt"))
    c = make_client(denylist_path=str(tmp_path / "missing.txt"))
    assert c.get("/healthz").status_code == 200
    assert c.get("/status").status_code == 200
    r = c.post("/ask", json={"question": "결제 연동 경험 있어?"})
    assert r.status_code == 200 and "event: answer" in r.text
