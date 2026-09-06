# usetaehwan.page

**정태환이라는 엔지니어의 기술 도면.**
개인 포트폴리오 사이트입니다. v2(2026.09)부터 사이트 전체를 한 세트의 **제도 도면(drafting sheet)** 으로 구성했습니다.

🔗 **[usetaehwan.page](https://usetaehwan.page)**

---

## 핵심 특징

- **도면 메타포.** 섹션은 Sheet 01–06, 프로젝트는 Detail A/B/C, 작업 사례는 단면도 A-1…, AI 활용은 General notes, Contact는 승인란. 실측 수치는 치수선(↔)으로 표기합니다.
- **Paper / Blueprint.** 라이트는 미색 제도 용지에 청색 격자와 남색 잉크·적색 마킹, 다크는 프러시안 블루 청사진에 흰 선·황색 마킹.
- **표제란 내비게이션.** 상단 바 대신 도면 우하단 표제란(title block)이 목차·테마·링크를 담습니다. 스크롤 스파이로 현재 Sheet 번호가 갱신됩니다.
- **프로젝트별 팔레트.** 각 프로젝트가 실제로 쓰는 색(웜 뉴트럴 · 볼트 나이트 · 딥 스페이스)이 홈 카드와 상세 페이지에 그대로 입혀지고, "전체 도면에 입히기"를 누르면 사이트 전체가 그 팔레트로 바뀝니다.
- **디자인 시스템 없이.** v1은 자체 디자인 시스템 [`@usetaehwan/ui`](https://github.com/JeongTaehwan/usetaehwan-ui)의 첫 소비처였고, 검증·추출이 끝난 v2는 `app/_ui`의 로컬 프리미티브와 `globals.css` 토큰만으로 그립니다. 시스템은 Orbit·각(Gak)이 씁니다.
- **CAD 커서.** 표제란의 ✛를 켜면 십자선과 격자 좌표(X/Y)가 커서를 따라다닙니다(기본 꺼짐). 인쇄하면 표제란·십자선이 빠지고 흰 종이에 잉크만 남습니다.
- **절제된 모션, 접근성.** 스크롤 진입 fade와 선 긋기만. `prefers-reduced-motion`이면 이동이 사라집니다.

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack) · **TypeScript** · **Tailwind CSS v4** (`@theme` 토큰) · **Framer Motion** · **Vercel**
- 폰트: Space Grotesk · IBM Plex Mono · Pretendard

---

## 폴더 구조

```
app/
├── globals.css          # 토큰(paper/ink/line/grid/mark) · Paper/Blueprint · 제도 유틸리티 · 프로젝트별 팔레트(.theme-*)
├── _ui/                 # Sheet · Label · Dim · Stamp · Marker · Btn · Reveal · palette 스토어
├── _components/         # Hero · TitleBlock · ThemeToggle · Palette · SubpageFrame
├── _data/               # projects · talks · ai-practices
├── projects/[slug]      # 상세 도면 — 해당 프로젝트 팔레트로 렌더
├── ai/[slug] · talks/[slug]
└── page.tsx             # Sheet 01–06
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

## 관련 링크

- **배포:** [usetaehwan.page](https://usetaehwan.page)
- **디자인 시스템:** [usetaehwan-ui](https://github.com/JeongTaehwan/usetaehwan-ui) · [ui.usetaehwan.page](https://ui.usetaehwan.page)
- **블로그:** [taepuwan.tistory.com](https://taepuwan.tistory.com/)

---

<sub>Drawn by Taehwan Jeong · 프론트엔드 개발자 · Drawing UT-2026-01 · Rev 2.0</sub>
