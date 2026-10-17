# 배포 체크리스트 — ask-server(Railway) + 사이트(Vercel)

> 2026-10-17 작성, 같은 날 첫 Railway 배포 실패 후 고침. Railway·Vercel 공식 문서와 이 저장소 코드를 확인하고 썼다. 값(키·비밀)은 여기에 적지 않는다.
> 대시보드 메뉴 이름은 문서 기준이라 실제 화면과 조금 다를 수 있다. 첫 배포 때 다르면 고친다.
> 순서: **배포 전 준비 → Railway → Railway 확인 → Vercel → 사이트 확인.** 앞 단계가 통과해야 다음으로 간다.

## 0. 배포 전 준비

- [ ] **Gemini 결제 활성화** (필수, D-22). 무료 등급은 입력을 Google이 제품 개선에 쓸 수 있는 약관이라, 방문자 질문을 보내면 안 된다. 분당 100건 한도도 함께 풀린다.
- [ ] **Anthropic 월 지출 한도**를 콘솔의 워크스페이스에 건다 (design §6).
- [ ] 검색 설정은 코드 기본값을 쓴다: `ASK_TOP_K` 8, `ASK_MIN_SCORE`는 `ASK_EMBEDDER=gemini`일 때 0.55(D-31). Railway에 따로 넣지 않는다.
- [ ] `denylist.txt`(또는 `ASK_DENYLIST`)를 채운 뒤 인제스트를 다시 돌린다. 로컬 `ask-server`에서 운영 `DATABASE_URL`로 실행한다. 컨테이너는 서빙만 하고 인제스트는 하지 않으므로, **denylist는 Railway에 필요 없다**(D-33).
- [ ] **배포할 코드가 GitHub의 배포 브랜치(main)에 있는지** 확인한다. Railway는 원격 브랜치를 빌드한다. 로컬에만 있는 커밋은 배포되지 않는다(첫 배포 실패 원인 중 하나).
- [ ] 비밀 두 개를 만든다. **없으면 Railway에서 서버가 뜨지 않는다**(D-27). 값은 비밀번호 관리자에 둔다.
  ```bash
  openssl rand -hex 32
  ```
  `ASK_PROXY_SECRET`(Railway·Vercel 같은 값)과 `ASK_IP_HASH_SECRET`(Railway만)에 하나씩 쓴다.

## 1. Railway 서비스 — 대시보드에서 직접 설정

**Config as Code(`railway.json`)는 쓰지 않는다.** Railway 문서에 "Config as Code is deprecated"라고 되어 있고, 기존 서비스의 설정 파일도 2026-12-01까지만 동작한다. 첫 배포에서는 파일의 헬스체크가 적용되지 않았다. 저장소의 `railway.json`은 지웠다(D-26 변경). 아래 항목을 서비스 Settings에서 직접 맞춘다. 메뉴 이름은 문서 기준이라 화면과 조금 다를 수 있다.

| 항목 | 값 | 어디서 | 왜 / 확인 |
|---|---|---|---|
| Source | 이 GitHub 저장소, 브랜치 `main` | Settings → Source | main에 머지된 코드만 배포된다. |
| **Root Directory** | `/ask-server` | Settings → Source | 이 디렉터리만 가져와 빌드한다. |
| **빌더** | Dockerfile | Settings → Build | Root Directory에 `Dockerfile`이 있으면 Railway가 Dockerfile 빌드를 쓴다. 빌드 로그에 `uv sync --frozen --no-dev` 단계가 보이면 맞다. 첫 배포 빌드는 성공했다. |
| **헬스체크 경로** | `/healthz` | Settings → Deploy → Healthcheck Path | 비워 두면 헬스체크 없이 바로 트래픽을 넘긴다. 이 경로를 넣어야 시작에 실패한 배포가 트래픽을 받지 않는다. 기본 타임아웃은 300초이고, 요청은 `healthcheck.railway.app`에서 `PORT`로 온다. |
| **리전** | 싱가포르 (Southeast Asia, `asia-southeast1-eqsg3a`) | Settings → Deploy → Regions | Neon이 `aws ap-southeast-1`(싱가포르)이다. 질문 하나에 DB 왕복이 여러 번이라 같은 리전에 둔다. 볼륨이 없어 리전 변경에 이전 작업이 없다. |
| **레플리카** | 1 | 리전 항목의 replica 수 | IP당 분당 한도(`MinuteWindow`)가 프로세스 메모리에 있다. 2개 이상이면 한도가 레플리카 수만큼 느슨해진다(D-26). |
| 재시작 정책 | On Failure (기본값) | Settings → Deploy | 설정 누락으로 종료하는 경우(D-27·D-32)에는 재시작해도 같은 이유로 다시 죽는다. 로그의 `CRITICAL` 줄을 보고 변수를 고친다. |
| 포트 | Railway가 넣는 `PORT` | — | `Dockerfile` CMD가 `${PORT:-8000}`을 쓴다. `PORT`는 직접 넣지 않는다. |
| 공개 도메인 | Generate Domain | Settings → Networking | 이 URL이 Vercel의 `ASK_API_URL`이 된다. |

설정을 코드로 다시 관리하려면, Railway가 권하는 Infrastructure as Code로 옮겨야 한다(문서의 "Migrating from Config as Code"). 지금은 항목이 적어서 대시보드 설정과 이 표로 관리한다.

### Railway 환경변수 (`ask/config.py` 기준 전체)

**필수**

| 이름 | 설명 |
|---|---|
| `DATABASE_URL` | Neon 연결 문자열(pooler 주소, `sslmode=require`). 서버가 뜰 때 마이그레이션을 돈다(전부 `if not exists`). **없거나 localhost면 서버가 뜨지 않는다**(D-32). 예전에는 개발용 기본값 `localhost:5433`으로 떨어져 30초 뒤 PoolTimeout으로 죽었다. |
| `ASK_LLM` | `anthropic`. 빠뜨리면 기본값 `fake`(규칙 기반 가짜 LLM)로 뜬다. |
| `ASK_EMBEDDER` | `gemini`. **인제스트한 임베더와 같아야 한다.** 다르면 검색 결과가 0건이다(임베딩 행이 모델별로 나뉨). 빠뜨리면 기본값 `hash`. |
| `ANTHROPIC_API_KEY` | 생성·분류·판정 (Haiku 5.5) |
| `GEMINI_API_KEY` | 질문 임베딩 (`gemini-embedding-001@768`) |
| `ASK_PROXY_SECRET` | Vercel 프록시만 통과시키는 공유 비밀(D-14). **없으면 서버가 뜨지 않는다**(D-27). |
| `ASK_IP_HASH_SECRET` | IP를 날짜와 섞어 HMAC으로 해시하는 비밀(D-19). **없거나 개발용 기본값 `dev-only-secret`이면 서버가 뜨지 않는다**(D-27). |

> **두 비밀이나 `DATABASE_URL`이 없으면 서버가 안 뜬다** (D-27, D-32). Railway에서는 `RAILWAY_ENVIRONMENT_ID`가 자동으로 들어오므로 항상 운영 모드다. 둘 중 하나라도 비었거나 `ASK_IP_HASH_SECRET`이 `dev-only-secret`이면, 서버는 시작 직후 `CRITICAL: 운영 모드(…)인데 필수 설정이 없어 서버를 시작하지 않습니다`와 빠진 항목을 로그에 찍고 종료 코드 1로 끝난다. 헬스체크가 실패해 배포가 실패로 표시되고, 이전 배포가 있으면 그대로 트래픽을 받는다. `ASK_ENV=development`로 이 검사를 끌 수는 없다.

**선택 (기본값이 있음)**

| 이름 | 기본값 | 설명 |
|---|---|---|
| `ASK_ANTHROPIC_MODEL` | `claude-haiku-5-5` | 생성 모델 |
| `ASK_TOP_K` | `8` | 검색 후보 수. 15도 재 봤지만 인용 정확도가 떨어져 8을 유지한다(D-31). |
| `ASK_MIN_SCORE` | gemini `0.55` · hash `0.15` | 검색 점수 하한. 임베더마다 점수 분포가 달라 기본값을 따로 둔다(D-31). 넣지 않는다. |
| `ASK_MAX_QUESTION_CHARS` | `300` | 질문 길이 상한. 바꾸면 `app/api/ask/route.ts`의 `MAX_CHARS`도 같이 바꾼다. |
| `ASK_PER_IP_PER_MINUTE` | `5` | IP당 분당 질문 수 |
| `ASK_PER_IP_PER_DAY` | `30` | IP당 일일 질문 수 |
| `ASK_DAILY_CAP` | `300` | 전체 일일 질문 수 |
| `ASK_PUBLIC_EMAILS` | `kt26625417@gmail.com` | 답에 내보내도 되는 이메일. 거절 안내문의 연락처로도 쓴다. |

**Railway에는 넣지 않는 것**: `PORT`·`RAILWAY_*`(Railway가 넣음), `ASK_ENV`(Railway에서는 필요 없음, 아래 참고), `ASK_DENYLIST`(인제스트 전용, D-33), `ASK_DENYLIST_PATH`(인제스트 전용·로컬), `VOYAGE_API_KEY`(voyage 임베더를 쓸 때만), `ASK_TEST_DATABASE_URL`(테스트 전용).

## 2. Railway 배포 확인 (Vercel 연결 전)

비밀은 명령줄 기록에 남지 않게 입력받아 쓴다.

```bash
read -rs ASK_PROXY_SECRET && export ASK_PROXY_SECRET
```

```bash
export ASK_URL=https://<railway-domain>
```

1. **배포 로그**: 빌드 성공 → `env: DATABASE_URL=있음 · ASK_PROXY_SECRET=있음 · … (환경변수 N개, RAILWAY_* M개)` → `ask-server mode=production (RAILWAY_ENVIRONMENT_ID) · db=…neon.tech · llm=anthropic · embedder=gemini · top_k=8 · min_score=0.55` → `Application startup complete` → 헬스체크 통과. `db=`가 neon 호스트인지 본다. `CRITICAL: … 서버를 시작하지 않습니다`가 보이면 메시지에 적힌 비밀을 넣고 다시 배포한다. 시작 단계에서 마이그레이션이 Neon에 붙으므로, 여기서 실패하면 `DATABASE_URL`을 의심한다.
2. **`/healthz`**: `{"ok":true}`가 와야 한다. 프로세스가 떠 있는지만 본다(DB·키는 보지 않는다).
   ```bash
   curl -s "$ASK_URL/healthz"
   ```
3. **비밀 없이 `/status`**: **403**이 와야 한다. 비밀 검사가 켜졌다는 뜻이다. 비밀이 비어 있으면 서버가 아예 뜨지 않으므로(D-27), 여기서 200이 나오면 안 된다. 나오면 운영 모드 판별을 의심한다(1번 로그의 `mode=`).
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

## 부록 — 운영/개발 모드 구분 (D-27)

| 조건 | 모드 | 비밀 검사 |
|---|---|---|
| `RAILWAY_ENVIRONMENT_ID`가 있음 (Railway가 모든 배포에 자동으로 넣음) | 운영 | 함 — `ASK_ENV` 값과 상관없음 |
| `ASK_ENV=production` | 운영 | 함 — 로컬 Docker로 운영 설정을 시험할 때 |
| 둘 다 없음, 또는 `ASK_ENV=development` | 개발 | 안 함 — 지금처럼 비밀 없이 뜬다 |
| `ASK_ENV`가 그 밖의 값(`prod` 등) | — | 오타가 조용히 개발 모드가 되지 않게 시작을 거부한다 |

서버를 시작할 때 `ask-server mode=… (근거)` 한 줄을 로그에 남긴다. 인제스트와 평가(`python -m ask.ingest`, `python -m ask.eval`)는 서버가 아니라서 이 검사를 거치지 않는다.

## 부록 — 첫 Railway 배포 실패 (2026-10-17)

**증상**: 빌드는 성공했다(Dockerfile, `/ask-server`). 실행하면 `localhost:5433`에 접속하려다 30초 뒤 PoolTimeout으로 죽고, 재시작을 반복했다. 리전은 US West였고 헬스체크가 없었다.

**원인**
1. **배포된 코드가 오늘 수정 전 버전이었다.** 오늘 커밋(7f81529~)이 GitHub main에 없었다. 그래서 비밀·DB 검사(D-27)도 커넥션 풀 수정(D-23)도 들어 있지 않았다.
2. **실행 중인 컨테이너에 `DATABASE_URL`이 없었다.** 코드는 정확히 `DATABASE_URL`이라는 이름을 읽고, 없으면 개발용 기본값 `localhost:5433`으로 떨어진다(로그와 일치). 변수 9개를 넣었다고 했으므로, 다음 중 하나로 보인다(대시보드를 직접 보지 못해 확정하지 못함).
   - 변수 변경이 아직 적용 대기 상태로, 배포에 반영되지 않음
   - 다른 서비스나 다른 환경(environment)에 넣음
   - 이름 오타나 앞뒤 공백
   - 공유 변수를 만들고 이 서비스에서 참조하지 않음
3. **`railway.json`이 적용되지 않았다.** 당시 main의 파일에는 헬스체크(`/healthz`)가 있었는데 배포에는 헬스체크가 없었다. 새 서비스가 지원 중단 대상이라서인지, config 경로(`/ask-server/railway.json`)를 지정하지 않아 못 찾아서인지는 구분하지 못했다. 리전은 main의 파일에 원래 지정이 없었으므로, 파일과 상관없이 기본 리전(US West)으로 떴다. 어느 쪽이든 이제 대시보드에서 설정한다(위 1절).

**이제는**: main에 오늘 코드가 들어가면 2번 상황에서 서버가 30초를 기다리지 않는다. 바로 `CRITICAL: … DATABASE_URL이 없습니다 …`를 찍고 끝난다. 헬스체크 경로를 넣었다면 그 배포는 트래픽을 받지 않는다.

## 부록 — PR #14 배포 후 "DATABASE_URL이 없습니다" (2026-10-17)

**증상**: 새 시작 검사가 "DATABASE_URL이 없습니다"로 종료했다. 두 비밀은 통과했다. Railway 서비스 변수 화면에는 `DATABASE_URL`(12자, 공백 없음, 값은 `postgresql://…`)이 있었다.

**코드 쪽 확인 결과 — 원인 아님**: 코드는 환경변수만 읽는다. `.env`를 불러오지 않고, 이미지 안에 `.env`도 없다. 같은 이미지에 `-e DATABASE_URL=…`을 주면 읽히고, 빼면 같은 메시지가 난다(D-32 변경). 즉 **그 배포의 프로세스 환경에 `DATABASE_URL`이 없었다.**

**다음 배포에서 볼 것** — 첫 줄 `env:`를 본다.
- `DATABASE_URL=없음`이고 "비슷한 이름의 변수가 있습니다: …" 경고가 나오면, 그 이름이 실제로 들어간 이름이다. ascii 표기라 보이지 않는 문자(`\u200b` 등)나 뒤 공백도 드러난다. 변수를 지우고 이름을 직접 타이핑해 다시 만든다.
- `DATABASE_URL=없음`이고 경고가 없으면, 플랫폼이 이 변수를 넣지 않은 것이다. 서비스 변수 화면에 적용 대기 중인 변경이 남아 있지 않은지 보고, 변수를 저장한 **뒤에** 새로 배포했는지(이전 배포를 다시 시작한 것이 아닌지) 확인한다. 변수를 Raw Editor로 지웠다 다시 넣는 것도 방법이다.
- `DATABASE_URL=비어 있음`이면, 값이 다른 변수 참조(`${{…}}`)로 되어 있다가 빈 값으로 풀린 것일 수 있다. 연결 문자열을 값으로 직접 넣는다.
- `RAILWAY_*` 개수가 1~2개뿐이면, 서비스 변수가 거의 주입되지 않은 비정상 배포다. 같은 줄의 다른 항목도 함께 본다.

