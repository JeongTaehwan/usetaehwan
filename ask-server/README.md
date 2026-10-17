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

> Voyage·Gemini 어댑터와 Anthropic 어댑터는 아직 실제 키로 한 번도 호출하지 않았다. 첫 실행에서 요청·응답 형태를 확인한다.

## 배포 (Railway)

- Root directory를 `ask-server`로 둔다. `Dockerfile`과 `railway.json`(헬스체크 `/healthz`)을 쓴다.
- **필수 — Gemini 결제 활성화**: `ASK_EMBEDDER=gemini`로 배포한다면 AI Studio에서 결제를 먼저 켠다. 무료 등급은 입력을 Google이 제품 개선에 쓸 수 있는 약관이라 방문자 질문을 보낼 수 없고, 분당 100건 한도도 있다(D-22).
- 환경변수: `DATABASE_URL`(Neon, pgvector 확장), `ASK_LLM=anthropic`, `ASK_EMBEDDER`(인제스트한 값과 같게), 키, `ASK_PROXY_SECRET`, `ASK_IP_HASH_SECRET`.
- 인제스트 전에 `denylist.txt`(gitignore됨, 한 줄에 하나)에 고객사명을 채운다. `.env`의 `ASK_DENYLIST_PATH=denylist.txt`가 이 파일을 가리킨다.
- 서버는 뜰 때 마이그레이션을 돌린다(전부 `if not exists`). 인제스트는 로컬에서 운영 `DATABASE_URL`로 실행한다.
- Vercel 쪽 환경변수: `ASK_API_URL`(Railway URL), `ASK_PROXY_SECRET`(같은 값).
- Anthropic 콘솔에서 워크스페이스 월 지출 한도를 건다(design §6).
