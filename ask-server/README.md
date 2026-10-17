# ask-server — 정태환에게 물어보기

usetaehwan.page의 RAG 챗봇 백엔드. 설계는 [`docs/ask/design.md`](../docs/ask/design.md), 결정은 [`decisions.md`](../docs/ask/decisions.md), 수치는 [`eval-report.md`](../docs/ask/eval-report.md)에 있다.

질문 → 분류 → pgvector 검색 → 관련성 판정 → 생성 → **코드가 인용을 검증** → 통과한 답만 내보낸다.

## 오프라인 모드로 돌리기 (키 없음)

키를 넣지 않으면 가짜 LLM(규칙 기반)과 해시 임베더로 그래프 전체가 돈다. pgvector는 실제 DB를 쓴다.

```bash
docker compose up -d --wait                      # 로컬 pgvector (5433)
uv sync
uv run python -m ask.ingest                      # 코퍼스 익스포트 → 필터 → 청크 → 임베딩 (바뀐 것만)
uv run pytest -q                                 # 테스트 (pgvector 테스트 포함)
uv run uvicorn ask.api:app_factory --factory --port 8787
```

사이트에서 보려면 저장소 루트에서 `npm run dev`를 띄운다. `/api/ask`가 기본값 `http://localhost:8787`로 프록시한다.

```bash
uv run python -m ask.retrieve "결제 연동 경험"      # 검색만
uv run python -m ask.eval --label baseline       # 평가 → docs/ask/eval-report.md에 덧붙임
```

## 키가 생기면

1. `.env.example`을 `.env`로 복사해 키를 채운다(`ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, 비교용 `GEMINI_API_KEY`).
2. 임베딩 두 종류를 같은 DB에 넣고 검색만 비교한다(D-12):
   ```bash
   ASK_EMBEDDER=voyage uv run python -m ask.ingest
   ASK_EMBEDDER=gemini uv run python -m ask.ingest
   ASK_EMBEDDER=voyage ASK_LLM=anthropic uv run python -m ask.eval --label voyage
   ASK_EMBEDDER=gemini ASK_LLM=anthropic uv run python -m ask.eval --label gemini
   ```
3. 고른 임베더로 기준선을 잰다. 인용 정확도 심사는 Sonnet 5.5가 맡는다:
   ```bash
   ASK_LLM=anthropic uv run python -m ask.eval --label baseline --judge anthropic
   ```
   `ASK_MIN_SCORE`(검색 점수 하한, 기본 0.15)는 해시 임베더 기준값이다. 실제 임베더로 바꾸면 다시 맞춘다.
4. 원자료 `eval/runs/*.json`의 `pairs` 중 20쌍을 사람이 검수해서, 심사와 얼마나 일치하는지 함께 기록한다.

> Gemini·Anthropic 어댑터는 2026-10-17 첫 실호출에서 요청·응답 형태를 확인했다(Gemini 무료 등급 429 → D-22). Voyage 어댑터는 아직 실제 키로 호출하지 않았다.

## 배포 (Railway + Vercel)

절차·환경변수 전체 목록·배포 후 확인 순서는 [`docs/ask/deploy.md`](../docs/ask/deploy.md)에 있다. 요점만:

- Root Directory `/ask-server`, 빌더 Dockerfile, 헬스체크 `/healthz`, 리전 싱가포르, 레플리카 1 — **대시보드에서 직접 설정**한다(Config as Code는 Railway에서 지원 중단, D-26 변경).
- **필수 — Gemini 결제 활성화**(D-22), Anthropic 월 지출 한도.
- 인제스트는 로컬에서 운영 `DATABASE_URL`로 실행한다. 그 전에 `denylist.txt`(gitignore됨)를 채운다.
- Vercel에는 `ASK_API_URL`·`ASK_PROXY_SECRET`을 넣고 **재배포**한다(패널 표시 여부가 빌드 시점에 정해짐).
