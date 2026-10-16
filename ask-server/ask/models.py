"""공용 자료형."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DocRecord:
    doc_id: str
    source_path: str
    title: str
    url: str
    kind: str
    content_hash: str


@dataclass(frozen=True)
class ChunkRecord:
    chunk_id: str
    doc_id: str
    section: str
    anchor: str
    breadcrumb: str
    body: str
    chunk_hash: str

    @property
    def embed_text(self) -> str:
        """임베딩 입력 — 경로 머리말을 붙여 짧은 청크도 문맥을 잃지 않게 한다 (D-08)."""
        return f"{self.breadcrumb}\n{self.body}"


@dataclass(frozen=True)
class Hit:
    """검색 결과 한 건."""

    chunk_id: str
    doc_id: str
    title: str
    section: str
    url: str
    anchor: str
    body: str
    score: float  # 1 - 코사인 거리

    @property
    def href(self) -> str:
        return f"{self.url}#{self.anchor}"
