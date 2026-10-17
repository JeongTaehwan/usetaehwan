"""FastAPI — POST /ask (SSE), GET /status, GET /healthz.

검증 전 텍스트는 스트리밍하지 않는다. 진행 상황은 노드 완료(stage) 이벤트로만 알리고,
검증을 마친 답은 answer 이벤트 하나로 보낸다 (D-17).
"""

from __future__ import annotations

import hmac
import json
import logging
import time
from collections.abc import Iterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, Field, field_validator

from . import guard, store
from .config import Settings, get_settings
from .embed import make_embedder
from .graph.build import Deps, build_graph
from .llm import make_llm
from .retrieve import retrieve

log = logging.getLogger("ask")
STAGES = {"classify", "retrieve", "grade", "generate", "verify"}  # 화면에 보이는 단계만


class AskIn(BaseModel):
    question: str = Field(min_length=1)

    @field_validator("question")
    @classmethod
    def strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("empty question")
        return v


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def make_pool(url: str, *, max_size: int = 4, kwargs: dict | None = None, check: bool = True) -> ConnectionPool:
    """Neon은 쉬는 연결을 서버 쪽에서 끊는다. 풀이 끊긴 연결을 그대로 내주면 그 요청이 500이 된다.
    그래서 내주기 전에 살아 있는지 확인하고, 죽었으면 버리고 새로 연다 (D-23)."""
    return ConnectionPool(
        url,
        min_size=1,
        max_size=max_size,
        open=False,
        kwargs=kwargs,
        check=ConnectionPool.check_connection if check else None,
    )


def create_app(settings: Settings | None = None, *, llm=None, embedder=None, pool: ConnectionPool | None = None):
    s = settings or get_settings()
    llm = llm or make_llm(s.llm, s.anthropic_model)
    embedder = embedder or make_embedder(s.embedder)
    pool = pool or make_pool(s.database_url)
    minute = guard.MinuteWindow(s.per_ip_per_minute)

    def search(question: str):
        with pool.connection() as conn:
            return retrieve(conn, embedder, question, s.top_k, s.min_score)

    contact = s.public_emails[0] if s.public_emails else ""
    graph = build_graph(Deps(llm=llm, search=search, contact_email=contact))

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        pool.open()
        with pool.connection() as conn:
            store.migrate(conn)  # 전부 if not exists — 가드레일 테이블이 없으면 만든다
        yield
        pool.close()

    app = FastAPI(title="ask-server", lifespan=lifespan)

    def check_proxy(secret: str | None) -> None:
        # 비밀이 설정돼 있으면(운영) Next.js 프록시를 거친 요청만 받는다 — 직접 호출로 레이트리밋 우회 방지 (D-14)
        if s.proxy_secret and not hmac.compare_digest(secret or "", s.proxy_secret):
            raise HTTPException(403, detail={"code": "forbidden"})

    @app.get("/healthz")
    def healthz():
        return {"ok": True}

    @app.get("/status")
    def status(x_ask_proxy_secret: str | None = Header(default=None)):
        check_proxy(x_ask_proxy_secret)
        with pool.connection() as conn:
            remaining = guard.remaining_today(conn, guard.today_kst(), s.daily_cap)
        return {"remaining": remaining, "max_chars": s.max_question_chars, "llm": llm.name, "embedder": embedder.name}

    @app.post("/ask")
    def ask(
        body: AskIn,
        request: Request,
        x_ask_proxy_secret: str | None = Header(default=None),
        x_client_ip: str | None = Header(default=None),
    ):
        check_proxy(x_ask_proxy_secret)
        if len(body.question) > s.max_question_chars:
            return JSONResponse({"code": "too_long", "max_chars": s.max_question_chars}, status_code=422)

        # 비밀이 맞을 때만 프록시가 넘긴 IP를 믿는다
        ip = (x_client_ip if s.proxy_secret and x_client_ip else None) or (
            request.client.host if request.client else ""
        )
        day = guard.today_kst()
        key = guard.ip_hash(s.ip_hash_secret, ip, day)
        try:
            minute.hit(key)
            with pool.connection() as conn:
                guard.reserve_daily(conn, day, key, s.per_ip_per_day, s.daily_cap)
        except guard.Limited as e:
            return JSONResponse({"code": e.code}, status_code=429)

        return StreamingResponse(run(body.question, day), media_type="text/event-stream")

    def run(question: str, day) -> Iterator[str]:
        t0 = time.perf_counter()
        final: dict = {}
        try:
            for mode, chunk in graph.stream({"question": question}, stream_mode=["updates", "values"]):
                if mode == "updates":
                    for node in chunk:
                        if node in STAGES:
                            yield sse("stage", {"stage": node})
                else:
                    final = chunk
        except Exception:
            log.exception("graph failed")  # 질문 원문은 남기지 않는다
            yield sse("error", {"code": "upstream"})
            return
        latency_ms = int((time.perf_counter() - t0) * 1000)
        yield sse(
            "answer",
            {"answer": final["answer"], "citations": final.get("citations", []), "outcome": final["outcome"]},
        )
        log_meta(question, final, latency_ms, day)

    def log_meta(question: str, st: dict, latency_ms: int, day) -> None:
        """질문·답변 원문 없이 메타만 (D-19)."""
        usage = st.get("usage", [])
        cost = sum(u.cost_usd for u in usage)
        evidence = st.get("evidence", [])
        cited = [evidence[c["n"] - 1].chunk_id for c in st.get("citations", []) if c["n"] <= len(evidence)]
        with pool.connection() as conn:
            conn.execute(
                """insert into ask_logs (lang, category, outcome, question_chars, n_candidates, n_evidence,
                     cited_chunk_ids, attempts, violations, latency_ms, input_tokens, output_tokens, cost_usd,
                     llm, embedder)
                   values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    st.get("lang"),
                    st.get("category"),
                    st.get("outcome"),
                    len(question),
                    len(st.get("candidates", [])),
                    len(evidence),
                    cited if st.get("outcome") in ("answered", "fallback") else [],
                    st.get("attempts", 0),
                    [v.rule for v in st.get("violations", [])],
                    latency_ms,
                    sum(u.input_tokens for u in usage),
                    sum(u.output_tokens for u in usage),
                    cost,
                    llm.name,
                    embedder.name,
                ),
            )
            guard.add_cost(conn, day, cost)

    return app


def app_factory() -> FastAPI:  # uvicorn ask.api:app_factory --factory
    return create_app()
