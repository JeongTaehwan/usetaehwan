# usetaehwan.page

**정태환이라는 라이브러리의 공식 문서.**
개인 포트폴리오 사이트이자, 사이트 전체를 자체 제작 디자인 시스템 `useTaehwan()/ui`로 구축한 프로젝트입니다.

🔗 **[usetaehwan.page](https://usetaehwan.page)**

> 좋은 코드는 잘 쓴 문서와 닮았다는 생각에서 출발했습니다. 그래서 이 사이트는 포트폴리오이면서, 동시에 그 자체로 하나의 문서처럼 읽히도록 만들었습니다.

---

## 핵심 특징

- **자체 디자인 시스템으로 사이트 전체를 구축.** `useTaehwan()/ui`는 이 사이트를 위해 만든 작은 디자인 시스템입니다. 즉 **이 사이트가 그 시스템의 첫 번째 사용자**이자 검증 무대입니다.
- **저채도 웜 뉴트럴 톤 + 문서형 레이아웃.** 터미널·해커 클리셰를 배제하고, 가을 느낌의 차분한 색감과 에디토리얼 세리프로 "읽히는" 인상을 노렸습니다.
- **인터랙티브 토큰 데모.** 방문자가 브랜드 색·라운드 같은 토큰을 직접 조작하면, 컴포넌트가 그 자리에서 실시간으로 반응합니다. "토큰 기반으로 동작한다"를 말이 아니라 체험으로 보여주는 것이 목적입니다.
- **라이트/다크 테마, 절제된 모션, 접근성.** 토큰 값만 덮어 다크 모드를 구현했고, 스크롤 모션은 과하지 않게 다뤘습니다. OS의 "동작 줄이기"(`prefers-reduced-motion`)를 켜면 모션이 자동으로 비활성화됩니다.

---

## 디자인 시스템 설계 원칙

이 프로젝트의 핵심 차별점입니다.

### 사이트 안에서 시작해, 검증한 뒤 추출한다

디자인 시스템을 처음부터 별도 패키지로 만들면, 무엇이 필요한지 모르는 상태에서 API를 고정하게 되어 거의 항상 틀립니다. 그래서 시스템을 사이트 안(`design-system/`)에 두고 **실사용으로 API를 검증한 뒤**, 안정화되면 별도 패키지로 들어내는 전략을 택했습니다. 이 과정 자체가 포트폴리오의 서사가 됩니다.

### 추출 가능성을 지키는 3가지 규칙

`design-system/`은 나중에 통째로 들어내 독립 패키지가 됩니다. 그래서 처음부터 다음 규칙을 지킵니다.

1. **사이트 코드를 import 하지 않는다.** 의존은 단방향. 사이트 → 시스템은 OK, 시스템 → 사이트는 금지.
2. **색·간격을 하드코딩하지 않는다.** 반드시 토큰(Tailwind 유틸리티)만 참조. `#A55E45` 같은 임의값 금지 — 토큰 하나를 바꾸면 사이트 전체가 따라 바뀝니다.
3. **`next/*`에 의존하지 않는다.** `next/link`, `next/image` 등을 시스템 컴포넌트 안에서 쓰지 않습니다. 순수 React만 — 나중에 다른 환경에서도 그대로 쓰기 위해서입니다.

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** (`@theme` 기반 토큰)
- **Framer Motion** — 절제된 스크롤/인터랙션 모션
- **useTaehwan()/ui** — 자체 디자인 시스템 (토큰 + 코어 컴포넌트 6개, 라이트/다크)
- **Vercel** 배포

---

## 폴더 구조

사이트(`app/`)와 디자인 시스템(`design-system/`)을 분리해, 시스템이 언제든 독립 패키지로 떨어져 나갈 수 있게 했습니다.

```
usetaehwan/
├── app/                    # 사이트 (Next.js App Router)
│   ├── _components/        # Hero, Nav, Reveal, TokenPlayground 등
│   ├── _data/              # 프로젝트 등 콘텐츠 데이터
│   ├── projects/           # 프로젝트 상세 라우트
│   ├── globals.css         # tailwindcss + 토큰 import
│   ├── layout.tsx          # 폰트·테마·모션 설정
│   └── page.tsx            # 메인 페이지
│
└── design-system/          # ← 추출 대상 (사이트에 의존하지 않음)
    ├── tokens/tokens.css    # @theme 토큰 정의 (SSOT)
    ├── components/          # Button · Input · Card · Badge · Typography · Container
    ├── lib/                 # cn (clsx + tailwind-merge)
    └── index.ts             # 배럴 익스포트
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
- **블로그:** 이 사이트와 디자인 시스템을 만드는 과정을 티스토리에 시리즈로 기록하고 있습니다. *(링크 준비 중)*

---

<sub>Built by Taehwan Jeong · 프론트엔드 개발자 · with <code>useTaehwan()/ui</code></sub>
