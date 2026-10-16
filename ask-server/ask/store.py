"""pgvector 접근 — SQL 직접 (decisions D-04)."""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from pathlib import Path

import psycopg

from .config import SERVER_ROOT
from .models import ChunkRecord, DocRecord, Hit

MIGRATIONS = SERVER_ROOT / "migrations"


def connect(url: str) -> psycopg.Connection:
    return psycopg.connect(url, autocommit=False)


def migrate(conn: psycopg.Connection, migrations: Path = MIGRATIONS) -> None:
    """마이그레이션은 전부 if not exists라서 매번 돌려도 된다."""
    for sql in sorted(migrations.glob("*.sql")):
        conn.execute(sql.read_text())
    conn.commit()


def vec_literal(v: Sequence[float]) -> str:
    return "[" + ",".join(f"{x:.7g}" for x in v) + "]"


# ───────── 코퍼스 ─────────


def existing_doc_hashes(conn: psycopg.Connection) -> dict[str, str]:
    return dict(conn.execute("select doc_id, content_hash from documents").fetchall())


def sync_corpus(conn: psycopg.Connection, docs: list[DocRecord], chunks: list[ChunkRecord]) -> dict[str, int]:
    """문서·청크를 코퍼스와 같게 맞춘다 (사라진 것은 지운다). 커밋은 호출자가 한다.

    반환: 바뀐 문서 수, 새/바뀐/그대로/삭제된 청크 수.
    """
    before_docs = existing_doc_hashes(conn)
    before_chunks = dict(conn.execute("select chunk_id, chunk_hash from chunks").fetchall())

    for d in docs:
        conn.execute(
            """insert into documents (doc_id, source_path, title, url, kind, content_hash)
               values (%s, %s, %s, %s, %s, %s)
               on conflict (doc_id) do update set source_path = excluded.source_path, title = excluded.title,
                 url = excluded.url, kind = excluded.kind, content_hash = excluded.content_hash, updated_at = now()
               where documents.content_hash <> excluded.content_hash or documents.url <> excluded.url""",
            (d.doc_id, d.source_path, d.title, d.url, d.kind, d.content_hash),
        )

    stats = {"chunks_new": 0, "chunks_changed": 0, "chunks_same": 0}
    for c in chunks:
        prev = before_chunks.get(c.chunk_id)
        if prev == c.chunk_hash:
            stats["chunks_same"] += 1
            continue
        stats["chunks_new" if prev is None else "chunks_changed"] += 1
        conn.execute(
            """insert into chunks (chunk_id, doc_id, section, anchor, breadcrumb, body, chunk_hash)
               values (%s, %s, %s, %s, %s, %s, %s)
               on conflict (chunk_id) do update set doc_id = excluded.doc_id, section = excluded.section,
                 anchor = excluded.anchor, breadcrumb = excluded.breadcrumb, body = excluded.body,
                 chunk_hash = excluded.chunk_hash""",
            (c.chunk_id, c.doc_id, c.section, c.anchor, c.breadcrumb, c.body, c.chunk_hash),
        )

    keep_chunks = [c.chunk_id for c in chunks]
    keep_docs = [d.doc_id for d in docs]
    deleted = conn.execute("delete from chunks where not (chunk_id = any(%s))", (keep_chunks,)).rowcount
    conn.execute("delete from documents where not (doc_id = any(%s))", (keep_docs,))

    stats["chunks_deleted"] = deleted
    stats["docs_changed"] = sum(1 for d in docs if before_docs.get(d.doc_id) != d.content_hash)
    return stats


def chunks_needing_embedding(conn: psycopg.Connection, model: str) -> list[ChunkRecord]:
    """해당 모델로 임베딩이 없거나, 임베딩 후 청크가 바뀐 것만."""
    rows = conn.execute(
        """select c.chunk_id, c.doc_id, c.section, c.anchor, c.breadcrumb, c.body, c.chunk_hash
           from chunks c left join embeddings e on e.chunk_id = c.chunk_id and e.model = %s
           where e.chunk_id is null or e.chunk_hash <> c.chunk_hash
           order by c.chunk_id""",
        (model,),
    ).fetchall()
    return [ChunkRecord(*r) for r in rows]


def upsert_embeddings(
    conn: psycopg.Connection, model: str, items: Iterable[tuple[ChunkRecord, Sequence[float]]]
) -> int:
    n = 0
    for chunk, vec in items:
        conn.execute(
            """insert into embeddings (chunk_id, model, chunk_hash, embedding) values (%s, %s, %s, %s::vector)
               on conflict (chunk_id, model) do update set chunk_hash = excluded.chunk_hash,
                 embedding = excluded.embedding""",
            (chunk.chunk_id, model, chunk.chunk_hash, vec_literal(vec)),
        )
        n += 1
    return n


# ───────── 검색 ─────────


def search(conn: psycopg.Connection, model: str, query_vec: Sequence[float], k: int) -> list[Hit]:
    """전체 스캔 정확 top-k (D-09). <=>는 코사인 거리."""
    rows = conn.execute(
        """select c.chunk_id, c.doc_id, d.title, c.section, d.url, c.anchor, c.body,
                  1 - (e.embedding <=> %s::vector) as score
           from embeddings e
           join chunks c on c.chunk_id = e.chunk_id
           join documents d on d.doc_id = c.doc_id
           where e.model = %s
           order by e.embedding <=> %s::vector
           limit %s""",
        (vec_literal(query_vec), model, vec_literal(query_vec), k),
    ).fetchall()
    return [Hit(*r[:7], score=float(r[7])) for r in rows]
