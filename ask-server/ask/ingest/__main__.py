"""python -m ask.ingest — 익스포트 → 청크 → 필터 → 동기화 → 바뀐 것만 임베딩.

uv run python -m ask.ingest                     # 익스포터 실행 + 현재 ASK_EMBEDDER로 임베딩
uv run python -m ask.ingest --embedder voyage   # 다른 모델 행도 채운다 (비교용, D-12)
uv run python -m ask.ingest --strict            # 필터에 걸린 청크가 있으면 실패
uv run python -m ask.ingest --dry-run           # DB에 쓰지 않고 필터·청크 결과만
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

from .. import store
from ..config import get_settings
from ..embed import make_embedder
from . import chunk, pii_filter, sources


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="python -m ask.ingest")
    ap.add_argument("--corpus", type=Path, help="익스포터 대신 이 JSON을 쓴다")
    ap.add_argument("--embedder", help="hash | voyage | gemini (기본: ASK_EMBEDDER)")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)
    s = get_settings()

    corpus = sources.load_corpus(args.corpus)
    docs, chunks = chunk.build(corpus)

    denylist = pii_filter.load_denylist(s.denylist_path)
    kept, dropped = [], []
    for c in chunks:
        findings = pii_filter.scan(f"{c.breadcrumb}\n{c.body}", s.public_emails, denylist)
        (dropped if findings else kept).append((c, findings))
    for c, findings in dropped:
        rules = ", ".join(sorted({f.rule for f in findings}))
        print(f"  [filter] 제외 {c.chunk_id} — {rules}", file=sys.stderr)
    kept_chunks = [c for c, _ in kept]

    print(f"문서 {len(docs)} · 청크 {len(chunks)} · 필터 제외 {len(dropped)}")
    if dropped and args.strict:
        print("--strict: 필터에 걸린 청크가 있어 중단합니다. 원본을 고친 뒤 다시 실행하세요.", file=sys.stderr)
        return 1
    if args.dry_run:
        return 0

    embedder = make_embedder(args.embedder or s.embedder)
    with store.connect(s.database_url) as conn:
        store.migrate(conn)
        stats = store.sync_corpus(conn, docs, kept_chunks)
        todo = store.chunks_needing_embedding(conn, embedder.name)
        t0 = time.perf_counter()
        vecs = embedder.embed([c.embed_text for c in todo], "document") if todo else []
        n = store.upsert_embeddings(conn, embedder.name, zip(todo, vecs, strict=True))
        conn.commit()

    print(
        f"동기화: 바뀐 문서 {stats['docs_changed']} · 청크 새로 {stats['chunks_new']} / 바뀜 {stats['chunks_changed']}"
        f" / 그대로 {stats['chunks_same']} / 삭제 {stats['chunks_deleted']}"
    )
    print(f"임베딩: {embedder.name} {n}건 ({(time.perf_counter() - t0) * 1000:.0f}ms)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
