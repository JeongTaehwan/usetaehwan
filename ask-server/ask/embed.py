"""임베더 — 프로토콜 하나에 구현 셋 (decisions D-12, D-20).

- HashEmbedder: 키 없이 도는 오프라인용. 글자 n-gram 해싱이라 의미는 모르고 어휘가 겹쳐야 찾는다.
- VoyageEmbedder / GeminiEmbedder: 실제 후보. 키가 생기면 첫 실행으로 요청·응답 형태를 확인한다.
"""

from __future__ import annotations

import hashlib
import math
import re
import sys
import time
import unicodedata
from collections import Counter
from collections.abc import Callable
from typing import Literal, Protocol

import httpx

InputType = Literal["document", "query"]


class Embedder(Protocol):
    name: str  # embeddings.model 컬럼 값 — 모델과 차원을 함께 적는다 (예: 'voyage-4-lite@1024')

    def embed(self, texts: list[str], input_type: InputType) -> list[list[float]]: ...


def _l2(v: list[float]) -> list[float]:
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]


class HashEmbedder:
    """글자 1~3-gram(한글) + 단어(영숫자)를 부호 있는 해싱으로 고정 차원에 담는다.

    해시는 hashlib을 쓴다. 파이썬 내장 hash()는 프로세스마다 솔트가 바뀌어(PYTHONHASHSEED)
    인제스트 때와 서빙 때 벡터가 달라진다 — 각(Gak)의 Map.copyOf 순서 문제와 같은 함정.
    """

    def __init__(self, dim: int = 1024):
        self.dim = dim
        self.name = f"hash-ngram@{dim}"

    def _features(self, text: str) -> Counter[str]:
        t = unicodedata.normalize("NFKC", text).lower()
        feats: Counter[str] = Counter()
        for word in re.findall(r"[a-z0-9][a-z0-9.+#_-]*", t):
            feats["w:" + word] += 1
        for run in re.findall(r"[가-힣]+", t):
            for n in (1, 2, 3):
                for i in range(len(run) - n + 1):
                    feats[f"k{n}:" + run[i : i + n]] += 1
        return feats

    def _vector(self, text: str) -> list[float]:
        v = [0.0] * self.dim
        for feat, count in self._features(text).items():
            h = hashlib.blake2b(feat.encode(), digest_size=8).digest()
            idx = int.from_bytes(h[:4], "big") % self.dim
            sign = 1.0 if h[4] & 1 else -1.0
            weight = 1.0 + math.log(count)
            if feat.startswith("k1:"):
                weight *= 0.3  # 한 글자는 흔해서 신호가 약하다
            v[idx] += sign * weight
        return _l2(v)

    def embed(self, texts: list[str], input_type: InputType) -> list[list[float]]:
        return [self._vector(t) for t in texts]


class VoyageEmbedder:
    """Voyage AI REST — 질의/문서 input_type 비대칭."""

    URL = "https://api.voyageai.com/v1/embeddings"

    def __init__(self, api_key: str, model: str = "voyage-4-lite", dim: int = 1024, batch: int = 64):
        self.api_key, self.model, self.batch = api_key, model, batch
        self.name = f"{model}@{dim}"

    def embed(self, texts: list[str], input_type: InputType) -> list[list[float]]:
        out: list[list[float]] = []
        with httpx.Client(timeout=30) as client:
            for i in range(0, len(texts), self.batch):
                r = client.post(
                    self.URL,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"input": texts[i : i + self.batch], "model": self.model, "input_type": input_type},
                )
                r.raise_for_status()
                data = sorted(r.json()["data"], key=lambda d: d["index"])
                out.extend(d["embedding"] for d in data)
        return out


class GeminiEmbedder:
    """Google Gemini REST (batchEmbedContents) — 768차원으로 줄여 쓴다.

    무료 등급은 모델당 분당 100건이고, 배치 안의 항목 하나하나가 1건으로 센다(2026-10-17 첫 실행에서 확인).
    그래서 문서 임베딩(인제스트)은 429가 오면 응답의 RetryInfo만큼 기다렸다 같은 배치를 다시 보낸다.
    질의 임베딩은 방문자 요청 안에서 돌아서 기다리지 않고 바로 실패한다 (D-22).
    """

    MAX_RETRIES = 3
    MAX_WAIT_S = 65.0

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-embedding-001",
        dim: int = 768,
        batch: int = 50,
        transport: httpx.BaseTransport | None = None,
        sleep: Callable[[float], None] = time.sleep,
    ):
        self.api_key, self.model, self.dim, self.batch = api_key, model, dim, batch
        self.transport, self.sleep = transport, sleep
        self.name = f"{model}@{dim}"

    @staticmethod
    def _retry_delay(r: httpx.Response) -> float:
        """429 응답 본문의 RetryInfo.retryDelay("18s")를 초로. 없으면 30초."""
        try:
            for d in r.json()["error"]["details"]:
                if d.get("@type", "").endswith("RetryInfo"):
                    return float(d["retryDelay"].rstrip("s"))
        except (ValueError, KeyError, TypeError):
            pass
        return 30.0

    def embed(self, texts: list[str], input_type: InputType) -> list[list[float]]:
        task = "RETRIEVAL_QUERY" if input_type == "query" else "RETRIEVAL_DOCUMENT"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:batchEmbedContents"
        retries = self.MAX_RETRIES if input_type == "document" else 0
        out: list[list[float]] = []
        with httpx.Client(timeout=30, transport=self.transport) as client:
            for i in range(0, len(texts), self.batch):
                reqs = [
                    {
                        "model": f"models/{self.model}",
                        "content": {"parts": [{"text": t}]},
                        "taskType": task,
                        "outputDimensionality": self.dim,
                    }
                    for t in texts[i : i + self.batch]
                ]
                for attempt in range(retries + 1):
                    r = client.post(url, headers={"x-goog-api-key": self.api_key}, json={"requests": reqs})
                    if r.status_code != 429 or attempt == retries:
                        break
                    wait = min(self._retry_delay(r) + 1.0, self.MAX_WAIT_S)
                    print(f"  [gemini] 429 — {wait:.0f}초 뒤 재시도 ({attempt + 1}/{retries})", file=sys.stderr)
                    self.sleep(wait)
                r.raise_for_status()
                # 차원을 줄이면 정규화가 풀리므로 다시 정규화한다
                out.extend(_l2(e["values"]) for e in r.json()["embeddings"])
        return out


def make_embedder(kind: str) -> Embedder:
    import os

    if kind == "hash":
        return HashEmbedder()
    if kind == "voyage":
        return VoyageEmbedder(os.environ["VOYAGE_API_KEY"])
    if kind == "gemini":
        return GeminiEmbedder(os.environ["GEMINI_API_KEY"])
    raise ValueError(f"unknown embedder: {kind}")
