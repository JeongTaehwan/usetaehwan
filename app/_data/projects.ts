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

const REPO_URL = "https://github.com/JeongTaehwan/usetaehwan";

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
      links: [{ label: "GitHub", href: REPO_URL }],
    },
  },
  {
    slug: "project-2",
    name: "Project 준비 중",
    year: "—",
    summary: "시스템을 소비하는 첫 프로젝트를 준비하고 있습니다.",
    tags: ["TBD"],
    placeholder: true,
  },
  {
    slug: "project-3",
    name: "Project 준비 중",
    year: "—",
    summary: "두 번째 소비 프로젝트 자리입니다.",
    tags: ["TBD"],
    placeholder: true,
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
