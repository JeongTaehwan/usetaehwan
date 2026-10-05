# usetaehwan.page

**브루클린 로프트에 차린 정태환의 사무실.**
개인 포트폴리오 사이트입니다. v3(2026.09)는 영화 '인턴'의 로프트 오피스를 무대로, 섹션이 곧 방입니다.

🔗 **[usetaehwan.page](https://usetaehwan.page)**

---

## 핵심 특징

- **방으로 걷는 구조.** Lobby(리셉션) → Study(About) → Projects(세 개의 문) → Skyline(Experience) → Meeting room(Talks) → Notebook(AI notes) → Window(Contact). 내비의 방 이름이 곧 앵커입니다.
- **Morning / Evening.** 다크 모드 대신 시간대. 저녁이면 창밖이 노을로 바뀌고 스탠드가 켜집니다.
- **문 너머의 세계.** 프로젝트 문을 누르면 걸어 들어가는 전환 뒤 그 프로젝트의 세계로 갑니다 — 보관소(디자인 시스템) · 경기장(각) · 천문대(Orbit). 관중 시점이고, 상세 페이지는 그 세계의 종이 위에 이어집니다.
- **스카이라인.** 경력은 창밖 건물입니다. x = 시작 시점, 폭 = 기간, 높이 = 머지된 MR 수. 건물을 고르면 창에 불이 켜지고 기록이 열립니다.
- **이미지 없는 사실감.** 나무결·벽돌·회벽·잔디는 SVG 노이즈 텍스처, 조명은 접촉 그림자와 빛기둥, 마감은 그레이딩·비네트·그레인. 커서를 따라 빛이 게으르게 움직입니다.
- **접근성.** `prefers-reduced-motion`이면 커서 빛·패럴랙스·전환이 꺼지고, 모든 인터랙션은 키보드로 됩니다.

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack) · **TypeScript** · **Tailwind CSS v4** (`@theme` 토큰) · **Framer Motion** · **Vercel**
- 폰트: Libre Caslon Text · 나눔명조 · Karla · Noto Sans KR (next/font 자체 호스팅)

---

## 폴더 구조

```
app/
├── globals.css          # 토큰(Morning/Evening) · 세계 팔레트 · 재질 유틸리티 · 마감
├── _loft/               # Nav · TimeToggle · Reception · rooms/ · scene/ · worlds/
├── _data/               # projects · experience(MR 수 포함) · talks · ai-practices
├── projects/[slug]      # 세계 히어로 + Full drawing
├── ai/[slug] · talks/[slug]
└── page.tsx             # 방 일곱 개
```

---

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 뜨면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

```bash
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
```

---

## 스킬 대시보드 (`/dashboard`)

[claude-skills](https://github.com/JeongTaehwan/claude-skills)의 대시보드를 사이트에 옮긴 화면입니다. 누구나 보는 숫자와, 주인만 보는 상세를 나눕니다.

| 구분 | 내용 | 어디에 있나 |
|---|---|---|
| 공개 | 사용 순위(저장소 스킬·에이전트만), 매 턴 실리는 글자, 레퍼런스 온톨로지, 모델·프로필 | `app/_data/dashboard/public.json` — 평문 |
| 주인 전용 | 스킬 후보의 요청 원문, 저장소 밖 스킬·에이전트 이름 | `app/_data/dashboard/private.enc.json` — AES-256-GCM 암호문 |

주인 전용 데이터는 서버가 GitHub 로그인으로 계정 id를 확인한 뒤에만 복호화해 보냅니다. 저장소가 공개돼도 원문은 보이지 않습니다.

### 처음 한 번 — 주인 인증 켜기

1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
   - Homepage URL: `https://usetaehwan.page`
   - Authorization callback URL: `https://usetaehwan.page/api/auth/github/callback`
2. PC에서 데이터 키를 만든다. `.env.local`에 저장되고 화면에 같은 값이 나온다.
   ```bash
   npm run dashboard:sync -- --gen-key
   ```
3. 세션 서명 키를 만든다: `openssl rand -hex 32`
4. Vercel → Project → Settings → Environment Variables (Production)에 넣고 다시 배포한다.

| 이름 | 값 |
|---|---|
| `GITHUB_CLIENT_ID` · `GITHUB_CLIENT_SECRET` | 1번 OAuth App |
| `DASHBOARD_SESSION_SECRET` | 3번 값 (32자 이상) |
| `DASHBOARD_DATA_KEY` | 2번 값 — PC의 `.env.local`과 **같아야** 한다 |

하나라도 없으면 주인 인증은 꺼진 채로 닫힙니다. 콜백 주소가 운영 도메인 하나라서 로그인은 운영 사이트에서만 됩니다.

### 숫자 갱신

```bash
npm run dashboard:sync            # 전체 기간 (-- --days 30 으로 최근 30일)
git add app/_data/dashboard && git commit -m "대시보드 갱신" && git push
```

기록 원본은 PC의 `~/.claude`라서 기록이 있는 PC에서 돌립니다. claude-skills가 `../claude-skills`에 없으면 `.env.local`에 `CLAUDE_SKILLS_DIR=<경로>`를 적습니다.

---

## 관련 링크

- **배포:** [usetaehwan.page](https://usetaehwan.page)
- **디자인 시스템:** [usetaehwan-ui](https://github.com/JeongTaehwan/usetaehwan-ui) · [ui.usetaehwan.page](https://ui.usetaehwan.page)
- **블로그:** [taepuwan.tistory.com](https://taepuwan.tistory.com/)

---

<sub>Taehwan Jeong · 프론트엔드 개발자 · Brooklyn loft, v3</sub>
