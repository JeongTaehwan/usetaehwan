# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트를 작업할 때 참조하는 컨텍스트 문서입니다.

---

## 프로젝트 개요

**`usetaehwan.page`** — 프론트엔드 개발자 정태환의 개인 포트폴리오 사이트.

- **브랜딩:** `useTaehwan()` — React 훅 컨셉의 언어유희
- **스택:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + Framer Motion + Vercel (v2부터 디자인 시스템 패키지 미사용)
- **도메인:** `usetaehwan.page` (구매·연결 완료, push 시 자동 배포)
- **레포:** `JeongTaehwan/usetaehwan` (현재 private, 완성 후 public 전환 예정)

### 이 프로젝트의 목적

단순 포트폴리오가 아니라 **이직 준비 프로젝트**의 핵심 산출물.
2026년 9월 병역특례 종료 → 회사 재계약 또는 이직 결정. 그 전에 보여줄 결과물 세트를 만드는 것이 목표.

### 타겟 포지션

- React 중심의 새 작업 + Vue 실무 깊이(3년+)를 동시에 어필
- 회사 유형은 넓게 열어두되, **결과물의 바(bar)는 높게**: 배포 + 테스트 + 문서
- 차별점: **AI 툴(Claude Code, Claude Design)을 실무 워크플로우에 통합하는 개발자**

---

## 핵심 전략 (이 프로젝트의 전부)

```
디자인 시스템 MVP
    ↓ (첫 소비처)
개인 사이트 (usetaehwan.page)
    ↓ (검증 후 추출)
별도 패키지로 분리
    ↓ (재사용)
프로젝트 1~2개
    ↓ (전 과정 기록)
티스토리 블로그
```

**왜 이 순서인가:**
디자인 시스템을 처음부터 별도 패키지로 만들지 않는다. 아직 무엇이 필요한지 모르는 상태에서 API를 고정하면 거의 항상 틀리기 때문. 사이트를 만들면서 실사용으로 API를 검증하고, 그다음에 추출한다. 이 과정 자체가 포트폴리오의 서사가 된다.

---

## 디자인: 도면(drafting sheet) 테마 — 디자인 시스템을 쓰지 않는다 (v2, 2026-09)

v2에서 사이트는 `@usetaehwan/ui`를 **더 이상 설치·사용하지 않는다.** 디자인 시스템은 프로젝트 목록의 한 항목(Detail A)이자 Orbit·각(Gak)의 소비 대상으로만 남는다. 시스템 자체는 별도 저장소 [`usetaehwan-ui`](https://github.com/JeongTaehwan/usetaehwan-ui)에서 관리한다.

### 컨셉

- 사이트 전체가 **한 세트의 기술 도면**이다. 홈의 섹션 = Sheet 01~06, 프로젝트 = Detail A/B/C, 작업 사례 = 단면도 A-1…, AI 활용 = General notes, Contact = 승인란.
- 라이트 = **Paper**(미색 제도 용지 + 옅은 청색 격자 + 남색 잉크 + 적색 마킹), 다크 = **Blueprint**(프러시안 블루 + 흰 선 + 황색 마킹). 토글 라벨도 Paper / Blueprint.
- 내비게이션은 상단 바가 아니라 **우하단 표제란(TitleBlock)**. 데스크톱은 hover/focus로 펼쳐지고 모바일은 하단 띠 + 드로어.
- **프로젝트별 팔레트.** 각 프로젝트가 실제로 쓰는 색(`.theme-<slug>`)이 홈 카드와 상세 페이지에 그대로 입혀진다. 카드의 "전체 도면에 입히기"를 누르면 `html.theme-<slug>`가 켜져 사이트 전체가 그 팔레트로 바뀐다. Paper/Blueprint와 독립.

### 구조

```
app/
├── globals.css          # @theme 토큰(paper/ink/line/grid/mark) · .dark · 제도 유틸리티(@layer components) · .theme-<slug>
├── _ui/                 # 로컬 프리미티브 — Sheet/SubHead/Rows · Label · Dim(치수선) · Stamp · Marker · Btn · Reveal/Rule · palette(html.classList 스토어)
├── _components/         # Hero · TitleBlock(내비) · ThemeToggle · Palette(Swatches/PaletteBleed/PaletteScope/PaletteLegend) · SubpageFrame
└── _data/               # projects(palette 필드 포함) · talks · ai-practices
```

### 지킬 것

- 색은 반드시 `globals.css` 토큰만 쓴다 (`text-ink`, `border-line`, `text-mark`, `bg-paper` …). 임의 hex 금지 — 예외는 `_data/projects.ts`의 `palette.swatches`(실제 프로젝트 색 표시용)와 `opengraph-image.tsx`(CSS 변수 사용 불가).
- 커스텀 클래스(`.label`, `.display`, `.sheet`, `.prose-draft` 등)는 `@layer components` 안에 둔다. 밖에 두면 Tailwind 유틸리티가 덮어쓰지 못한다 (겪은 함정).
- 프로젝트별 팔레트를 추가할 때는 `globals.css`의 `.theme-<slug>`와 `projects.ts`의 `palette`를 함께 만든다. 어두운 팔레트는 `--scheme: dark; color-scheme: dark`를 같이 준다.
- 테마/팔레트 상태의 진실은 `html.classList`(`.dark`, `.theme-*`)다. React state로 복제하지 말고 `_ui/palette.ts`의 `useDark/usePalette/setDark/setPalette`를 쓴다.
- 폰트: Space Grotesk(디스플레이) · IBM Plex Mono(주기·수치) · Pretendard(한글 본문, CDN).
- 모션은 Reveal(fade+12px)과 Rule(선 긋기)만. reduced-motion이면 MotionConfig가 이동을 제거한다.
- **십자선 커서**(`_components/Crosshair.tsx`): 기본 꺼짐. 마우스 환경에서 표제란 ✛ 버튼으로 켜면 localStorage `crosshair=on`, 상태는 `html.no-crosshair` 클래스. React state 없이 rAF로 transform만 갱신한다. 좌표는 8px 격자 1칸 = 1.
- 커버·상세 시트의 존 마커(`.zones`)와 상단 띠(Drawing no. / Sheet / Scale / Rev)는 모든 도면에 같은 형식으로 둔다. 푸터의 REV 표(`SITE_REVISIONS`)는 사이트 자체의 개정 이력이며 큰 재설계 때마다 한 줄 추가한다.
- 인쇄(`@media print`)는 흰 종이 + 잉크만. 표제란·헤더는 `data-print="hide"`로 숨긴다.

---

## 11주 일정 (2026-07-07 ~ 09-22)

| 주차 | 기간 | 내용 | 상태 |
|---|---|---|---|
| W1 | 7/7–7/13 | 세팅 (도메인, 레포, Vercel, 파이프라인) | ✅ 완료 |
| W2 | 7/14–7/20 | 디자인 시스템: 토큰 | ✅ 완료 (앞당김) |
| W3 | 7/21–7/27 | 디자인 시스템: 컴포넌트 | 🔄 진행 중 |
| W4 | 7/28–8/3 | 개인 사이트: 골격 | |
| W5 | 8/4–8/10 | 개인 사이트: 콘텐츠 & 배포 | |
| W6 | 8/11–8/17 | 프로젝트 1: 기획 & 골격 | |
| W7 | 8/18–8/24 | 프로젝트 1: 핵심 기능 (+ 시스템에 컴포넌트 역추가) | |
| W8 | 8/25–8/31 | 프로젝트 1: 마감 & 배포 | |
| W9 | 9/1–9/7 | 버퍼 / 이력서 | |
| W10 | 9/8–9/14 | 포폴 콘텐츠 / 이력서 2차 | |
| W11 | 9/15–9/22 | 마무리 & 통합 (깃허브 README, 최종 QA) | |

**작업 리듬:** 주 4일, 회당 2~2.5시간 (회사 다니면서 진행)

---

## 완료된 것

- 도메인 구매 + Vercel 연결 (`git push` → 자동 배포)
- 깃허브 정리 (public: `TIL`, `JeongTaehwan` 프로필 레포만)
- `design-system/` 폴더 구조 + 3규칙 확립 → **`@usetaehwan/ui@0.1.0`으로 추출·npm 배포 완료** (이 저장소는 패키지를 소비)
- 토큰 시스템 구축 (컬러/타이포/스페이싱/라운드/섀도우)
- 폰트 연결 (한글 Pretendard fallback 포함)
- 블로그 1편 원고 작성
- 코어 컴포넌트 6개 (Button/Input/Card/Badge/Typography/Container) + `cn` 유틸(clsx+tailwind-merge)
- 다크모드 (`@custom-variant dark` + `.dark` 토큰 오버라이드 + FOUC 방지 스크립트 + ThemeToggle)
- 컴포넌트 쇼케이스 페이지(`app/page.tsx`)로 검증 — build/tsc/런타임 통과

## 다음 할 것

1. 사이트 골격 → 콘텐츠 → 배포
2. 시스템 소비 프로젝트 1~2개
3. **계획된 기능:** 사이트에 "나에 대해 물어보면 답해주는 LLM 챗봇" (RAG 기반)

---

## 알려진 이슈 / 주의사항

- **Tailwind v4 preflight**가 `--default-font-family`를 사용하므로, `@theme`에서 이 변수를 `var(--font-body)`로 덮어야 폰트가 적용됨. (겪었던 함정)
- `--color-ink-3`는 보조 주기 전용. 본문에는 `ink-2` 이상을 쓴다.
- 다크(Blueprint)는 `.dark` 클래스에서 토큰만 덮는다. 유틸리티가 `var(--color-*)`를 참조하므로 전체가 따라온다.
- Framer Motion의 `initial opacity:0`은 SSR HTML에도 들어간다. 헤드리스 캡처는 rAF가 돌지 않으면 빈 화면이 나오므로 Playwright로 스크롤 후 찍는다.
- 모바일 가로 넘침 주의: 격자 자식은 `min-w-0`, 본문은 `overflow-wrap: anywhere`(globals.css). 치수선(`Dim`) 텍스트에 `whitespace-nowrap`을 주지 말 것.

## 코딩 스타일

- 코드 수정 요청 시 **부분 diff가 아니라 전체 코드**를 반환할 것 (사용자 선호)
- 컴포넌트는 native HTML 속성 상속 + `...props` 스프레드
- `className` prop 지원 (외부에서 덮어쓸 수 있게). `clsx` + `tailwind-merge` 사용
- 포커스는 `focus-visible` 사용 (마우스 클릭 시 링 안 뜨게)
- 과한 애니메이션 금지. `transition-colors` 정도만
- 접근성 챙길 것 (`aria-invalid`, `aria-describedby` 등)

---

## 이 프로젝트에서 하지 않는 것

- ❌ Figma 연동 / Code Connect — 디자이너가 없으므로 불필요. 코드가 SSOT
- ❌ Style Dictionary — 웹만 타겟이므로 Tailwind `@theme`으로 충분
- ❌ Storybook — 검증 페이지로 대체. 필요해지면 그때 추가
- ❌ 모노레포 — 지금은 단일 레포. 추출 시점에 재검토
- ❌ 과도한 추상화 — 두 달 안에 "보여줄 수 있는 결과물"이 목표. 완벽한 시스템이 목표가 아님