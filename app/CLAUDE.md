# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트를 작업할 때 참조하는 컨텍스트 문서입니다.

---

## 프로젝트 개요

**`usetaehwan.page`** — 프론트엔드 개발자 정태환의 개인 포트폴리오 사이트.

- **브랜딩:** `useTaehwan()` — React 훅 컨셉의 언어유희
- **스택:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + Vercel
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

## 절대 규칙 (추출 가능성 유지)

`design-system/` 폴더는 나중에 통째로 들어내 별도 패키지가 된다. 그래서:

1. **`design-system/`은 사이트 코드를 절대 import 하지 않는다.**
   의존은 단방향. 사이트 → 시스템은 OK. 시스템 → 사이트는 금지.

2. **색·간격 하드코딩 금지.**
   반드시 토큰(Tailwind 유틸리티)만 참조. `bg-[#A55E45]` 같은 임의값 금지.

3. **`next/*` 의존 금지.**
   `next/link`, `next/image` 등을 시스템 컴포넌트 안에서 쓰지 않는다. 순수 React만.
   (나중에 Vite 등 다른 환경에서도 써야 하므로)

---

## 폴더 구조

```
usetaehwan/
├── app/                      # 사이트 (Next.js)
│   ├── globals.css           # @import tailwindcss + tokens.css
│   ├── layout.tsx            # 폰트 로드 (Hanken/Instrument/JetBrains + Pretendard)
│   └── page.tsx
├── design-system/            # ← 추출 대상 영역
│   ├── tokens/
│   │   └── tokens.css        # @theme 토큰 정의
│   ├── components/           # Button, Input, Card, Badge, Typography, Container
│   └── index.ts              # 배럴 익스포트
├── package.json
└── tsconfig.json             # paths: { "@/*": ["./*"] }
```

---

## 디자인 시스템

### 톤 & 무드

**저채도 웜 뉴트럴.** 가을 느낌의 흐릿하고 차분한 색감.
- 터미널·해커 클리셰 배제 (고채도 대비, 순검정 배경, 모노스페이스 남발 금지)
- 딱딱한 개발자 사이트가 아닌, 따뜻하고 편안한 프로덕트 톤
- 세리프 헤딩(Instrument Serif)으로 에디토리얼한 인상

### 토큰 (design-system/tokens/tokens.css)

- **베이스:** 크림/베이지 계열 (`--color-bg: #FDFBF7`)
- **브랜드:** 흐린 벽돌색 (`--color-brand: #A55E45`)
- **다크모드:** 순검정 금지. 웜 브라운 그레이 (`#201D19`)
- **폰트:** Instrument Serif(헤딩) / Hanken Grotesk(본문) / JetBrains Mono(코드) / Pretendard(한글)
- **스페이싱:** 4px 그리드
- **라운드:** sm 6 / md 10 / lg 16 / full
- **섀도우:** 3단계, 웜 틴트, 아주 은은하게

### 원칙

- **과하게 만들지 않는다.** 색 50단계, 섀도우 8종 같은 건 만들지 않는다. 실제로 쓸 것만.
- **필요해지면 추가한다.** Style Dictionary, Storybook, Figma 연동 — 전부 지금은 안 쓴다. 개인 프로젝트에서는 오버헤드. 코드가 SSOT.
- **시맨틱 네이밍.** `--color-red`가 아니라 `--color-brand`, `--color-danger`.

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
- `design-system/` 폴더 구조 + 3규칙 확립
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

- **Tailwind v4 preflight**가 `--default-font-family`를 사용하므로, `@theme`에서 이 변수를 `var(--font-sans)`로 덮어야 폰트가 적용됨. (겪었던 함정)
- **`--color-fg-muted: #8A8577`** 은 크림 배경에서 WCAG AA(4.5:1) 미달 가능성. 캡션·힌트 전용으로만 사용할 것. 본문에 쓰지 말 것.
- ~~**다크모드 미검증.**~~ 검증 완료 — `.dark` 클래스 방식이 v4에서 정상 동작.
  유틸리티가 `var(--color-*)`를 참조하므로 `.dark`에서 토큰 값만 덮으면 전체가 따라온다.
  (`text-on-brand` 토큰으로 채움 버튼 글자색을 라이트/다크 각각 AA 대비로 유지)

---

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