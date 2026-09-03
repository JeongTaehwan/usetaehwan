export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  name: string;
  year: string;
  /** 카드에 보이는 한 줄 요약 */
  summary: string;
  tags: string[];
  /** 콘텐츠 미준비 — 카드 자리만 잡고 상세로는 연결하지 않는다 */
  placeholder?: boolean;
  /** 상세 페이지 콘텐츠 (준비된 프로젝트만) */
  detail?: {
    tagline: string;
    role: string;
    period: string;
    overview: string;
    highlights: { title: string; body: string }[];
    stack: string[];
    links?: ProjectLink[];
  };
};

/** 디자인 시스템(useTaehwan()/ui)의 저장소 — 사이트 저장소와 별개 */
const DS_REPO_URL = "https://github.com/JeongTaehwan/usetaehwan-ui";
const DS_LIVE_URL = "https://ui.usetaehwan.page";
const DS_NPM_URL = "https://www.npmjs.com/package/@usetaehwan/ui";

/** Orbit — 디자인 시스템을 소비하는 첫 풀스택 프로젝트 */
const ORBIT_LIVE_URL = "https://orbit-ten-inky.vercel.app";
const ORBIT_REPO_URL = "https://github.com/JeongTaehwan/Orbit";

/** 각(Gak) — 사람·구현 AI·검증 AI 역할을 분리한 파이프라인으로 만든 두 번째 소비 프로젝트 */
const GAK_REPO_URL = "https://github.com/JeongTaehwan/Gak";

export const PROJECTS: Project[] = [
  {
    slug: "usetaehwan-ui",
    name: "useTaehwan()/ui",
    year: "2026",
    summary:
      "이 사이트를 구동하는 토큰 기반 React 디자인 시스템. 10개의 컴포넌트로 구성되고, 토큰만 덮어쓰면 프로젝트마다 다른 테마를 입힐 수 있습니다.",
    tags: ["TypeScript", "Tailwind v4", "React"],
    detail: {
      tagline: "읽고 있는 이 문서, 그 문서가 만든 화면",
      role: "설계 · 구현 (개인)",
      period: "2026 —",
      overview:
        "디자인 시스템을 처음부터 별도 패키지로 만들면, 무엇이 필요한지 모르는 상태에서 API를 고정하게 되어 거의 항상 틀립니다. 그래서 이 사이트를 '첫 소비처'로 두고 실사용으로 API를 검증한 뒤 추출하는 전략을 택했습니다. 이 페이지 전체가 그 시스템의 첫 검증 결과입니다.",
      highlights: [
        {
          title: "토큰 단일 소스(SSOT)",
          body: "컬러·타이포·스페이싱·라운드·섀도우를 Tailwind v4 @theme 토큰으로 정의. 컴포넌트는 var(--color-*)만 참조하므로 토큰 하나를 바꾸면 화면 전체가 따라 바뀝니다.",
        },
        {
          title: "프로젝트별 테마",
          body: "컴포넌트가 토큰만 참조하므로, 소비 프로젝트에서 토큰을 덮어쓰는 것만으로 전혀 다른 무드의 테마가 됩니다. 이 사이트(웜 뉴트럴)·Orbit(우주)·각(볼트 그린) 세 프로젝트가 실제로 같은 패키지를 씁니다. 다크모드도 같은 원리 — .dark에서 토큰 값만 덮고, on-brand 글자색은 배경 밝기로 자동 계산해 WCAG 대비를 유지합니다.",
        },
        {
          title: "10개 컴포넌트",
          body: "Button · Input · Card · Badge · Typography · Container · Modal · ProgressBar · OrbitLoader · EmptyState. native 속성 상속 + cn(clsx+tailwind-merge)으로 외부 className 병합, focus-visible·aria-invalid 접근성 대응.",
        },
        {
          title: "인터랙티브 토큰 데모",
          body: "방문자가 브랜드 색·라운드 토큰을 조작하면 컴포넌트가 그 자리에서 실시간으로 반응. '토큰 기반으로 동작한다'를 직접 체험시키는 것이 목적입니다.",
        },
      ],
      stack: ["TypeScript", "Tailwind v4", "React 19", "Next.js 16", "Framer Motion"],
      links: [
        { label: "Live", href: DS_LIVE_URL },
        { label: "npm", href: DS_NPM_URL },
        { label: "GitHub", href: DS_REPO_URL },
      ],
    },
  },
  {
    slug: "gak",
    name: "각(Gak)",
    year: "2026",
    summary:
      "축구 팀의 일정 밀집도로 부진을 진단하고 다음 경기를 예측하는 웹앱. 사람·구현 AI·검증 AI의 역할을 나눈 파이프라인으로 만들었습니다.",
    tags: ["Spring Boot", "Next.js", "PostgreSQL"],
    detail: {
      tagline: "일정을 통합해 부진을 진단하고, 다음 경기를 예측하는 축구 분석 웹앱",
      role: "기획 · 풀스택 개발 (개인)",
      period: "2026.07 —",
      overview:
        "리그·컵·유럽대항전에 흩어진 팀 일정을 한 축으로 통합해 밀집도·폼 같은 지표를 서버에서 계산하고, LLM은 그 계산 결과를 문장으로 옮기는 역할만 맡는 진단·예측 앱입니다. 사람 판단 / 구현 AI(Claude Code) / 다른 벤더의 검증 AI로 역할을 나눈 10단계 파이프라인으로, 화면 5개 중 3개를 요구사항 정의 → 인수 테스트 109건 → 구현 → 교차 리뷰 순으로 완주했습니다. 이 사이트와 같은 @usetaehwan/ui를 볼트 그린 테마로 재사용합니다.",
      highlights: [
        {
          title: "API 예산 아래 동기화",
          body: "외부 데이터 API 무료 티어가 하루 100요청이라, 실호출 원본을 캡처한 뒤 기본 모드를 replay로 두었습니다. 캡처 이후 개발 중 실 API 호출은 0회입니다.",
        },
        {
          title: "LLM 환각 세 겹 억제",
          body: "재료 통제 → 코드 게이트(표본 5건 미만이면 호출하지 않음) → 응답 검증. 스키마의 required가 키 존재만 보장해 빈 문자열로 채운 응답이 '성공'으로 판정되던 결함을 코드 레벨 검증으로 막았습니다.",
        },
        {
          title: "프롬프트 결정론",
          body: "Map.copyOf가 JVM 기동마다 순회 순서를 바꿔 프롬프트 지문이 흔들리고, 저장된 진단이 조용히 버려지던 문제를 30회 기동에서 7가지 순서로 실측해 확인했습니다. enum 순서 고정과 회귀 테스트로 봉인했습니다.",
        },
        {
          title: "역할 분리 파이프라인",
          body: "요구사항 승인 전 구현 금지, 기계 검사 통과 전 리뷰 금지 같은 게이트로 절차를 강제했습니다. 백엔드 자동 테스트 289개를 갖췄고, 무료 플랜을 유지하도록 저장된 진단은 API 키 없이도 서빙되게 설계했습니다.",
        },
      ],
      stack: [
        "Spring Boot 3.5",
        "Java 21",
        "Next.js 15",
        "TypeScript",
        "Tailwind v4",
        "PostgreSQL",
        "Neon",
        "Anthropic API",
      ],
      links: [{ label: "GitHub", href: GAK_REPO_URL }],
    },
  },
  {
    slug: "orbit",
    name: "Orbit",
    year: "2026",
    summary:
      "공부하면 내 우주가 자라나는 학습 동기부여 웹앱. 기록을 남길수록 행성이 테라포밍됩니다.",
    tags: ["Next.js", "FastAPI", "Three.js"],
    detail: {
      tagline: "공부한 만큼 행성이 자라는, 학습 동기부여 웹앱",
      role: "기획 · 풀스택 개발 (개인)",
      period: "2026 —",
      overview:
        "학습 주제를 하나의 행성으로 만들고, 공부 기록을 남길수록 그 행성이 조금씩 테라포밍되는 웹앱입니다. 프론트엔드 개발자로서 화면만이 아니라 백엔드·DB·인프라·배포까지 직접 구성하며 웹 서비스의 전체 구조를 손으로 이해하는 것을 목표로 만들었습니다. 이 사이트를 구동하는 디자인 시스템 @usetaehwan/ui를 우주 테마로 재사용해, 하나의 시스템이 서로 다른 결의 프로덕트를 어떻게 지탱하는지도 함께 검증했습니다.",
      highlights: [
        {
          title: "우주 테마로 재사용한 디자인 시스템",
          body: "이 사이트와 같은 @usetaehwan/ui 패키지를 설치해, 토큰만 우주 테마로 덮어 재사용했습니다. 같은 프리미티브가 전혀 다른 무드의 프로덕트를 지탱하며 시스템의 이식성을 검증했습니다.",
        },
        {
          title: "3D 행성 테라포밍",
          body: "React Three Fiber로 행성을 실시간 렌더링하고, 학습 진행도에 따라 표면이 단계적으로 테라포밍되도록 구현했습니다. 기록이라는 추상적 행위에 눈에 보이는 성장의 피드백을 붙였습니다.",
        },
        {
          title: "계층형 백엔드 + 테스트",
          body: "FastAPI 백엔드를 api → services → models 계층으로 분리해 관심사를 나누고, PostgreSQL과 연결했습니다. 핵심 로직에 테스트를 붙여 프론트 밖의 안정성도 직접 책임졌습니다.",
        },
        {
          title: "인증 · 배포",
          body: "구글 OAuth와 크로스 도메인 쿠키 인증을 구성하고, 로컬 DB로 시작한 데이터를 클라우드(Neon)로 이전했습니다. Vercel·Railway·Cloudinary로 프론트·백엔드·에셋을 나눠 배포하며 풀스택 파이프라인을 완성했습니다.",
        },
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Three.js (R3F)",
        "FastAPI",
        "PostgreSQL",
        "Google OAuth",
        "Vercel",
        "Railway",
        "Neon",
        "Cloudinary",
      ],
      links: [
        { label: "Live", href: ORBIT_LIVE_URL },
        { label: "GitHub", href: ORBIT_REPO_URL },
      ],
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
