# 배포 체크리스트 — ask-server(Railway) + 사이트(Vercel)

> 2026-10-17 작성. Railway·Vercel 공식 문서와 이 저장소 코드를 확인하고 썼다. 값(키·비밀)은 여기에 적지 않는다.
> 대시보드 메뉴 이름은 문서 기준이라 실제 화면과 조금 다를 수 있다. 첫 배포 때 다르면 고친다.
> 순서: **배포 전 준비 → Railway → Railway 확인 → Vercel → 사이트 확인.** 앞 단계가 통과해야 다음으로 간다.

## 0. 배포 전 준비

- [ ] **Gemini 결제 활성화** (필수, D-22). 무료 등급은 입력을 Google이 제품 개선에 쓸 수 있는 약관이라, 방문자 질문을 보내면 안 된다. 분당 100건 한도도 함께 풀린다.
- [ ] **Anthropic 월 지출 한도**를 콘솔의 워크스페이스에 건다 (design §6).
- [ ] 평가로 확정한 `ASK_TOP_K`·`ASK_MIN_SCORE` 값을 정한다. tuned-gemini 결과 전이면 지금 기본값(8 / 0.15)으로 배포한다.
- [ ] `denylist.txt`를 채운 뒤 인제스트를 다시 돌린다. 로컬 `ask-server`에서 운영 `DATABASE_URL`로 실행한다. 컨테이너는 서빙만 하고 인제스트는 하지 않는다.
- [ ] 비밀 두 개를 만든다. 값은 비밀번호 관리자에 둔다.
  ```bash
  openssl rand -hex 32
  ```
  `ASK_PROXY_SECRET`(Railway·Vercel 같은 값)과 `ASK_IP_HASH_SECRET`(Railway만)에 하나씩 쓴다.

## 1. Railway 서비스

| 설정 | 값 | 확인 방법 |
|---|---|---|
| Source | 이 GitHub 저장소, 배포 브랜치 | Settings → Source |
| **Root Directory** | `/ask-server` | Settings → Source → Root Directory. 이 디렉터리 파일만 가져와 빌드한다. |
| **Config file path** | `/ask-server/railway.json` | Settings의 config-as-code(Railway config file) 경로 항목. **Root Directory를 따르지 않는다.** 저장소 루트 기준 절대경로로 적어야 한다(Railway 모노레포 문서). 비워 두거나 `railway.json`만 적으면 설정 파일을 못 찾는다. |
| 빌더 | Dockerfile (`railway.json`의 `dockerfilePath: "Dockerfile"`) | 첫 빌드 로그가 Nixpacks·Railpack이 아니라 Dockerfile 빌드인지, `uv sync --frozen --no-dev` 단계가 있는지 본다. 경로를 못 찾으면 여기서 실패한다. |
| **리전** | 싱가포르 `asia-southeast1-eqsg3a` | Neon이 `aws ap-southeast-1`(싱가포르)이다. `railway.json`의 `multiRegionConfig`에 고정했다(D-26). 코드 설정이 대시보드보다 우선하므로, 대시보드에서 바꿔도 다음 배포에 되돌아간다. |
| 레플리카 | 1 | IP당 분당 한도(`MinuteWindow`)가 프로세스 메모리에 있다. 2개 이상이면 한도가 레플리카 수만큼 느슨해진다(D-26). |
| 헬스체크 | `/healthz` (`railway.json`) | 배포할 때만 확인하고 그 뒤로는 감시하지 않는다. 기본 300초 안에 2xx가 와야 하고, 요청은 `healthcheck.railway.app`에서 `PORT`로 온다. |
| 포트 | Railway가 넣는 `PORT` | `Dockerfile` CMD가 `${PORT:-8000}`을 쓴다. `PORT`는 직접 넣지 않는다. |
| 공개 도메인 | Settings → Networking → Generate Domain | 이 URL이 Vercel의 `ASK_API_URL`이 된다. |

### Railway 환경변수 (`ask/config.py` 기준 전체)

**필수**

| 이름 | 설명 |
|---|---|
| `DATABASE_URL` | Neon 연결 문자열(pooler 주소, `sslmode=require`). 서버가 뜰 때 마이그레이션을 돈다(전부 `if not exists`). |
| `ASK_LLM` | `anthropic`. 빠뜨리면 기본값 `fake`(규칙 기반 가짜 LLM)로 뜬다. |
| `ASK_EMBEDDER` | `gemini`. **인제스트한 임베더와 같아야 한다.** 다르면 검색 결과가 0건이다(임베딩 행이 모델별로 나뉨). 빠뜨리면 기본값 `hash`. |
| `ANTHROPIC_API_KEY` | 생성·분류·판정 (Haiku 5.5) |
| `GEMINI_API_KEY` | 질문 임베딩 (`gemini-embedding-001@768`) |
| `ASK_PROXY_SECRET` | Vercel 프록시만 통과시키는 공유 비밀(D-14). **비어 있으면 검사를 건너뛰어 백엔드가 누구에게나 열린다.** |
| `ASK_IP_HASH_SECRET` | IP를 날짜와 섞어 HMAC으로 해시하는 비밀(D-19). **빠뜨리면 코드 기본값 `dev-only-secret`이 조용히 쓰인다.** |

**선택 (기본값이 있음)**

| 이름 | 기본값 | 설명 |
|---|---|---|
| `ASK_ANTHROPIC_MODEL` | `claude-haiku-5-5` | 생성 모델 |
| `ASK_TOP_K` | `8` | 검색 후보 수. tuned-gemini 결과로 정한다. |
| `ASK_MIN_SCORE` | `0.15` | 검색 점수 하한. 해시 임베더 기준값이라, tuned-gemini 결과로 다시 정한다. |
| `ASK_MAX_QUESTION_CHARS` | `300` | 질문 길이 상한. 바꾸면 `app/api/ask/route.ts`의 `MAX_CHARS`도 같이 바꾼다. |
| `ASK_PER_IP_PER_MINUTE` | `5` | IP당 분당 질문 수 |
| `ASK_PER_IP_PER_DAY` | `30` | IP당 일일 질문 수 |
| `ASK_DAILY_CAP` | `300` | 전체 일일 질문 수 |
| `ASK_PUBLIC_EMAILS` | `kt26625417@gmail.com` | 답에 내보내도 되는 이메일. 거절 안내문의 연락처로도 쓴다. |

**Railway에는 넣지 않는 것**: `PORT`(Railway가 넣음), `ASK_DENYLIST_PATH`(인제스트 전용·로컬), `VOYAGE_API_KEY`(voyage 임베더를 쓸 때만), `ASK_TEST_DATABASE_URL`(테스트 전용).

## 2. Railway 배포 확인 (Vercel 연결 전)

비밀은 명령줄 기록에 남지 않게 입력받아 쓴다.

```bash
read -rs ASK_PROXY_SECRET && export ASK_PROXY_SECRET
```

```bash
export ASK_URL=https://<railway-domain>
```

1. **배포 로그**: 빌드 성공 → `Application startup complete` → 헬스체크 통과. 시작 단계에서 마이그레이션이 Neon에 붙으므로, 여기서 실패하면 `DATABASE_URL`을 의심한다.
2. **`/healthz`**: `{"ok":true}`가 와야 한다. 프로세스가 떠 있는지만 본다(DB·키는 보지 않는다).
   ```bash
   curl -s "$ASK_URL/healthz"
   ```
3. **비밀 없이 `/status`**: **403**이 와야 한다. 비밀 검사가 켜졌다는 뜻이다. 200이 오면 `ASK_PROXY_SECRET`이 비어 있는 것이다.
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' "$ASK_URL/status"
   ```
4. **비밀 넣고 `/status`**: DB 연결과 설정을 확인한다. `remaining`이 일일 상한(300)이고 `llm`이 `claude-haiku-5-5`, `embedder`가 `gemini-embedding-001@768`이어야 한다. `fake`나 `hash-ngram`이 보이면 `ASK_LLM`·`ASK_EMBEDDER`가 빠진 것이다.
   ```bash
   curl -s -H "x-ask-proxy-secret: $ASK_PROXY_SECRET" "$ASK_URL/status"
   ```
5. **질문 1개** (선택, 일일 사용량 1건이 쓰인다): 마지막 `event: answer`에 `outcome: answered`와 인용이 있어야 한다.
   ```bash
   curl -sN -H "x-ask-proxy-secret: $ASK_PROXY_SECRET" -H 'content-type: application/json' -d '{"question":"이 사람 결제 연동 경험 있어?"}' "$ASK_URL/ask"
   ```
6. 몇 분 쉰 뒤 4번을 다시 부른다. Neon이 쉬는 연결을 끊은 다음 첫 요청도 200이어야 한다(D-23).

## 3. Vercel 환경변수

| 이름 | 값 | 환경 | 설명 |
|---|---|---|---|
| `ASK_API_URL` | Railway 공개 URL (`https://…`, 끝에 `/` 없이) | **Production** | `/api/ask` 프록시가 이 주소의 `/status`·`/ask`로 보낸다. 사이트 레이아웃이 **이 값이 있을 때만 챗봇 패널을 띄운다**(`app/(site)/layout.tsx`의 `ASK_ENABLED`). |
| `ASK_PROXY_SECRET` | Railway와 **같은 값** | Production | 프록시가 `x-ask-proxy-secret` 헤더에 붙인다. Secret 타입(저장 후 읽기 불가)으로 넣는다. 값이 다르면 모든 요청이 403이다. |

- **Preview에는 넣지 않는 걸 권한다.** 넣으면 브랜치 미리보기도 운영 백엔드를 불러 같은 일일 상한(300)과 비용을 나눠 쓴다. 미리보기에서 패널을 봐야 할 때만 Preview에 따로 넣는다.
- `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 비밀이 브라우저 번들에 들어간다.

### 왜 재배포해야 하나

1. **Vercel은 환경변수 변경을 이전 배포에 적용하지 않고 새 배포에만 적용한다**(Vercel 문서). 값을 넣기만 하면 지금 떠 있는 사이트는 그대로다.
2. **패널 표시 여부가 빌드 시점에 HTML에 고정된다.** `ASK_ENABLED`는 레이아웃 모듈의 상수이고, 사이트 페이지(`/`, `/ai/*` 등)는 미리 렌더링된 정적 페이지다(`.next/prerender-manifest.json`에서 확인). `ASK_API_URL` 없이 빌드된 배포에는 패널이 없고, 재빌드해야 생긴다.
3. 프록시(`app/api/ask/route.ts`)도 `ASK_API_URL`·`ASK_PROXY_SECRET`을 모듈을 불러올 때 읽는다. 새 배포의 함수여야 새 값을 쓴다.

→ 환경변수를 넣은 뒤 **Production을 재배포**한다(Deployments → 최신 Production → Redeploy, 또는 main에 커밋 push).

## 4. 사이트 확인

1. `https://usetaehwan.page`에서 챗봇 패널 버튼이 보인다(재빌드 확인).
2. 브라우저나 curl로 `GET https://usetaehwan.page/api/ask`를 부르면 `remaining`·`llm`·`embedder` JSON이 온다. 403이면 비밀이 다르고, 503이면 `ASK_API_URL`이 틀렸다.
3. 패널에서 질문 1개: 단계 표시(분류 → 검색 → 판정 → 작성 → 검증) 뒤에 답과 출처가 나오고, 출처를 누르면 해당 섹션으로 간다.
4. Neon `ask_logs`에 메타 1행(원문 없음)이 생기고, `ask_usage_daily`가 1 늘었는지 본다.
5. 배포 확인에 쓴 질문 기록을 운영 수치에서 빼려면 `ask_logs`·`ask_usage_daily`·`ask_ip_daily`의 해당 행을 정리한다(스모크 때와 같은 방법).
