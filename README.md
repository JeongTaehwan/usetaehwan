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
| 주인 전용 | 스킬 후보의 요청 원문, 저장소 밖 스킬·에이전트 이름 | `public/dashboard-owner.enc.json` — AES-256-GCM 암호문 |

주인 전용 데이터는 **브라우저가 주인 키로 직접 풉니다.** 서버에는 비밀값도 로그인도 없습니다. 키는 PC의 `~/.claude/skill-audit/dashboard.key`에만 있고, 주인 링크(`/dashboard#k=...`)를 연 브라우저가 기억합니다. `#` 뒤는 서버로 전송되지 않으며, 저장소가 공개돼도 원문은 보이지 않습니다.

### 처음 한 번 — PC에서

```bash
npm run dashboard:setup
```

주인 키를 만들고, Claude Code SessionEnd 훅을 등록하고, 지금 한 번 갱신·push 한 뒤 주인 링크를 보여줍니다. 주인 링크를 기기마다 한 번 엽니다. 링크는 비밀번호처럼 다룹니다. 다시 보려면 `npm run dashboard:sync -- --link`.

### 그다음은 자동

Claude Code 세션이 끝날 때마다 훅이 `scripts/dashboard-auto.mjs`를 뒤에서 돌립니다.

- 작업 폴더는 건드리지 않습니다. `~/.claude/skill-audit/usetaehwan-sync`의 별도 사본에서 main 최신을 받아 데이터 파일 두 개만 커밋·push 합니다
- 6시간에 한 번까지만 돕니다(`DASHBOARD_AUTO_HOURS`). 바뀐 게 없으면 커밋하지 않습니다
- 기록은 `~/.claude/skill-audit/dashboard-auto.log`, 끄려면 `npm run dashboard:setup -- --uninstall`

손으로 돌리려면 `npm run dashboard:sync` 뒤 두 파일을 커밋·push 합니다. claude-skills는 `../claude-skills`, `~/workspace/claude-skills`, `~/claude-skills` 순으로 찾고, 다른 곳이면 `CLAUDE_SKILLS_DIR=<경로>`를 줍니다.

---

## 관련 링크

- **배포:** [usetaehwan.page](https://usetaehwan.page)
- **디자인 시스템:** [usetaehwan-ui](https://github.com/JeongTaehwan/usetaehwan-ui) · [ui.usetaehwan.page](https://ui.usetaehwan.page)
- **블로그:** [taepuwan.tistory.com](https://taepuwan.tistory.com/)

---

<sub>Taehwan Jeong · 프론트엔드 개발자 · Brooklyn loft, v3</sub>
