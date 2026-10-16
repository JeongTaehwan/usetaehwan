"""질의 → top-k 청크. 그래프의 retrieve 노드와 평가의 검색 적중률이 같은 함수를 쓴다."""

from __future__ import annotations

import sys

import psycopg

from . import store
from .config import get_settings
from .embed import Embedder, make_embedder
from .models import Hit


def retrieve(conn: psycopg.Connection, embedder: Embedder, question: str, k: int, min_score: float) -> list[Hit]:
    [qvec] = embedder.embed([question], "query")
    return [h for h in store.search(conn, embedder.name, qvec, k) if h.score >= min_score]


if __name__ == "__main__":  # uv run python -m ask.retrieve "질문"
    s = get_settings()
    emb = make_embedder(s.embedder)
    with store.connect(s.database_url) as conn:
        for h in retrieve(conn, emb, " ".join(sys.argv[1:]), s.top_k, 0.0):
            print(f"{h.score:.3f}  {h.chunk_id:45s}  {h.section[:40]}")
