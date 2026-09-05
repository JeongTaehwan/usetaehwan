export type ProjectLink = { label: string; href: string };

export type ProjectCase = {
  title: string;
  /** 무엇이 문제였나 */
  problem: string;
  /** 어떻게 원인을 파악했나 */
  diagnosis: string;
  /** 무엇으로 해결했고 결과가 무엇인가 */
  solution: string;
};

export type Project = {
  slug: string;
  name: string;
  year: string;
  /** 카드에 보이는 한 줄 요약 */
  summary: string;
  /** 카드에 바로 보이는 작업 사례 — 문제 → 파악 → 해결 3단 (상세로 안 들어가지 않아도 읽히게) */
  cases?: ProjectCase[];
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
    cases: [
      {
        title: "추출 순서 — 소비처에서 먼저 검증하고 패키지로 뺀다",
        problem:
          "디자인 시스템을 처음부터 별도 패키지로 만들면, 무엇이 필요한지 모르는 상태에서 컴포넌트 API를 고정하게 됩니다. 회사에서 사내 UI킷을 제작·소비 양쪽에서 담당하며 이런 API가 소비처에서 어떻게 깨지는지를 먼저 봤습니다.",
        diagnosis:
          "API가 틀리는 지점은 설계 단계가 아니라 실제 화면에 붙이는 순간에 드러납니다. 소비처가 없는 컴포넌트는 검증할 방법이 없었습니다.",
        solution:
          "이 사이트를 첫 소비처로 두고 6개 프리미티브로 시작해 실사용으로 API를 검증한 뒤 별도 저장소로 추출, npm 0.1.0(2026.07.18) → 0.2.0(07.26)으로 배포했습니다. 이후 Orbit·각(Gak)이 같은 패키지를 설치해 쓰면서 컴포넌트가 10개로 늘었습니다.",
      },
      {
        title: "테마가 그림자를 따라오지 않는다",
        problem:
          "토큰만 덮어써서 다크모드·프로젝트별 테마를 만드는 구조인데, 색·라운드는 따라오는데 그림자만 테마를 무시했습니다.",
        diagnosis:
          "빌드 산출물을 열어보니 Tailwind v4가 shadow-sm 유틸리티에 그림자 값을 빌드타임에 인라인해 두고 있었습니다(--tw-shadow: 0 1px 2px … #33302a0d). 런타임에 --shadow-* 토큰을 덮어도 유틸리티가 그 변수를 참조하지 않으니 반영될 수가 없었습니다. 영향 범위는 shadow-sm을 쓰는 Card와 shadow-lg를 쓰는 Modal 둘.",
        solution:
          "프레임워크 한계로 판단해 우회하지 않고 시안-구현 간극 문서(token-mapping.md)에 기록했습니다. 대신 테마 오버라이드 범위를 색 13개·radius 4개로 명시하고, Modal이 body 포털이라 data-theme을 html에 걸어야 한다는 함정도 함께 문서화했습니다.",
      },
      {
        title: "데모가 뜬다 = 패키지가 정상이다, 를 진짜로 만들기",
        problem:
          "데모 사이트가 소스(src)를 직접 import하면, 빌드 산출물(dist)이나 exports 설정이 깨져도 데모는 멀쩡히 뜹니다. 데모가 패키지 정상성을 증명하지 못했습니다.",
        diagnosis:
          "실제 소비자가 겪는 경로는 npm install → package.json exports → dist입니다. 데모가 그 경로를 타지 않으면 검증하는 대상이 다른 것입니다.",
        solution:
          "데모를 npm workspace(file:..)로 묶어 exports가 가리키는 dist를 소비자와 같은 방식으로 import하게 하고, demo:build가 라이브러리 빌드를 선행하도록 강제했습니다. 이제 ui.usetaehwan.page가 뜨는 것 자체가 배포 산출물의 정상성 증명입니다.",
      },
    ],
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
    cases: [
      {
        title: "하루 100요청 예산 아래에서 개발하기",
        problem:
          "외부 데이터 API 무료 티어가 하루 100요청입니다. 개발 중 화면을 몇 번 새로고침하면 하루 예산이 몇 분 안에 사라집니다.",
        diagnosis:
          "예산은 선택이 아니라 제약이었습니다. 호출을 아끼는 게 아니라, 개발 중에는 호출 자체가 일어나지 않는 구조가 필요했습니다.",
        solution:
          "실호출 원본 응답을 한 번 캡처해 파일로 저장(리그 380경기·컵 879경기 등 15개)하고 기본 모드를 replay로 두었습니다. 예산 상한도 100이 아닌 80으로 낮춰 경계 오차를 흡수하고, sync_log로 캡처 이후 실 API 호출 0회를 확인했습니다.",
      },
      {
        title: "형식은 맞는데 내용이 빈 AI 응답이 '성공'으로 판정되던 결함",
        problem:
          "AI 진단 배지가 'AI 분석'으로 바뀌었는데 화면은 빈 껍데기였습니다. 실제로 받은 응답은 {\"headline\":\"placeholder\", \"metric\":\"\", \"value\":\"\"} 같은 형태였습니다.",
        diagnosis:
          "JSON 스키마의 required는 키가 존재하는지만 보장하고, 빈 문자열과 빈 배열도 통과시킵니다. 스키마만 믿고 성공으로 처리한 것이 원인이었고, 모델 effort를 낮춰 사고 토큰이 0이 된 것이 빈 응답을 유발한 부가 원인이었습니다.",
        solution:
          "재료 통제(프롬프트에 들어갈 계산 결과를 코드가 만든다) → 코드 게이트(표본 5건 미만이면 호출하지 않는다) → 응답 검증(파싱 단계에서 빈 값 거부) 세 겹에 스키마를 더했습니다. LLM은 계산 결과를 문장으로 옮기는 역할만 맡고, 숫자는 서버가 만듭니다.",
      },
      {
        title: "같은 입력인데 프롬프트 지문이 흔들린다",
        problem:
          "저장된 AI 진단을 재사용해야 하는데 매번 규칙 기반 폴백이 표시됐습니다. 폴백이 정상 동작해서 아무것도 깨지지 않았고, 그래서 한참 눈치채지 못했습니다.",
        diagnosis:
          "재사용 판정에 쓰는 프롬프트 SHA-256 지문이 JVM을 다시 띄울 때마다 달라졌습니다. 원인은 Map.copyOf가 돌려주는 불변 맵 — 순회 시작 위치와 방향이 기동마다 System.nanoTime()으로 뽑는 SALT로 정해집니다. JVM 30회 기동으로 실측하니 항목 4개 컬렉션에서 7가지 순서가 나왔습니다. 같은 원인이 2회, 정렬 tiebreaker 누락으로 같은 규칙의 다른 표면이 1회 더 발견됐습니다.",
        solution:
          "enum 선언 순서로 순회를 고정하고 회귀 테스트 4개로 봉인했습니다. 두 번째 발생 시점에 '프롬프트에 들어가는 컬렉션은 순회 순서를 코드로 고정한다'를 규칙으로 승격했고, 저장분을 버릴 때 지문 불일치를 로그에 남기도록 바꿨습니다.",
      },
      {
        title: "합의된 지표 정의를 데이터 검산으로 뒤집다",
        problem:
          "일정 밀집 구간의 정의를 정하는 문답에서 '간격 4일 이하 경기가 2회 이상 연속'이라는 정의가 추천되고 수용 직전이었습니다. 문장으로는 자연스러웠습니다.",
        diagnosis:
          "실제 한 시즌 52경기로 두 정의를 계산해 봤습니다. 추천안은 전 대회 8구간·리그만 3구간, 대안(임의의 14일 창 안 5경기 이상)은 3구간·0구간. 지표의 목적이 '전 대회 일정이 리그 단독보다 얼마나 빡빡한가'인데, 리그 단독에서도 밀집을 검출하는 정의는 변별력이 없었습니다.",
        solution:
          "대안을 채택하고 응답 계약에 승격했습니다(14일·5경기는 파라미터). 인수 테스트에 수치를 고정해 정의를 바꾸려면 테스트가 먼저 깨지게 했고, '숫자를 만드는 규칙은 문장이 아니라 결과표로 승인한다'를 파이프라인 규칙에 추가했습니다.",
      },
    ],
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
    cases: [
      {
        title: "모바일에서만 로그인이 풀리는 문제",
        problem:
          "PC에서는 정상인데 iOS Safari에서 로그인 직후 세션이 유실됐습니다.",
        diagnosis:
          "프론트(Vercel)와 백엔드(Railway)가 다른 사이트라 세션 쿠키가 제3자 쿠키로 취급됐고, Safari의 추적 방지(ITP)가 이를 차단했습니다. SameSite=None으로 풀어도 근본 원인은 그대로였습니다.",
        solution:
          "Next.js rewrites로 프론트에 /api 프록시를 두어 브라우저 입장에서 same-origin 요청이 되게 했습니다. 쿠키는 SameSite=Lax로 되돌리고, CORS·OAuth 콜백·쿠키 속성을 환경변수로 빼 배포 환경마다 바꿀 수 있게 했습니다.",
      },
      {
        title: "진행도·스트릭을 저장하면 생기는 불일치",
        problem:
          "학습 기록을 지우면 행성 진행도와 연속 기록(스트릭)이 실제 기록과 어긋날 수 있었습니다.",
        diagnosis:
          "진행도와 스트릭은 기록에서 계산되는 파생값인데, 이를 별도 컬럼에 저장하면 기록이 바뀔 때마다 동기화 코드가 필요하고 한 곳만 빠져도 불일치가 남습니다.",
        solution:
          "저장하지 않고 조회 시점에 기록에서 계산하도록 services 계층에 두었습니다(행성 모델에 progress 컬럼 없음). 스트릭은 UTC로 저장된 시각을 KST 자정 기준으로 환산해 날짜 경계를 맞췄습니다.",
      },
      {
        title: "프론트엔드 개발자가 배포 파이프라인까지",
        problem:
          "화면만 만들어 본 상태에서 백엔드·DB·에셋·인증을 각각 어디에 두고 어떻게 이어야 하는지가 비어 있었습니다.",
        diagnosis:
          "한 서비스에 몰아넣으면 쉽지만 무료 플랜 범위를 넘고, 나누면 크로스 도메인 문제(위 쿠키 이슈)가 따라옵니다. 나누되 경계 문제를 코드로 흡수하는 쪽을 택했습니다.",
        solution:
          "Vercel(프론트)·Railway(FastAPI)·Neon(PostgreSQL)·Cloudinary(이미지)로 분리 배포하고, GitHub Actions CI에서 ruff + pytest 65개 / tsc + eslint + Vitest 102개를 돌립니다. Playwright e2e 29개로 로그인·기록 흐름을 회귀 검증하고, 처음 SVG로 그렸던 행성은 React Three Fiber 3D로 교체했습니다.",
      },
    ],
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
