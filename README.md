# usetaehwan.page

**프론트엔드 개발자 정태환의 포트폴리오.**
v5(2026.10)는 한 번의 스크롤로 읽히는 단정한 문서형이 기본이고, v4의 두 화면 게임기 버전은 [`/play`](https://usetaehwan.page/play)에 그대로 남아 있습니다.

🔗 **[usetaehwan.page](https://usetaehwan.page)** · 🎮 **[usetaehwan.page/play](https://usetaehwan.page/play)**

---

## 두 버전

| | 기본 (`/`) | 게임기 (`/play`) |
|---|---|---|
| 형태 | 왼쪽 고정 열(이름·목차·연락처) + 오른쪽 본문 | 두 화면 폴더형 휴대용 기기 |
| 탐색 | 스크롤 · 목차가 읽는 위치를 따라감 | 방향키·ABXY · 터치 · 장면 해시 |
| 상세 | `/projects/[slug]` · `/ai/[slug]` · `/talks/[slug]` | `/play/projects/[slug]` … |
| 테마 | 시스템 라이트/다크 | 기기 색 5종 · 배경음 · 효과음 |

두 버전은 `app/_data`의 같은 원본을 읽고, 루트 레이아웃을 따로 씁니다(route group). 그래서 CSS·폰트·초기 스크립트가 서로 섞이지 않습니다.

- **기본 버전 UX.** 섹션 목차가 스크롤 위치를 따라가고(넓은 화면은 세로, 좁은 화면은 위에 붙는 가로), 긴 경력 문단은 세 줄만 보이다 펼칩니다. 상세 문서 끝에는 이전·다음 항목이 있고, 상단 막대에서 같은 항목의 게임기 화면으로 건너갈 수 있습니다.
- **옛 링크 보존.** 게임기 버전의 장면 해시(`/#dex`, `/#map` …)로 들어와도 기본 버전의 같은 섹션으로 갑니다.
- **접근성.** 본문 건너뛰기 링크, `aria-current` 목차, `focus-visible` 링, `prefers-reduced-motion`이면 부드러운 스크롤을 끕니다.

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack) · **TypeScript** · **Tailwind CSS v4** (`@theme` 토큰) · **Vercel**
- 폰트: Noto Sans KR · JetBrains Mono (기본) / Galmuri11 서브셋 (게임기) — next/font 자체 호스팅

---

## 폴더 구조

```
app/
├── (site)/              # 기본 버전 — layout · site.css · page · projects/ai/talks 상세 · not-found · OG 이미지
├── (play)/              # 게임기 버전 — layout · console.css · play/ 아래 홈과 상세
├── _site/               # 기본 버전 컴포넌트 (ui · nav · fonts)
├── _console/            # 게임기 본체 · 장면 · 픽셀 스프라이트 · 효과음/배경음
├── _data/               # projects · experience · talks · ai-practices · profile · links (두 버전 공용)
└── global-not-found.tsx # 어느 그룹에도 맞지 않는 주소의 404
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

게임기 버전 문구를 고친 뒤에는 Galmuri 서브셋을 다시 만듭니다: `python scripts/subset-fonts.py` (fonttools, brotli 필요)

---

## 관련 링크

- **배포:** [usetaehwan.page](https://usetaehwan.page)
- **디자인 시스템:** [usetaehwan-ui](https://github.com/JeongTaehwan/usetaehwan-ui) · [ui.usetaehwan.page](https://ui.usetaehwan.page)
- **블로그:** [taepuwan.tistory.com](https://taepuwan.tistory.com/)

---

<sub>Taehwan Jeong · 프론트엔드 개발자 · v5</sub>
