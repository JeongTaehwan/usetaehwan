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

/** 프로젝트가 실제로 쓰는 색 — 홈 카드·상세 페이지가 이 팔레트로 그려진다 (globals.css의 .theme-<slug>와 짝) */
export type ProjectPalette = {
  label: string;
  swatches: { name: string; value: string }[];
};

export type Project = {
  slug: string;
  palette: ProjectPalette;
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

/** 오늘어디 — 데이트 코스 추천 앱 (Expo + NestJS) */
const ONEUREODI_REPO_URL = "https://github.com/JeongTaehwan/Oneureodi";

/** 끼니 — 저녁 메뉴를 하나로 정해 주는 앱. 역할별 에이전트 팀이 기획한 프로토타입 */
const KKINI_REPO_URL = "https://github.com/JeongTaehwan/kkini";

/** 쪽쪽 — 수유 기록과 다음 맘마 알림 앱 (Expo) */
const ZZOKZZOK_REPO_URL = "https://github.com/JeongTaehwan/zzokzzok";

/** 정태환에게 물어보기 — 이 사이트의 RAG 챗봇. 백엔드는 사이트 저장소의 ask-server/ (수치 출처: docs/ask/eval-report.md · decisions.md) */
const ASK_LIVE_URL = "https://usetaehwan.page";
const ASK_REPO_URL = "https://github.com/JeongTaehwan/usetaehwan/tree/main/ask-server";

export const PROJECTS: Project[] = [
  {
    slug: "ask",
    palette: {
      label: "Site tokens",
      swatches: [
        { name: "bg", value: "#FBFAF7" },
        { name: "surface", value: "#FFFFFF" },
        { name: "fg", value: "#1B1C1E" },
        { name: "brand", value: "#9A4F37" },
        { name: "brand-soft", value: "#F5E8E2" },
      ],
    },
    name: "정태환에게 물어보기",
    year: "2026.10",
    summary:
      "이 사이트의 글만 근거로 경력·프로젝트 질문에 답하는 RAG 챗봇. 문장마다 출처 번호를 달고, 인용 번호와 숫자는 코드가 검증해 통과한 답만 내보냅니다. 근거가 없으면 답하지 않습니다.",
    tags: ["Python", "LangGraph", "pgvector"],
    cases: [
      {
        title: "모델보다 측정 도구부터 검증했다",
        problem: "첫 실측에서 인용 정확도(LLM 심사)가 78%(39/50)로 나왔습니다.",
        diagnosis:
          "심사가 \"근거 없음\"으로 판정한 11건을 직접 검수하니 10건이 심사 오판이었습니다. 대부분 \"정태환은…\", \"Orbit에서…\"처럼 이름·프로젝트명을 붙인 문장이었고, 원인은 심사 모델이 근거 본문만 받고 생성 모델이 보는 제목·섹션을 받지 못한 것이었습니다.",
        solution:
          "모델을 바꾸기 전에 측정을 고쳤습니다. 심사에 생성과 같은 근거 형식과 사이트 맥락을 주고 같은 쌍을 3회 심사해 다수결로 정하자, 인용 정확도는 98.1%(51/52), 3회 판정이 갈린 쌍은 0개였습니다.",
      },
      {
        title: "조정은 조정에 쓰지 않은 질문으로 확인한다",
        problem:
          "검색 후보를 8개에서 15개로 늘리면 여러 근거가 필요한 질문의 범위는 넓어졌지만, 인용 정확도가 98.1%에서 85.7%로 떨어졌습니다.",
        diagnosis:
          "근거가 늘자 생성 모델이 여러 근거를 한 문장에 묶었고, 그 문장의 인용 번호가 어긋나거나 근거에 없는 \"두 프로젝트에 있습니다\" 같은 범위 단정이 섞였습니다.",
        solution:
          "생성 프롬프트를 고쳐(사실마다 그 근거 번호, 범위 단정 금지) 후보 15개에서 인용 정확도 98.1%(52/53), 답의 항목 재현율 11/11이 됐습니다. 채택 전에는 조정을 시작하기 전에 커밋해 둔 질문 8개로 한 번만 확인했습니다 — 미리 정한 조건(인용 95% 이상 · p95 10초 이하)에 인용 15/15, p95 6.96초로 통과했습니다.",
      },
      {
        title: "설정이 틀리면 조용히 뜨지 않는다",
        problem:
          "첫 배포는 개발용 DB 주소(localhost:5433)로 붙으려다 30초 뒤 시간 초과로 재시작을 반복했습니다. 비밀값이 빠지면 프록시 검사가 꺼지거나 공개된 기본값으로 IP를 해시하는데도 서버는 정상으로 떴습니다.",
        diagnosis:
          "설정 누락이 기본값으로 조용히 떨어지는 구조라, 로그만으로는 원인까지 한 단계를 더 추리해야 했고 진단 메시지가 틀렸을 때는 엉뚱한 곳을 조사했습니다.",
        solution:
          "운영 모드에서는 DB 주소·비밀값·모델 키가 없거나 기본값이면 무엇을 고칠지 적고 시작을 거부합니다. 시작 로그에는 필수 변수의 있음/없음만 남기고 값은 찍지 않습니다.",
      },
    ],
    detail: {
      tagline: "근거가 없으면 답하지 않는다 — 포트폴리오 RAG 챗봇",
      role: "기획 · 풀스택 개발 (개인)",
      period: "2026.10",
      overview:
        "이 사이트의 프로젝트·경력·AI 노트·발표 글을 청크로 나눠 pgvector에 넣고, 질문이 오면 검색한 근거로만 답하는 챗봇입니다. 모든 페이지 오른쪽 아래 \"정태환에게 물어보기\"로 엽니다. 흐름은 LangGraph 그래프로 짰고, LLM은 질문 분류·관련성 판정·답변 작성 세 곳에만 씁니다. 답변의 인용 번호와 숫자는 코드가 근거와 대조하고, 통과한 답만 단계 이벤트(SSE)와 함께 보냅니다. 백엔드는 FastAPI(Railway, Docker), 저장소는 Neon PostgreSQL, 임베딩은 Gemini 무료 등급이라 패널에 외부 전송과 데이터 활용 가능성을 안내합니다. 설계 결정과 평가 기록은 저장소의 decisions.md · eval-report.md에 남겼습니다.",
      highlights: [
        {
          title: "구조 — LLM 세 곳, 검증은 코드",
          body: "pre_guard(개인정보 규칙) → classify → retrieve(pgvector) → grade → generate ⇄ verify → finalize. verify는 코드가 인용 번호 범위·인용 없는 문장·근거에 없는 숫자를 검사하고, 걸리면 한 번 다시 쓰게 한 뒤에도 실패하면 검증을 통과한 문장만 남깁니다(fallback). 범위 밖·개인정보·인젝션은 refuse, 관련 근거가 없으면 no_evidence로 빠집니다.",
        },
        {
          title: "안전",
          body: "30문항 평가에서 개인정보·범위 밖 질문 5/5를 거절했고, 인젝션 질문 4/4는 거절하거나 지시를 따르지 않고 답했으며, 답이 없는 질문 5/5에 \"자료에 없다\"고 답했습니다. 질문·답변 원문은 저장하지 않고 메타데이터만 남기며, IP는 날짜를 섞은 HMAC으로만 셉니다.",
        },
        {
          title: "비용 · 지연",
          body: "30문항 평가 기준 질문당 생성 비용 평균 $0.00079, 응답 시간 p95 5.7초(5,662ms)입니다(평가용 심사 비용 제외).",
        },
        {
          title: "남은 한계",
          body: "여러 근거가 필요한 질문에서 관련성 판정 단계가 맞는 근거를 걸러 항목을 빠뜨리는 문제가 남아 있습니다(holdout-2 항목 재현율 2/4).",
        },
      ],
      stack: ["Python", "FastAPI", "LangGraph", "PostgreSQL (pgvector · Neon)", "Gemini Embedding", "Claude Haiku", "SSE", "Docker", "Railway", "Next.js"],
      links: [
        { label: "Live", href: ASK_LIVE_URL },
        { label: "GitHub", href: ASK_REPO_URL },
      ],
    },
  },
  {
    slug: "usetaehwan-ui",
    palette: {
      label: "Warm neutral",
      swatches: [
        { name: "bg", value: "#FDFBF7" },
        { name: "surface", value: "#EBE7DC" },
        { name: "fg", value: "#33302A" },
        { name: "brand", value: "#A55E45" },
        { name: "success", value: "#6E7B53" },
      ],
    },
    name: "useTaehwan()/ui",
    year: "2026.07 – 현재",
    summary:
      "직접 만들어 npm에 배포한 토큰 기반 React 디자인 시스템. 10개의 컴포넌트로 구성되고, 토큰만 덮어쓰면 프로젝트마다 다른 테마를 입힐 수 있어 Orbit(우주)·각(볼트 그린) 두 프로덕트가 같은 패키지를 씁니다.",
    tags: ["TypeScript", "Tailwind v4", "React"],
    cases: [
      {
        title: "추출 순서 — 소비처에서 먼저 검증하고 패키지로 뺀다",
        problem:
          "디자인 시스템을 처음부터 별도 패키지로 만들면, 무엇이 필요한지 모르는 상태에서 컴포넌트 API를 고정하게 됩니다. 회사에서 사내 UI킷을 제작·소비 양쪽에서 담당하며 이런 API가 소비처에서 어떻게 깨지는지를 먼저 봤습니다.",
        diagnosis:
          "API가 틀리는 지점은 설계 단계가 아니라 실제 화면에 붙이는 순간에 드러납니다. 소비처가 없는 컴포넌트는 검증할 방법이 없었습니다.",
        solution:
          "이 사이트의 v1을 첫 소비처로 두고 6개 프리미티브로 시작해 실사용으로 API를 검증한 뒤 별도 저장소로 추출, npm 0.1.0(2026.07.18) → 0.2.0(07.26)으로 배포했습니다. 이후 Orbit·각(Gak)이 같은 패키지를 설치해 쓰면서 컴포넌트가 10개로 늘었습니다.",
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
      period: "2026.07 – 현재",
      overview:
        "디자인 시스템을 처음부터 별도 패키지로 만들면, 무엇이 필요한지 모르는 상태에서 API를 고정하게 되어 거의 항상 틀립니다. 그래서 이 사이트의 v1을 '첫 소비처'로 두고 실사용으로 API를 검증한 뒤 추출하는 전략을 택했습니다. 검증이 끝난 뒤 사이트는 v2에서 자체 도면 테마로 독립했고, 시스템은 Orbit·각(Gak)이 씁니다.",
      highlights: [
        {
          title: "토큰 단일 소스(SSOT)",
          body: "컬러·타이포·스페이싱·라운드·섀도우를 Tailwind v4 @theme 토큰으로 정의. 컴포넌트는 var(--color-*)만 참조하므로 토큰 하나를 바꾸면 화면 전체가 따라 바뀝니다.",
        },
        {
          title: "프로젝트별 테마",
          body: "컴포넌트가 토큰만 참조하므로, 소비 프로젝트에서 토큰을 덮어쓰는 것만으로 전혀 다른 무드의 테마가 됩니다. 이 사이트 v1(웜 뉴트럴)·Orbit(우주)·각(볼트 그린)이 같은 패키지로 세 가지 무드를 냈습니다. 다크모드도 같은 원리 — .dark에서 토큰 값만 덮고, on-brand 글자색은 배경 밝기로 자동 계산해 WCAG 대비를 유지합니다.",
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
    palette: {
      label: "Volt night",
      swatches: [
        { name: "bg", value: "#04060A" },
        { name: "surface", value: "#111722" },
        { name: "fg", value: "#EAF0F8" },
        { name: "brand", value: "#C8FF1E" },
        { name: "muted", value: "#55647A" },
      ],
    },
    name: "각(Gak)",
    year: "2026.07 – 현재",
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
          "enum 선언 순서로 순회를 고정하고 회귀 테스트 4개로 다시 안 생기게 막았습니다. 두 번째 발생 시점에 '프롬프트에 들어가는 컬렉션은 순회 순서를 코드로 고정한다'를 규칙으로 정했고, 저장분을 버릴 때 지문 불일치를 로그에 남기도록 바꿨습니다.",
      },
      {
        title: "합의된 지표 정의를 데이터 검산으로 뒤집다",
        problem:
          "일정 밀집 구간의 정의를 정하는 문답에서 '간격 4일 이하 경기가 2회 이상 연속'이라는 정의가 추천되고 수용 직전이었습니다. 문장으로는 자연스러웠습니다.",
        diagnosis:
          "실제 한 시즌 52경기로 두 정의를 계산해 봤습니다. 추천안은 전 대회 8구간·리그만 3구간, 대안(임의의 14일 창 안 5경기 이상)은 3구간·0구간. 지표의 목적이 '전 대회 일정이 리그 단독보다 얼마나 빡빡한가'인데, 리그 단독에서도 밀집을 검출하는 정의는 변별력이 없었습니다.",
        solution:
          "대안을 채택해 API 응답 형식에 정식으로 넣었습니다(14일·5경기는 파라미터). 인수 테스트에 수치를 고정해 정의를 바꾸려면 테스트가 먼저 깨지게 했고, '숫자를 만드는 규칙은 문장이 아니라 결과표로 승인한다'를 파이프라인 규칙에 추가했습니다.",
      },
    ],
    detail: {
      tagline: "일정을 통합해 부진을 진단하고, 다음 경기를 예측하는 축구 분석 웹앱",
      role: "기획 · 풀스택 개발 (개인)",
      period: "2026.07 – 현재",
      overview:
        "리그·컵·유럽대항전에 흩어진 팀 일정을 한 축으로 통합해 밀집도·폼 같은 지표를 서버에서 계산하고, LLM은 그 계산 결과를 문장으로 옮기는 역할만 맡는 진단·예측 앱입니다. 사람 판단 / 구현 AI(Claude Code) / 다른 벤더의 검증 AI로 역할을 나눈 10단계 파이프라인으로, 화면 5개 중 3개를 요구사항 정의 → 인수 테스트 109건 → 구현 → 교차 리뷰 순으로 완주했습니다. 직접 만든 @usetaehwan/ui를 볼트 그린 테마로 재사용합니다.",
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
          body: "Map.copyOf가 JVM 기동마다 순회 순서를 바꿔 프롬프트 지문이 흔들리고, 저장된 진단이 조용히 버려지던 문제를 30회 기동에서 7가지 순서로 실측해 확인했습니다. enum 순서를 고정하고 회귀 테스트로 막았습니다.",
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
    palette: {
      label: "Deep space",
      swatches: [
        { name: "bg", value: "#0A0D16" },
        { name: "surface", value: "#141A2A" },
        { name: "fg", value: "#EAEEF7" },
        { name: "brand", value: "#5CC9D6" },
        { name: "muted", value: "#6A7488" },
      ],
    },
    name: "Orbit",
    year: "2026.07",
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
      period: "2026.07",
      overview:
        "학습 주제를 하나의 행성으로 만들고, 공부 기록을 남길수록 그 행성이 조금씩 테라포밍되는 웹앱입니다. 프론트엔드 개발자로서 화면만이 아니라 백엔드·DB·인프라·배포까지 직접 구성하며 웹 서비스의 전체 구조를 손으로 이해하는 것을 목표로 만들었습니다. 직접 만든 디자인 시스템 @usetaehwan/ui를 우주 테마로 재사용해, 하나의 시스템이 서로 다른 결의 프로덕트를 어떻게 지탱하는지도 함께 검증했습니다.",
      highlights: [
        {
          title: "우주 테마로 재사용한 디자인 시스템",
          body: "@usetaehwan/ui 패키지를 설치해, 토큰만 우주 테마로 덮어 재사용했습니다. 같은 프리미티브가 전혀 다른 무드의 프로덕트를 지탱하며 시스템의 이식성을 검증했습니다.",
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
  {
    slug: "oneureodi",
    palette: {
      label: "Warm minimal",
      swatches: [
        { name: "bg", value: "#FFFBF5" },
        { name: "surface", value: "#FFFFFF" },
        { name: "fg", value: "#4A403B" },
        { name: "brand", value: "#F28B6F" },
        { name: "muted", value: "#8E8078" },
      ],
    },
    name: "오늘어디",
    year: "2026.09 – 현재",
    summary:
      "성향·위치·예산·차·시간을 넣으면 데이트 코스 5개를 짜 주는 앱. 장소는 카카오맵에서, 분위기·가격·주차 힌트는 블로그·인스타 글에서 모으고, AI는 후보 안에서 코스를 조합하는 일만 맡습니다.",
    tags: ["Expo", "NestJS", "Gemini"],
    cases: [
      {
        title: "AI에게 \"추천해줘\"라고 시키지 않는다",
        problem:
          "코스 추천을 AI에게 통째로 맡기면 없는 가게, 지어낸 버스 시간, 예산을 넘는 코스가 섞여 나옵니다.",
        diagnosis:
          "좌표·경로·시간 같은 사실과 예산·주차·영업 시간대 같은 규칙은 AI가 지어내거나 매번 다르게 판단하는 영역이었습니다. AI가 잘하는 일은 비정형 글을 구조화하는 것과 후보 안에서 취향에 맞게 고르는 것 두 가지였습니다.",
        solution:
          "장소와 경로는 카카오 API, 필터는 코드, AI는 추천 한 번에 추출 3번과 조합 1번만 맡겼습니다. AI가 낸 코스는 코드가 다시 검사해 후보에 없는 장소를 지우고, 알려진 가격 합 × 2가 예산을 넘거나 시간표가 안 맞는 코스를 탈락시킵니다.",
      },
      {
        title: "출처 번호로 지어낸 링크를 없애다",
        problem:
          "웹 조사를 AI 한 번에 맡기면 느렸고, 힌트가 어느 글에서 왔는지 남지 않았습니다.",
        diagnosis:
          "검색·읽기·정리를 한 호출에 몰아넣어 프롬프트가 컸고, 출처를 AI가 기억해 내는 구조라 링크를 지어낼 수 있었습니다.",
        solution:
          "검색은 Tavily가 블로그·인스타·웹 출처별로 따로 하고, 본문에 [1] 같은 번호를 붙여 AI가 번호로 출처를 돌려주게 했습니다. 추출을 출처별 3개로 나눠 동시에 보내, 한 번에 넣으면 20초 넘게 걸리던 호출이 무료 등급 모델에서도 3~5초에 끝납니다.",
      },
      {
        title: "모르는 값은 \"모름\"으로 표시한다",
        problem: "가격·주차·경로 정보가 없는 장소가 많았습니다.",
        diagnosis:
          "없는 값을 0이나 빈 값으로 두면 예산·주차 필터가 거짓으로 통과시키고, 정보가 없는 장소를 빼 버리면 후보가 남지 않았습니다.",
        solution:
          "가격을 모르면 합계에서 빼고 \"+α\"로, 주차 정보가 없으면 \"정보 없음\"으로 표시하고 차가 있어도 \"불가\"만 제외합니다. 경로 API가 실패하면 직선거리 × 1.3으로 어림하고 어림값이라고 표시합니다.",
      },
    ],
    detail: {
      tagline: "사실은 API가, 규칙은 코드가, 취향 판단만 AI가 — 데이트 코스 추천 앱",
      role: "기획 · 풀스택 개발 (개인)",
      period: "2026.09 – 현재",
      overview:
        "지역·성향·예산·차 여부·약속 시각을 넣으면 코스 5개를 짜 주고, 코스마다 대중교통·자동차 경로(버스 번호·정거장·소요 시간), 주차장, 도착 시각을 붙이는 앱입니다. 모바일은 Expo(React Native), 서버는 NestJS로 만들었고 요청·응답 타입은 zod 스키마로 공유합니다. 외부 서비스는 카카오 로컬·경로 API, Tavily, Gemini로 모두 카드 없이 쓰는 무료 등급입니다. 네이버 검색 API는 개정 약관이 검색 결과의 AI 입력·저장을 금지해 쓰지 않았고, 인스타그램은 검색엔진에 색인된 공개 글만 읽습니다.",
      highlights: [
        {
          title: "AI 호출은 네 번뿐",
          body: "입력 → 좌표 변환 → 지도 검색과 웹 조사 동시 수집 → 이름 매칭 → 코드 필터 → AI 조합 → 코드 검증 → 경로·시간표. 한 번의 추천에서 AI 호출은 추출 3번과 조합 1번이고, 나머지는 결정적인 코드입니다.",
        },
        {
          title: "지역 캐시",
          body: "같은 좌표 격자와 반경을 일주일 동안 캐시해, 첫 조사 13~20초가 캐시 적중 시 4~5초로 줄었습니다. 웹 조사가 실패한 반쪽 결과는 캐시하지 않아 다음 요청이 다시 조사합니다.",
        },
        {
          title: "경로·주차·도착 시각",
          body: "장소 사이 구간마다 카카오 경로 API로 버스 번호·환승·요금을 받고, 차가 있으면 장소마다 가장 가까운 주차장을 붙입니다. 같은 구간은 한 번만 묻고, 시간표 검사는 어림값으로 한 번, 실제 경로로 한 번 더 합니다.",
        },
        {
          title: "판정 로직만 테스트",
          body: "예산 계산, 주차 필터, 이름 매칭, 시간표, 후보 선별을 순수 함수로 두어 API 없이 도는 테스트 56개로 묶었습니다. AI 호출 자체는 테스트하지 않습니다.",
        },
      ],
      stack: ["Expo (React Native)", "TypeScript", "NestJS", "PostgreSQL", "Prisma", "zod", "Gemini", "Tavily", "Kakao Local · Mobility API", "Render"],
      links: [{ label: "GitHub", href: ONEUREODI_REPO_URL }],
    },
  },
  {
    slug: "kkini",
    palette: {
      label: "Celadon & persimmon",
      swatches: [
        { name: "bg", value: "#EDF1EC" },
        { name: "surface", value: "#FFFFFF" },
        { name: "fg", value: "#1E2A24" },
        { name: "brand", value: "#D2562A" },
        { name: "muted", value: "#5F6E66" },
      ],
    },
    name: "끼니",
    year: "2026.09 – 현재",
    summary:
      "\"오늘 저녁 뭐 먹지?\"를 대신 끝내 주는 앱. 선택지를 늘리지 않고, 예산·인분에 맞는 메뉴 하나를 재료비와 레시피까지 붙여 정해 줍니다. 한 줄짜리 요구에서 시작해 역할별 에이전트 팀이 기획했고, 지금은 Expo 프로토타입 단계입니다.",
    tags: ["Expo", "Claude Code", "기획 파이프라인"],
    cases: [
      {
        title: "한 줄 요구를 기획 문서로 — 역할마다 모델을 나눈다",
        problem:
          "사람이 말한 것은 \"매일 끼니 해결 관련 추천해 주는 앱, 저녁 식사 고민될 때\" 한 줄이었습니다.",
        diagnosis:
          "한 세션이 기획·조사·설계를 혼자 쓰면 가정이 확정처럼 굳고, 문서끼리 모순이 생겨도 스스로 잡지 못합니다.",
        solution:
          "기획·설계·구현은 opus, 리서치·UX·문서 검증은 sonnet, 기계적 정리는 haiku로 역할 에이전트를 나누고 각자 자기 파일만 쓰게 했습니다. 모든 문서는 [제안]·[미정] 표기가 붙은 가설로 두고, 사람이 요구사항을 승인하기 전에는 구현을 시작하지 않습니다.",
      },
      {
        title: "검증은 지적만, 수정은 사람이",
        problem: "에이전트들이 쓴 문서가 서로 맞는지, 근거 없이 확정된 문장이 없는지 확인할 방법이 필요했습니다.",
        diagnosis: "문서를 쓴 에이전트가 스스로 고치면 같은 가정 안에서만 맞춰질 뿐, 판단이 사람에게 돌아오지 않습니다.",
        solution:
          "문서 검증 에이전트가 문서 간 모순, 근거 없는 확정, 판정할 수 없는 문장을 찾아 높음 3건·중간 5건·낮음 3건으로 보고만 하고, 고칠지는 사람이 정하게 했습니다.",
      },
      {
        title: "가격은 필터가 아니라 안내",
        problem: "재료비로 메뉴를 정하려면 레시피의 큰술·대·쪽 같은 단위를 실제 구매 단위와 가격으로 바꿔야 했습니다.",
        diagnosis:
          "단가는 추정값일 수밖에 없고, 예산을 필터로 쓰면 결과가 비거나 추정 오차 때문에 멀쩡한 메뉴가 빠집니다. 배달 가능 매장 필터는 국내에 쓸 수 있는 데이터가 없었습니다.",
        solution:
          "레시피 단위를 구매 단위로 환산해 단가를 곱하고, 단가표에는 추정 표기와 갱신일을 의무로 두었습니다. 예산을 넘어도 카드는 보여주되 \"초과\"로 표시하고, 배달 매장 필터는 MVP에서 뺐습니다.",
      },
    ],
    detail: {
      tagline: "저녁 메뉴를 하나로 정해 주는 앱 — 역할별 에이전트 팀으로 기획한 프로토타입",
      role: "기획 · 프로토타입 (개인, 에이전트 팀 운영)",
      period: "2026.09 – 현재",
      overview:
        "예산·인분을 넣으면 재료비 기준으로 메뉴 하나를 정해 화면 가운데에 등장시키고, 레시피·조리법까지 보여주는 앱입니다. 해 먹기가 중심이고 시켜 먹기는 가벼운 흐름으로 둡니다. 요구사항·리서치·UX·설계 문서는 역할별 에이전트 팀이 채운 가설이며, 요구사항이 승인되기 전이라 정식 구현 대신 추천 답을 전제로 한 Expo 프로토타입만 있습니다. 파이프라인 자체는 직접 만든 claude-skills 저장소의 역할 분리 스킬을 따릅니다.",
      highlights: [
        {
          title: "역할별 모델 분리 팀",
          body: "기획·리서치·UX·설계·서기·문서 검증·구현 일곱 역할이 각자 자기 파일만 씁니다. 판단이 무거운 문서는 opus, 조사·UX·검증은 sonnet, 기계적 정리는 haiku가 맡습니다.",
        },
        {
          title: "승인 게이트",
          body: "사람이 요구사항을 자기 결정으로 읽고 승인해야 문서가 유효해집니다. 승인 전에는 구현하지 않고, 승인 뒤에야 다른 회사의 검증 AI가 테스트 케이스를 뽑습니다.",
        },
        {
          title: "Expo 프로토타입",
          body: "입력 → 가운데 등장 애니메이션 → 재료비·예산 판정 카드 → 레시피 상세, 그리고 시켜 먹기 흐름까지 폰의 Expo Go로 돌려볼 수 있습니다.",
        },
        {
          title: "카탈로그 초안",
          body: "레시피 20개, 재료 단가 54종과 환산표, 배달 메뉴 26종을 초안으로 두었습니다. 모두 사람 검수 전이라 화면에 초안 배지를 상시 표시합니다.",
        },
      ],
      stack: ["Expo (React Native)", "TypeScript", "Claude Code", "역할 분리 에이전트 팀"],
      links: [{ label: "GitHub", href: KKINI_REPO_URL }],
    },
  },
  {
    slug: "zzokzzok",
    palette: {
      label: "Baby pastel",
      swatches: [
        { name: "bg", value: "#FFF5EC" },
        { name: "surface", value: "#FFFFFF" },
        { name: "fg", value: "#5B3F3A" },
        { name: "brand", value: "#FF9F86" },
        { name: "muted", value: "#9A7D76" },
      ],
    },
    name: "쪽쪽",
    year: "2026",
    summary:
      "수유 시작·종료를 한 번씩 누르면, 끝난 시각에서 정해 둔 시간이 지났을 때 \"지민아~ 맘마먹자\" 알림으로 다음 수유를 알려 주는 앱. 새벽 3시에 한 손으로 쓰는 것만 생각해 기능을 시작·종료·알람 세 가지로 줄였습니다.",
    tags: ["Expo", "React Native", "로컬 알림"],
    cases: [
      {
        title: "앱이 꺼져 있어도 알람은 울려야 한다",
        problem:
          "수유를 끝내고 폰을 내려놓으면 앱은 백그라운드로 가거나 종료됩니다. 앱 안의 타이머로는 다음 수유 시각에 알람을 보낼 수 없었습니다.",
        diagnosis:
          "알람 시각은 앱이 계산하되, 울리는 일은 OS가 맡아야 했습니다. 또 OS 알림을 놓치거나 권한이 꺼진 경우에도 앱을 다시 열면 알람을 알아차릴 수 있어야 했습니다.",
        solution:
          "수유 종료 시각 + 간격으로 OS 로컬 알림을 예약하고, 알림 ID를 하나로 고정해 예약이 항상 한 개만 남게 했습니다. 앱을 다시 열면 저장된 예약 시각이 이미 지났는지 확인해 곧바로 알람 화면을 띄웁니다. 안드로이드는 정확한 알람 권한(USE_EXACT_ALARM)을 선언했습니다.",
      },
      {
        title: "알람 규칙은 화면과 떼어 순수 함수로",
        problem:
          "수유 시작 시 취소, 종료 시 재예약, 스누즈, 간격 변경 시 재계산처럼 알람 규칙이 여러 화면에 흩어지면 예약이 겹치거나 남기 쉬웠습니다.",
        diagnosis:
          "규칙이 플랫폼 API(저장소·알림)와 섞여 있으면 기기 없이는 검증할 수 없었습니다.",
        solution:
          "상태 전이는 도메인 리듀서 하나에 모으고, 저장소·알림·진동은 포트 뒤로 숨겼습니다. 스토어는 상태의 예약 시각을 보고 OS 알림을 맞추기만 합니다. 도메인 로직 테스트와 화면 흐름 테스트를 합쳐 118개를 두었고, 도메인 줄 커버리지는 98%입니다.",
      },
      {
        title: "Capacitor에서 Expo로 옮기다",
        problem:
          "첫 버전은 웹 앱을 네이티브 껍데기로 감싼 Capacitor였는데, 폰에서 QR로 바로 테스트할 수 없었고 iOS 빌드에는 Mac이 필요했습니다.",
        diagnosis:
          "도메인 로직은 프레임워크와 무관하게 짜 두었기 때문에, 바뀌는 곳은 포트 구현과 화면뿐이었습니다.",
        solution:
          "도메인 코드는 그대로 두고 포트만 AsyncStorage·expo-notifications·expo-haptics로 바꾼 뒤, 화면과 마스코트를 react-native-svg로 다시 그렸습니다. 이제 Expo Go로 QR을 찍어 바로 돌려 보고, EAS Build나 로컬 Gradle 스크립트로 APK를 만듭니다. 이전 버전은 v0.1.0 태그로 남겨 두었습니다.",
      },
    ],
    detail: {
      tagline: "시작 버튼, 종료 버튼, 제때 울리는 알람 — 수유 기록 앱",
      role: "기획 · 개발 (개인)",
      period: "2026.09 —",
      overview:
        "기존 육아 앱은 체온·배변·성장 곡선까지 담아 새벽에 한 손으로 쓰기 어렵습니다. 쪽쪽은 수유 시작·종료를 한 번의 탭으로 기록하고, 종료 시각 + 설정 간격(기본 180분)에 아기 이름을 부르는 알림을 보냅니다. 서버 없이 모든 데이터는 기기에만 저장합니다. 기획서의 요구사항(FR/NFR)을 테스트 케이스와 연결해 두었고, Expo(React Native) 한 코드로 안드로이드·iOS를 함께 빌드합니다.",
      highlights: [
        {
          title: "이름에 맞춘 알림 문구",
          body: "이름 마지막 글자의 받침을 한글 유니코드로 계산해 \"아/야\"를 붙입니다. 지민 → 지민아~ 맘마먹자, 수아 → 수아야~ 맘마먹자. 한글이 아니면 \"아\", 이름이 없으면 \"아가야\"로 부릅니다.",
        },
        {
          title: "새벽 모드",
          body: "순백 배경 대신 크림색을 쓰고, 시스템 다크 모드에서는 같은 파스텔을 남보라 위에 올린 새벽 모드로 바뀝니다. 주요 버튼은 화면 아래쪽에 56dp 이상으로 둬 엄지로 누를 수 있게 했습니다.",
        },
        {
          title: "스누즈 · 시작 시각 보정",
          body: "아기가 아직 안 깼으면 \"10분 뒤 다시\"로 재예약하고, 앱을 켜기 전에 수유를 시작했다면 시작 시각을 분 단위로 고칠 수 있습니다. 기록 탭에는 오늘 수유 횟수·총 시간·평균 간격을 보여줍니다.",
        },
        {
          title: "도메인과 플랫폼 분리",
          body: "문구 규칙·시간·세션·알람·통계·상태 리듀서는 프레임워크를 모르는 순수 로직이고, 저장소·알림·진동은 포트로 갈아 끼웁니다. 덕분에 Capacitor에서 Expo로 옮길 때 도메인 코드는 한 줄도 바꾸지 않았습니다.",
        },
      ],
      stack: ["Expo (React Native)", "React", "TypeScript", "expo-notifications", "AsyncStorage", "react-native-svg", "Jest", "React Native Testing Library", "EAS Build"],
      links: [{ label: "GitHub", href: ZZOKZZOK_REPO_URL }],
    },
  },
];

/** 홈에서 카드로 보이는 대표 프로젝트 — 이 순서대로. 나머지는 PROJECTS 순서대로 「그 외 프로젝트」에 접힌다 */
export const FEATURED = ["ask", "gak", "oneureodi"];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
