import os
import subprocess
import sys

import pytest

from ask import store
from ask.embed import HashEmbedder
from ask.ingest import chunk, pii_filter
from ask.retrieve import retrieve

PUBLIC = ("me@example.com",)


# ───────── 민감정보 필터 ─────────


@pytest.mark.parametrize(
    ("text", "rule"),
    [
        ("연락은 010-1234-5678로", "phone"),
        ("+82 10 1234 5678", "phone"),
        ("주민번호 900101-1234567", "rrn"),
        ("생년월일은 비공개", "birth"),
        ("1995.03.07생", "birth"),
        ("서울시 강남구 테헤란로", "address"),
        ("희망 연봉 협의", "salary"),
        ("https://gitlab.company.io/team/repo/-/merge_requests/12", "internal_url"),
        ("서버 192.168.0.12에서", "private_ip"),
        ("other@corp.com 으로", "email"),
    ],
)
def test_filter_catches(text, rule):
    assert rule in {f.rule for f in pii_filter.scan(text, PUBLIC)}


@pytest.mark.parametrize(
    "text",
    [
        "메일은 me@example.com",  # 공개 이메일은 허용
        "npm 0.1.0(2026.07.18) → 0.2.0(07.26)",  # 배포일은 생년월일이 아니다
        "커버리지 42.0% → 69.3%, MR 361건",
        "Next.js rewrites로 /api 프록시를 두어",
        "지역 캐시로 13~20초가 4~5초로",
    ],
)
def test_filter_passes_ordinary_text(text):
    assert pii_filter.scan(text, PUBLIC) == []


def test_denylist_hides_term_in_report(tmp_path):
    f = tmp_path / "deny.txt"
    f.write_text("# 주석\n가상고객사\n")
    findings = pii_filter.scan("가상고객사 주문 화면", PUBLIC, pii_filter.load_denylist(str(f)))
    assert [(x.rule, x.match) for x in findings] == [("denylist", "***")]


# ───────── 청크 ─────────

CORPUS = {
    "version": 1,
    "documents": [
        {
            "doc_id": "project:demo",
            "source_path": "app/_data/projects.ts",
            "title": "프로젝트 데모",
            "url": "/projects/demo",
            "kind": "project",
            "chunks": [
                {
                    "anchor": "overview",
                    "section": "개요",
                    "text": "결제 연동을 했습니다. 본문에 [1] 번호를 붙였습니다.",
                },
                {"anchor": "case-1", "section": "사례: 긴 글", "text": "가나다라마바사 문장입니다. " * 120},
            ],
        }
    ],
}


def test_citation_like_brackets_in_source_are_neutralized():
    _, chunks = chunk.build(CORPUS)
    assert "[1]" not in chunks[0].body
    assert "〔1〕" in chunks[0].body


def test_long_record_splits_with_stable_ids():
    _, chunks = chunk.build(CORPUS)
    parts = [c for c in chunks if c.anchor == "case-1"]
    assert len(parts) > 1
    assert all(len(c.body) <= chunk.MAX_CHARS for c in parts)
    assert parts[0].chunk_id == "project:demo#case-1"
    assert parts[1].chunk_id == "project:demo#case-1~2"
    assert all(c.breadcrumb == "프로젝트 데모 › 사례: 긴 글" for c in parts)


def test_hash_changes_only_when_text_changes():
    _, a = chunk.build(CORPUS)
    _, b = chunk.build(CORPUS)
    assert [c.chunk_hash for c in a] == [c.chunk_hash for c in b]
    edited = {**CORPUS, "documents": [{**CORPUS["documents"][0]}]}
    edited["documents"][0]["chunks"] = [{**CORPUS["documents"][0]["chunks"][0], "text": "결제 연동을 했습니다!"}]
    _, c = chunk.build(edited)
    assert c[0].chunk_hash != a[0].chunk_hash


# ───────── 해시 임베더 ─────────


def test_hash_embedder_is_stable_across_processes():
    """파이썬 내장 hash()를 쓰면 PYTHONHASHSEED마다 벡터가 바뀐다 — hashlib으로 고정했는지 확인."""
    code = "from ask.embed import HashEmbedder; print(HashEmbedder(64).embed(['결제 연동 PayPal'], 'query')[0][:8])"
    outs = {
        subprocess.run(
            [sys.executable, "-c", code], env={**os.environ, "PYTHONHASHSEED": seed}, capture_output=True, text=True
        ).stdout
        for seed in ("1", "2", "3")
    }
    assert len(outs) == 1


def test_hash_embedder_prefers_lexical_overlap():
    e = HashEmbedder()
    q, near, far = (
        e.embed(["결제 연동 경험"], "query")[0],
        *e.embed(["PG 결제 연동"], "document"),
        *e.embed(["행성 테라포밍 3D"], "document"),
    )

    def dot(a, b):
        return sum(x * y for x, y in zip(a, b, strict=True))

    assert dot(q, near) > dot(q, far)


# ───────── pgvector (실제 DB) ─────────


@pytest.mark.db
def test_sync_is_incremental_and_search_works(conn):
    e = HashEmbedder()
    docs, chunks = chunk.build(CORPUS)

    first = store.sync_corpus(conn, docs, chunks)
    todo = store.chunks_needing_embedding(conn, e.name)
    store.upsert_embeddings(conn, e.name, zip(todo, e.embed([c.embed_text for c in todo], "document"), strict=True))
    assert first["chunks_new"] == len(chunks)

    second = store.sync_corpus(conn, docs, chunks)
    assert second == {
        "chunks_new": 0,
        "chunks_changed": 0,
        "chunks_same": len(chunks),
        "chunks_deleted": 0,
        "docs_changed": 0,
    }
    assert store.chunks_needing_embedding(conn, e.name) == []

    hits = retrieve(conn, e, "결제 연동", k=3, min_score=0.0)
    assert hits[0].chunk_id == "project:demo#overview"
    assert hits[0].href == "/projects/demo#overview"


@pytest.mark.db
def test_changed_chunk_is_reembedded_and_removed_chunk_deleted(conn):
    e = HashEmbedder()
    docs, chunks = chunk.build(CORPUS)
    store.sync_corpus(conn, docs, chunks)
    store.upsert_embeddings(conn, e.name, zip(chunks, e.embed([c.embed_text for c in chunks], "document"), strict=True))

    edited = {**CORPUS, "documents": [{**CORPUS["documents"][0]}]}
    edited["documents"][0]["chunks"] = [
        {**CORPUS["documents"][0]["chunks"][0], "text": "결제 연동 내용이 바뀌었습니다."}
    ]
    docs2, chunks2 = chunk.build(edited)
    stats = store.sync_corpus(conn, docs2, chunks2)

    assert stats["chunks_changed"] == 1
    assert stats["chunks_deleted"] == len(chunks) - 1
    assert [c.chunk_id for c in store.chunks_needing_embedding(conn, e.name)] == ["project:demo#overview"]


@pytest.mark.db
def test_models_are_kept_side_by_side(conn):
    """같은 청크를 다른 모델(차원도 다름)로 임베딩해도 서로 덮지 않고, 검색은 모델별로 갈린다 (D-09, D-12)."""
    a, b = HashEmbedder(1024), HashEmbedder(256)
    docs, chunks = chunk.build(CORPUS)
    store.sync_corpus(conn, docs, chunks)
    for e in (a, b):
        store.upsert_embeddings(
            conn, e.name, zip(chunks, e.embed([c.embed_text for c in chunks], "document"), strict=True)
        )
    assert store.chunks_needing_embedding(conn, a.name) == store.chunks_needing_embedding(conn, b.name) == []
    assert retrieve(conn, b, "결제", k=1, min_score=0.0)[0].chunk_id == "project:demo#overview"
