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

## 디자인 v4 · DS형 두 화면 포트폴리오 (2026-09)

- 컨셉은 두 화면 폴더형 휴대용 기기 하나. 블랙/화이트 시대의 대화창·메뉴 관용구를 오마주하며 공식 상표, 캐릭터, BGM은 사용하지 않는다. 기기 각인은 useTaehwan().
- 위 화면은 인사·프로젝트 상세 미리보기·트레이너 카드·경력 지도·AI 규칙·발표 기록. 아래 화면은 선택 목록과 긴 본문. 메뉴만 어두운 청록, 본문은 밝은 화면이다.
- 데스크톱은 두 화면을 세로로 유지하고 스피커·D-pad·ABXY를 옆에 둔다. 모바일 세로는 조작부를 아래로, 가로는 축소한다. stage의 minmax(0,1fr) 그리드를 유지한다.
- 장면 선택은 빈 앵커와 CSS :has(:target)로 처리한다. JS는 첫 페인트의 장면을 고르지 않는다. 이전 해시는 common.tsx에서 변환한다. 상세에서 /#dex 등으로 돌아갈 때 일반 a로 전체 이동한다.
- 아래 화면 data-preview와 console:cursor 이벤트가 위 화면 미리보기를 바꾼다. 방향키는 화면 밖 대상까지 이동·스크롤한다. 메뉴로 복귀하면 이전 항목을 기억한다.
- A/Z/Enter 결정, B/X/Esc/Backspace 뒤로, X/START/S 메뉴, Y/M 효과음, SELECT/C 기기 색. 인사에선 A로 대화를 넘기고 방향키·호버로 메뉴 선택을 시작한다. 링크에 포커스된 Enter는 기본 동작을 보존한다.
- 효과음은 기본 꺼짐. Web Audio로 이동·결정·취소음을 합성한다. 기기 색 5종과 소리 설정은 html 속성 + localStorage가 원본이며 useSyncExternalStore로 구독한다.
- 부팅 이벤트와 타이머는 init-script.ts에서 hydration 이전부터 처리한다. 해시 없는 첫 홈 방문에 세션당 한 번, 2.6초 또는 첫 입력으로 종료한다. reduced-motion이면 생략한다.
- 색은 globals.css @theme 토큰, 프로젝트 히어로만 원본 palette.swatches를 쓴다. 커스텀 클래스는 @layer components. 화면 안 반응형은 screen 컨테이너 쿼리로 처리한다.
- Galmuri는 app/_fonts의 서브셋을 사용한다(Regular 약 16.8KB, Bold 약 15.2KB). 문구 수정 후 scripts/subset-fonts.py로 재생성한다. OFL 라이선스를 함께 보관한다.
- UI·제목·대화창은 Galmuri11, 긴 본문은 .body-kr(Noto Sans KR). next/font 변수 클래스는 html에 둔다.
- 콘텐츠 원본 app/_data는 수정하지 않는다. EXP는 실제 mr에 비례하며 Lv.4는 4년차를 뜻한다. 이메일은 링크에만 둔다.
- 소개 카드 사진 자리에는 오리지널 픽셀 초상화를 사용한다. 실제 인물 사진은 제공받지 않았으며 공개 GitHub 아바타는 드럼 그림이므로 사용하지 않는다.

### 코드 위치

- app/globals.css: 토큰·본체·두 화면·장면 선택·컨테이너/뷰포트 대응
- app/_console/Console.tsx: 본체·키보드·커서·스크롤·미리보기 이벤트
- app/_console/HomeGame.tsx: 장면 구성·옛 해시·복귀 커서·부팅 화면
- app/_console/scenes/: Menu, Dex, Trainer, TownMap, Notes, Caster, LinkCable, Settings, Previews
- app/_console/{Pixel,ui,prefs,init-script,sfx}: 픽셀 아이콘·공통 UI·영속 설정·초기 페인트·합성 효과음
- app/projects/[slug], app/ai/[slug], app/talks/[slug], app/not-found.tsx: 같은 본체를 쓰는 상세 화면
- app/opengraph-image.tsx, app/icon.svg: 두 화면 기기 공유 이미지·아이콘
- app/dashboard, app/api/dashboard/private, app/api/auth/{github,github/callback,logout}, app/_lib/dashboard-auth.ts: 스킬 대시보드와 주인 인증(GitHub OAuth, 서명 쿠키, 서버 복호화). 환경 변수가 없으면 인증은 꺼진 채로 닫힌다
- app/_data/dashboard/: scripts/dashboard-sync.mjs 가 만든다(`npm run dashboard:sync`). 손으로 고치지 않는다. private.enc.json 은 암호문만 둔다

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