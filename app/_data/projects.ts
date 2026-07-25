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

/** Orbit — 디자인 시스템을 소비하는 첫 풀스택 프로젝트 */
const ORBIT_LIVE_URL = "https://orbit-ten-inky.vercel.app";
const ORBIT_REPO_URL = "https://github.com/JeongTaehwan/Orbit";

export const PROJECTS: Project[] = [
  {
    slug: "usetaehwan-ui",
    name: "useTaehwan()/ui",
    year: "2026",
    summary:
      "이 사이트를 구동하는 저채도 웜 뉴트럴 디자인 시스템. 토큰 레이어와 6개의 타입 지정 React 프리미티브로 구성됩니다.",
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
          title: "color-mix 기반 다크모드",
          body: ".dark에서 토큰 값만 덮어쓰는 방식. on-brand 글자색은 배경 밝기로 자동 계산해 라이트/다크 각각 WCAG 대비를 유지합니다.",
        },
        {
          title: "6개 프리미티브",
          body: "Button · Input · Card · Badge · Typography · Container. native 속성 상속 + cn(clsx+tailwind-merge)으로 외부 className 병합, focus-visible·aria-invalid 접근성 대응.",
        },
        {
          title: "인터랙티브 토큰 데모",
          body: "방문자가 브랜드 색·라운드 토큰을 조작하면 컴포넌트가 그 자리에서 실시간으로 반응. '토큰 기반으로 동작한다'를 직접 체험시키는 것이 목적입니다.",
        },
      ],
      stack: ["TypeScript", "Tailwind v4", "React 19", "Next.js 16", "Framer Motion"],
      links: [{ label: "GitHub", href: DS_REPO_URL }],
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
