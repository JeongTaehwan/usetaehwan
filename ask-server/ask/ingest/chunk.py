"""레코드 단위 청크 (D-08) — 원본의 사례·항목·경력 하나가 청크 하나. 길면 문장 경계에서 나눈다."""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from typing import Any

from ..models import ChunkRecord, DocRecord

MAX_CHARS = 1200

# 원문에 있는 "[1]" 같은 표기는 답변의 인용 표기와 충돌한다(오늘어디 사례 본문에 실제로 있다).
# 생성 모델이 그대로 옮겨 쓰면 인용으로 오인되므로 다른 괄호로 바꿔 둔다.
_CITATION_LIKE = re.compile(r"\[(\d+)\]")


def normalize(text: str) -> str:
    t = unicodedata.normalize("NFC", text)
    t = _CITATION_LIKE.sub(r"〔\1〕", t)
    t = re.sub(r"[ \t]+", " ", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


def split_long(text: str, limit: int = MAX_CHARS) -> list[str]:
    if len(text) <= limit:
        return [text]
    sentences = re.split(r"(?<=[.!?다요])\s+|\n", text)
    parts: list[str] = []
    cur = ""
    for s in sentences:
        if cur and len(cur) + len(s) + 1 > limit:
            parts.append(cur)
            cur = s
        else:
            cur = f"{cur} {s}".strip() if cur else s
    if cur:
        parts.append(cur)
    return parts


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def build(corpus: dict[str, Any]) -> tuple[list[DocRecord], list[ChunkRecord]]:
    docs: list[DocRecord] = []
    chunks: list[ChunkRecord] = []
    for d in corpus["documents"]:
        doc_chunks: list[ChunkRecord] = []
        seen: dict[str, int] = {}
        for c in d["chunks"]:
            body = normalize(c["text"])
            if not body:
                continue
            breadcrumb = f"{d['title']} › {c['section']}"
            for part in split_long(body):
                base = f"{d['doc_id']}#{c['anchor']}"
                n = seen.get(base, 0) + 1
                seen[base] = n
                chunk_id = base if n == 1 else f"{base}~{n}"
                doc_chunks.append(
                    ChunkRecord(
                        chunk_id=chunk_id,
                        doc_id=d["doc_id"],
                        section=c["section"],
                        anchor=c["anchor"],
                        breadcrumb=breadcrumb,
                        body=part,
                        chunk_hash=sha256(f"{breadcrumb}\n{part}"),
                    )
                )
        content_hash = sha256(json.dumps([(c.chunk_id, c.chunk_hash) for c in doc_chunks], ensure_ascii=False))
        docs.append(DocRecord(d["doc_id"], d["source_path"], d["title"], d["url"], d["kind"], content_hash))
        chunks.extend(doc_chunks)
    return docs, chunks
