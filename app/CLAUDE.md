# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트를 작업할 때 참조하는 컨텍스트 문서입니다.

---

## 프로젝트 개요

**`usetaehwan.page`** — 프론트엔드 개발자 정태환의 개인 포트폴리오 사이트.

- **브랜딩:** `useTaehwan()` — React 훅 컨셉의 언어유희
- **스택:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + Framer Motion + Vercel (디자인 시스템 패키지 미사용)
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

## 디자인 v3 · 브루클린 로프트 (2026-09)

시안: claude.ai/code/artifact/6ee20412-f026-48f3-a935-15bd2620f019 (Office · Project worlds · Project detail · Mobile).

- 컨셉: 영화 '인턴'의 브루클린 로프트 오피스. 섹션 = 방 — Lobby(리셉션) · Study(About) · Projects(세 개의 문) · Skyline(Experience) · Meeting room(Talks) · Notebook(AI notes) · Window(Contact). 내비의 방 이름이 곧 앵커.
- 프로젝트는 문 너머의 세계로 간다 — A 보관소(useTaehwan()/ui) · B 경기장(각) · C 천문대(Orbit). 시점은 관중. 문을 누르면 '걸어 들어가는' 전환(0.8s) 뒤 `/projects/[slug]`. 상세는 세계가 히어로, 아래로 그 세계의 종이 위에 개요 → 작업 사례(문제·파악·해결) → 핵심 기능 → 스택.
- 시간대: Morning / Evening. 진실은 `html.dark`(= Evening) — `_ui/palette.ts` 의 `useDark/setDark`. 인사말·시계·햇빛/램프만 JS로 갈리고 나머지는 토큰이 바꾼다.
- 스카이라인: 건물 = 경력 한 시기. x = 시작, 폭 = 기간, 높이 = 머지된 MR 수(`_data/experience.ts` 의 `mr`). 361·132·178·188은 본문과 같은 값, 62·152·642는 MR 목록에서 키워드 집계.

### 코드 위치

```
app/
├── globals.css          # @theme 토큰(wall/ink/wood/brass/paper/sky) · .dark · .world-* 팔레트 · 재질 유틸(.brick/.floor/.wood/.glass/.paper) · 마감(.grain/.grade/.vignette) · .scene-fit
├── _loft/
│   ├── Nav.tsx · TimeToggle.tsx · LoftPage.tsx(상세 껍데기) · Ambient.tsx(CursorLight · Parallax · SceneFit)
│   ├── Reception.tsx · rooms/{Study,Corridor,Skyline,MeetingRoom,Notebook,WindowRoom}.tsx
│   ├── scene/primitives.tsx   # ArchWindow · Plant · BrassPlate · FloorLamp · ContactShadow · SceneFinish · RoomCaption
│   └── worlds/{worlds.css,scenes.tsx}   # 1440×900 고정 장면 3종 + WORLDS 매핑
├── _data/               # projects(팔레트 필드 없음) · experience(mr 포함) · talks · ai-practices
└── projects/[slug] · ai/[slug] · talks/[slug]
```

### 지킬 것

- 색은 `globals.css` 토큰만 (`text-ink`, `bg-wall`, `border-line`, `text-brass`, `text-accent` …). 세계 안에서는 `var(--w-*)`. 종이(.paper) 위 글자는 시간대와 무관하게 `#2b2622`/`#5c534a` 고정.
- 서체: `.caslon`(영문 제목) · `.myeongjo`(한글 제목) · `.karla`/`.caps`(라벨) · 본문 Noto Sans KR. **next/font 변수 클래스는 `<html>`에 둔다** — `@theme` 토큰이 `var(--font-*-next)`를 참조하므로 루트에 없으면 서체가 전부 시스템 폰트로 떨어진다(겪은 함정).
- 세계 장면은 1440×900 고정 캔버스. 컨테이너에 맞추려면 `SceneFit`으로 감싼다 — CSS만으로는 길이를 배율로 바꿀 수 없어 ResizeObserver가 `--s`를 준다(겪은 함정: `scale(max(100cqw/1440, …))`는 무효).
- 커스텀 클래스는 `@layer components` 안에. 밖에 두면 Tailwind 유틸리티가 덮어쓰지 못한다.
- 모션은 Framer Motion 진입 스태거·페이지 넘김·걸어 들어가기뿐. `prefers-reduced-motion`이면 CursorLight·Parallax·전환이 꺼진다.
- 실측 수치 외의 숫자를 만들지 않는다. 시계(09:12 / 19:48)는 연출.

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

- **Tailwind v4 preflight**가 `--default-font-family`를 쓰므로 `@theme`에서 `var(--font-noto)`로 덮는다.
- 헤드리스 캡처는 Framer Motion 진입 애니메이션 때문에 빈 화면이 나올 수 있다 — Playwright로 스크롤·대기 후 찍는다.
- 모바일 가로 넘침: 격자 자식은 `min-w-0`, 본문은 `[word-break:keep-all]` + 전역 `overflow-wrap: anywhere`.

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