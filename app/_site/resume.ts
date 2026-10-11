/**
 * 이력서 + 포트폴리오 PDF(/resume) 원고 — SK주식회사 AX 채용(AI 기반 Application 개발/설계) 지원용.
 * 수치는 지원서에 제출한 값과 일치시킨다 (docs/resume-pdf-draft.md 「확정 사항」). 고칠 때는 지원서와 함께 고친다.
 * 넣지 않는 것: 연봉 · 가족 · 주민번호 · 생년월일 · 성별 · 주소 · 사진 · 휴대폰
 */
import { getProject } from "../_data/projects";
import { EMAIL, GITHUB_URL } from "../_data/links";

const repo = (slug: string) => getProject(slug)?.detail?.links?.find((l) => l.label === "GitHub")?.href;
const live = (slug: string) => getProject(slug)?.detail?.links?.find((l) => l.label === "Live")?.href;

export const SITE_URL = "https://usetaehwan.page";

export const CONTACTS = [
  { label: EMAIL, href: `mailto:${EMAIL}` },
  { label: "github.com/JeongTaehwan", href: GITHUB_URL },
  { label: "usetaehwan.page", href: SITE_URL },
];

export const HEADLINE = "커머스 실무에서 쌓은 정합성·검증 중심 개발로, LLM의 결과를 코드로 검증하는 AI 서비스를 설계합니다.";

export const SUMMARY =
  "3년 11개월차 프론트엔드 개발자. 글로벌 커머스의 주문·결제·정산 도메인에서 금액 정합성과 구조 개선을 책임져 왔고, 개인 프로젝트에서 LLM의 판단 범위를 코드로 검증하는 AI 서비스를 설계·배포했습니다. React·Next.js·TypeScript와 FastAPI·NestJS로 화면부터 API·DB까지 직접 구성하고, AI 코딩 도구는 역할을 나누고 결과를 테스트로 검증하는 절차 안에서 씁니다.";

export const STACK = [
  { k: "Frontend", v: "React, Next.js, Vue 3, TypeScript" },
  { k: "Backend", v: "FastAPI · Python, NestJS, Spring Boot" },
  { k: "Data", v: "PostgreSQL, Prisma" },
  { k: "AI", v: "Claude · Gemini API, Tavily, 에이전트 워크플로우, Claude Code · Codex" },
  { k: "Test", v: "Vitest, Cypress, Playwright, pytest" },
  { k: "Infra", v: "GitHub Actions, Vercel, Railway, Neon, Render" },
  { k: "협업", v: "Git · GitLab MR 리뷰 · GitLab CI · 팀 가이드 문서화" },
];

export const COMPANY = {
  name: "(주)셀메이트",
  role: "개발그룹 선임",
  period: "2022.11 ~ 재직 중 (3년 11개월)",
  about: "일본 시장 중심 커머스 플랫폼(입점 브랜드 어드민 · 쇼핑몰 웹앱 · 결제 중개)의 프론트엔드. 2개 브랜드 · 4개 마켓 · 5개 언어를 한 코드베이스로 운영합니다.",
};

export type Job = { title: string; period: string; mr: string; lines: string[] };

export const JOBS: Job[] = [
  {
    title: "신규 쇼핑몰 웹앱 · 앱·웹 공유 TypeScript 코어",
    period: "2026.02 ~ 현재",
    mr: "MR 361건",
    lines: [
      "Flutter 앱을 참조 구현으로 Next.js 웹앱을 신규 구축하고, 앱과 웹이 함께 쓰는 프레임워크 독립 TS 코어 패키지를 설계해 사내 레지스트리로 배포했습니다.",
      "쿠폰 상호 배타·상품쿠폰 per-unit 계산 등 금액 로직을 앱과 1:1로 정합시키고 단위 테스트 759개로 코어 커버리지 **42.0% → 69.3%**, E2E **35개 페이지**를 커버했습니다.",
    ],
  },
  {
    title: "어드민 클린 아키텍처 리팩토링 캠페인 주도",
    period: "2025.09 ~ 2026.08",
    mr: "리팩토링 MR 132건",
    lines: [
      "한 파일에 섞인 UI·상태·로직·API를 Entity / API Repository / UseCase / Store 4계층으로 나눠 주문·포인트·리뷰 등으로 확산, 최대 파일 **1,224 → 499줄(약 59%↓)**.",
      "회귀를 원인 커밋 단위로 추적해 유닛 테스트 **82개**로 봉인하고, 팀 가이드를 AI 협업 규칙(CLAUDE.md)과 연동, 어드민 Vitest **1,345개**·Cypress를 도입했습니다.",
    ],
  },
  {
    title: "결제 중개 서비스 — 멀티 PG 연동",
    period: "2025.03 ~ 2026.03",
    mr: "MR 178건",
    lines: [
      "FastAPI·Jinja2 결제 서비스의 결제창을 맡아 PayPal 주문 생성 → approve → confirm → capture 전 구간을 연동하고, merchant-id별 SDK 동적 로딩으로 복수 PG를 매칭했습니다.",
      "569줄 모놀리식 스크립트를 결제수단별 모듈로 분리하고, PG **6개**(PayPal·INICIS·Eximbay·LINE Pay·Toss 등)의 성공/취소/실패 분기와 **5개 언어** 실패 화면을 정리했습니다.",
    ],
  },
  {
    title: "외부 시스템 연동 — 카페24 OAuth · 매장 주문 WebSocket",
    period: "2025",
    mr: "MR 114건 + 74건",
    lines: [
      "카페24 OAuth 팝업 플로우(postMessage → Promise)를 직접 구현하고 채널 상품 30여 필드 매핑과 WebSocket 진행 알림을 만들었습니다.",
      "매장 주문 시스템의 QR/바코드 스캐너 모드·픽업 상태 머신을 구현하고, 엑셀 업로드를 동기 대기에서 WebSocket 비동기 통지로 바꿨습니다.",
    ],
  },
  {
    title: "커머스 어드민 — 금액이 걸린 도메인 구축",
    period: "2023.05 ~ 현재",
    mr: "MR 642건",
    lines: [
      "PG·MID, 쿠폰·할인정책·정산·마진 통계, 세트상품을 신규 구축했습니다. 마진 통계는 \"응답값 그대로 표시, 재계산 금지\" 원칙으로 서버와의 금액 불일치를 차단했습니다.",
      "세트상품을 등록부터 주문 8개 페이지·구성상품 조합(cartesian product)까지 관통 구현하고, 매출·주문 통계 4종을 만들었습니다.",
    ],
  },
];

export const JOB_ETC =
  "i18n 5개 언어 도입, Webpack→Vite·Jest→Vitest 전환(196개 파일), 2개 브랜드 배포 CI 구성, 전사 컨퍼런스 발표 「브라우저 렌더링과 SSR·CSR」(2024)";

export const AI_TALK = {
  label: "AI 코딩 도구 활용 · 사내 발표",
  title: "Claude Code 기반 E2E 테스트 자동화",
  venue: "사내 AI 활용 공유 세션 7회차 · 2026.05",
  body: "참조 앱의 파일:라인을 정답으로 먼저 고정하는 증거 기반 시나리오 작성법으로, 77개 페이지 시나리오 약 700건 · Cypress 515케이스 · QA 체크리스트 83항목 기준선을 만들고 팀에 공유했습니다.",
};

export type SideProject = { name: string; period: string; stack: string; body: string; href?: string };

export const SIDE_PROJECTS: SideProject[] = [
  {
    name: "오늘어디",
    period: "2026.09 ~",
    stack: "Expo · NestJS · Gemini · Tavily",
    body: "사실은 API가, 규칙은 코드가, 취향 판단만 LLM이 맡는 데이트 코스 추천 앱. 출처 번호로 근거를 추적하고, 호출을 나눠 응답을 20초+ → 3~5초로 줄였습니다. 판정 로직 테스트 56개.",
    href: repo("oneureodi"),
  },
  {
    name: "각(Gak)",
    period: "2026.07 ~",
    stack: "Spring Boot · Next.js · PostgreSQL · Anthropic API",
    body: "서버가 계산한 지표를 LLM이 문장으로만 옮기는 축구 진단 앱. LLM 응답의 의미를 코드로 검증하고, 사람·구현 AI·검증 AI 역할 분리 파이프라인으로 인수 테스트 109건, 백엔드 테스트 289개.",
    href: repo("gak"),
  },
  {
    name: "Orbit",
    period: "2026.07",
    stack: "FastAPI · PostgreSQL · Next.js",
    body: "학습 기록 동기부여 웹앱을 백엔드·DB·인증·배포까지 혼자 구성. iOS Safari 쿠키 차단을 동일 출처 프록시로 해결, pytest 65 · Vitest 102 · Playwright 29.",
    href: repo("orbit"),
  },
  {
    name: "끼니",
    period: "2026.09 ~",
    stack: "Expo · Claude Code 에이전트 팀",
    body: "역할별 모델(opus·sonnet·haiku)을 나눈 7개 에이전트 팀으로 한 줄 요구에서 요구사항 초안·Expo 프로토타입까지 만든 PoC. Playwright 스모크 53건.",
    href: repo("kkini"),
  },
];

export const EDUCATION = [
  { name: "배화여자대학교 모바일소프트웨어과 전문학사", note: "고숙련 일학습병행 P-TECH · 평점 3.98 / 4.5", period: "2024.03 ~ 2026.01" },
  { name: "광주소프트웨어마이스터고등학교 졸업", note: "", period: "2020.03 ~ 2023.01" },
];

export const AWARDS = [
  { name: "정보처리기능사 (현 프로그래밍기능사)", period: "2021.10" },
  { name: "일학습병행자격 SW개발 L5", period: "2025.12" },
  { name: "교내 UCC 경진대회 대상", period: "2025.07" },
  { name: "4개교 연합 해커톤 네이버 클로바 기업상", period: "2021.11" },
];

/* ───────── 포트폴리오 ───────── */

/** 구조도 한 칸 — llm: LLM 단계(포인트 색), code: 결정적 코드, ext: 외부 API·서비스, store: 저장소 */
export type FlowNode = { t: string; s?: string; kind?: "llm" | "code" | "ext" | "store" };
export type FlowStep = FlowNode | FlowNode[];

export type Case = {
  no: string;
  /** 글이 많은 쪽 — 섹션 간격을 한 단계 줄여 한 쪽에 맞춘다 */
  dense?: boolean;
  slug: string;
  kind: string;
  title: string;
  tagline: string;
  meta: string;
  links?: { label: string; href: string }[];
  problem: string;
  decision: string;
  build: string[];
  results: { v: string; l: string }[];
  stack: string;
  flow: { caption: string; steps: FlowStep[] };
};

export const CASES: Case[] = [
  {
    no: "01",
    dense: true,
    slug: "oneureodi",
    kind: "개인 · AI 서비스",
    title: "오늘어디",
    tagline: "사실은 API가, 규칙은 코드가, 취향 판단만 LLM이 — 데이트 코스 추천 앱",
    meta: "2026.09 ~ · 기획 · 풀스택",
    links: [{ label: "GitHub", href: repo("oneureodi")! }],
    problem:
      "코스 추천을 LLM에 통째로 맡기면 없는 가게, 지어낸 버스 시간, 예산 초과 코스가 섞였습니다. 웹 조사까지 한 호출에 넣으면 20초가 넘었고 근거 출처도 남지 않았습니다.",
    decision:
      "LLM의 일은 \"비정형 글 구조화\"와 \"후보 안에서 고르기\" 둘로 한정했습니다. 좌표·경로·시간은 카카오 API, 예산·주차·영업 시간은 코드가 판정하고, 모르는 값은 0이 아니라 \"모름\"으로 다룹니다.",
    build: [
      "추천 1회의 LLM 호출은 추출 3번 + 조합 1번뿐, 나머지는 결정적인 코드입니다.",
      "Tavily로 블로그·인스타·웹을 출처별로 검색하고 본문에 [1] 번호를 붙여, LLM은 번호로만 출처를 돌려주게 해 링크를 지어낼 수 없게 했습니다.",
      "LLM이 낸 코스를 코드가 다시 검사합니다 — 후보에 없는 장소 제거, 알려진 가격 합 × 2가 예산을 넘거나 시간표가 안 맞는 코스 탈락.",
      "결측 처리 — 가격을 모르면 합계에서 빼고 \"+α\", 주차 정보 없음 표시, 경로 API 실패 시 직선거리 × 1.3 어림값을 \"어림\"으로 표기.",
      "네이버 검색 API는 개정 약관이 검색 결과의 AI 입력·저장을 금지해 쓰지 않았습니다.",
    ],
    results: [
      { v: "20초+ → 3~5초", l: "출처별 병렬 추출 (무료 등급 모델)" },
      { v: "4~5초", l: "지역 캐시 적중 시 (첫 조사 13~20초)" },
      { v: "4회", l: "추천 1회당 LLM 호출 (추출 3 + 조합 1)" },
      { v: "56개", l: "API 없이 도는 판정 로직 테스트" },
    ],
    stack: "Expo · TypeScript · NestJS · PostgreSQL · Prisma · zod · Gemini · Tavily · Kakao API · Render",
    flow: {
      caption: "추천 한 번의 흐름 — LLM은 두 지점에만 들어가고, 앞뒤를 코드가 감싼다",
      steps: [
        { t: "입력 · 좌표 변환", s: "성향·예산·차·시간 → 카카오", kind: "ext" },
        [
          { t: "지도 검색", s: "카카오 로컬", kind: "ext" },
          { t: "웹 조사 → 추출 ×3", s: "Tavily + LLM", kind: "llm" },
        ],
        { t: "이름 매칭 · 필터", s: "코드", kind: "code" },
        { t: "코스 조합", s: "LLM", kind: "llm" },
        { t: "코드 검증", s: "후보·예산·시간표", kind: "code" },
        { t: "경로 · 시간표", s: "카카오 모빌리티", kind: "ext" },
      ],
    },
  },
  {
    no: "02",
    dense: true,
    slug: "gak",
    kind: "개인 · AI 서비스",
    title: "각(Gak)",
    tagline: "숫자는 서버가, 문장만 LLM이 — 팀 일정 기반 축구 진단·예측 웹앱",
    meta: "2026.07 ~ · 기획 · 풀스택",
    links: [{ label: "GitHub", href: repo("gak")! }],
    problem:
      "'AI 분석' 배지가 붙었는데 화면은 빈 껍데기였습니다({\"headline\":\"placeholder\", \"metric\":\"\"}). 저장된 AI 진단은 서버를 다시 띄울 때마다 조용히 버려졌고, 외부 데이터 API는 하루 100요청이었습니다.",
    decision:
      "스키마 통과(형식)와 내용 유효(의미)는 다른 검증입니다. 숫자는 서버가 만들고 LLM은 계산 결과를 문장으로만 옮기게 했고, 재현되는 원인은 실측으로 확인한 뒤에만 규칙으로 올렸습니다.",
    build: [
      "환각 억제 세 겹 — 재료 통제(프롬프트 재료를 코드가 만든다) → 코드 게이트(표본 5건 미만이면 호출하지 않음) → 응답 검증(빈 값 거부)에 스키마를 더했습니다.",
      "프롬프트 지문 불일치 — Map.copyOf의 순회 순서가 JVM 기동마다 SALT로 바뀌는 것을 30회 기동 · 7가지 순서로 실측하고, enum 순서 고정 + 회귀 테스트로 봉인한 뒤 규칙으로 승격했습니다.",
      "캡처-리플레이 동기화 — 실호출 원본 15개를 캡처해 기본 모드를 replay로 두고 예산 상한을 80으로 낮춰, 개발 중 실 API 호출 0회.",
      "사람 판단 / 구현 AI / 다른 벤더 검증 AI로 역할을 나눈 10단계 파이프라인과 게이트(요구사항 승인 전 구현 금지 등)로 개발했습니다.",
      "지표 정의를 실제 52경기로 검산해, 문장으로는 자연스럽지만 변별력이 없던 추천안을 기각했습니다.",
    ],
    results: [
      { v: "289개", l: "백엔드 자동 테스트" },
      { v: "109건", l: "검증 AI가 요구사항에서 뽑은 인수 테스트" },
      { v: "30회 · 7가지", l: "JVM 기동 실측으로 찾은 순회 순서" },
      { v: "0회", l: "캡처 이후 개발 중 실 API 호출" },
    ],
    stack: "Spring Boot 3.5 · Java 21 · Next.js 15 · TypeScript · PostgreSQL(Neon) · Anthropic API · Claude Code",
    flow: {
      caption: "진단 한 건의 흐름 — LLM 앞에는 게이트, 뒤에는 의미 검증",
      steps: [
        { t: "외부 데이터 API", s: "캡처 / 리플레이", kind: "ext" },
        { t: "지표 계산", s: "서버 (밀집도·폼)", kind: "code" },
        { t: "코드 게이트", s: "표본 5건 미만 차단", kind: "code" },
        { t: "문장화", s: "LLM", kind: "llm" },
        { t: "의미 검증", s: "빈 값 거부", kind: "code" },
        { t: "저장 · 재사용", s: "프롬프트 SHA-256", kind: "store" },
      ],
    },
  },
  {
    no: "03",
    slug: "commerce-core",
    kind: "회사 · (주)셀메이트",
    title: "신규 쇼핑몰 웹앱 + 앱·웹 공유 TS 코어",
    tagline: "앱과 웹이 같은 금액을 내도록, 금액 로직을 한 패키지로",
    meta: "2026.02 ~ 현재 · MR 361건 (화면 244 / 코어 117)",
    problem:
      "Flutter 앱만 있던 쇼핑몰에 웹 버전이 필요했습니다. 쿠폰·세트상품 같은 금액 계산을 앱과 웹이 따로 구현하면, 같은 주문이 다른 금액으로 결제될 수 있었습니다.",
    decision:
      "화면과 로직을 2계층으로 나눠, 금액 로직은 프레임워크 독립 TS 코어 하나로 앱과 웹이 공유하게 했습니다. 정답은 참조 앱의 동작으로 먼저 고정하고 테스트로 묶었습니다.",
    build: [
      "코어 패키지를 사내 레지스트리에 release/publish CI로 배포하고, stage dist-tag로 환경을 분기했습니다.",
      "쿠폰 상호 배타(주문/상품/배송 쿠폰 간 상호 초기화)와 상품쿠폰 per-unit 계산을 앱과 1:1로 정합시켰습니다.",
      "세트상품 구매 파이프라인(상품상세 → 카트 → 체크아웃 → PG 금액 정합), 비회원 구매, LINE 로그인, 독립몰 SSO를 구현했습니다.",
      "실배포 후 무파라미터 카트 조회가 백엔드를 폭주시킨 문제를 페이지네이션 전환 + 중복 호출 제거로 잡고 회귀 e2e 스펙을 추가했습니다.",
      "AI 코딩 도구 활용 — 참조 앱의 파일:라인을 정답으로 고정하는 방식으로 Claude Code와 E2E 시나리오 약 700건 · Cypress 515케이스 기준선을 만들고 사내 세션에서 발표했습니다.",
    ],
    results: [
      { v: "759개", l: "코어 단위 테스트" },
      { v: "42.0% → 69.3%", l: "코어 커버리지" },
      { v: "35개 페이지", l: "E2E 커버" },
      { v: "361건", l: "머지된 MR" },
    ],
    stack: "Next.js · React · TypeScript · Vitest · Cypress · GitLab CI · Claude Code",
    flow: {
      caption: "금액 로직은 한 곳 — 앱과 웹은 같은 코어를 소비한다",
      steps: [
        [
          { t: "Flutter 앱", s: "참조 구현", kind: "ext" },
          { t: "Next.js 웹앱", s: "화면 MR 244", kind: "code" },
        ],
        { t: "공유 TS 코어", s: "금액·쿠폰·세트 · 테스트 759", kind: "code" },
        { t: "release / publish CI", s: "stage dist-tag", kind: "code" },
        { t: "사내 패키지 레지스트리", kind: "store" },
      ],
    },
  },
  {
    no: "04",
    slug: "admin-refactor",
    kind: "회사 · (주)셀메이트",
    title: "어드민 클린 아키텍처 리팩토링",
    tagline: "동작은 그대로, 구조만 바꾼다 — 4계층 분리 캠페인 주도",
    meta: "2025.09 ~ 2026.08 · 리팩토링 MR 132건",
    problem:
      "UI·상태·로직·API 호출이 한 파일에 섞인 어드민 페이지가 많았고, 최대 파일(주문 관리)은 1,224줄이었습니다. 수정할 때마다 금액 표시가 흔들릴 위험이 있었습니다.",
    decision:
      "Entity / API Repository / UseCase / Store 4계층으로 나누되 백엔드 페이로드는 그대로 보존했습니다. 사용처가 많은 공통 컴포넌트는 위험도 기준 2단계로 옮기고, 규칙은 문서로 만들어 사람과 AI가 같은 기준을 따르게 했습니다.",
    build: [
      "콘텐츠 도메인에서 시작해 주문·포인트·리뷰·카테고리·MID로 확산했고, 주문 9개 페이지에 엔티티 6종·API 17개·useCase 12종을 신설했습니다.",
      "회귀(송장번호 버튼 미노출, 클레임 카운트 누적)를 원인 커밋 단위로 역추적해 수정하고 테스트로 봉인했습니다.",
      "computed 내부 ref 부수효과로 세금·배송비 표시가 흔들릴 수 있던 잠복 결함 3건을 발굴했습니다.",
      "사용처 100곳 이상인 공통 컴포넌트 42개를 위험도 2단계로 나눠 전환했습니다.",
      "팀 리팩토링 가이드를 제정하고 AI 협업 규칙(CLAUDE.md)과 연동해, 이후 MR의 준거로 운영했습니다.",
    ],
    results: [
      { v: "1,224 → 499줄", l: "최대 파일 (약 59%↓)" },
      { v: "82개", l: "회귀 봉인 유닛 테스트" },
      { v: "1,345개", l: "어드민 Vitest + Cypress e2e 도입" },
      { v: "132건", l: "리팩토링 MR" },
    ],
    stack: "Vue 3 · TypeScript · Pinia · Quasar · Vitest · Cypress · Claude Code",
    flow: {
      caption: "페이지 하나를 네 층으로 — 화면은 UseCase만 부른다",
      steps: [
        { t: "View", s: "화면 · 컴포넌트", kind: "code" },
        { t: "Store", s: "상태", kind: "code" },
        { t: "UseCase", s: "업무 규칙", kind: "code" },
        { t: "API Repository", s: "페이로드 보존", kind: "ext" },
        { t: "Entity", s: "도메인 모델", kind: "store" },
      ],
    },
  },
  {
    no: "05",
    slug: "payments",
    kind: "회사 · (주)셀메이트",
    title: "결제 중개 서비스 · 멀티 PG",
    tagline: "하나의 결제창에 여러 PG를 — 앱 웹뷰 제약까지",
    meta: "2025.03 ~ 2026.03 · MR 178건 · 결제창 담당",
    problem:
      "같은 결제수단에 복수 PG가 물리는 구조였고, 앱 웹뷰에서는 PayPal SDK가 동작하지 않았습니다. 결제 스크립트는 569줄 한 파일이었습니다.",
    decision:
      "merchant-id별로 SDK를 동적 로딩하고 pg_authentication_id 기준으로 벤더를 매칭했습니다. 웹뷰는 SDK를 억지로 살리지 않고 외부 브라우저 플로우로 우회했고, 결제수단별로 모듈을 나눠 PG 추가가 기존 코드를 건드리지 않게 했습니다.",
    build: [
      "PayPal 주문 생성 → approve → confirm → capture 전 구간을 연동했습니다.",
      "웹뷰 우회 — localStorage 브리지 + 전용 페이지로 외부 브라우저에서 결제를 마치게 했습니다.",
      "569줄 스크립트를 PayPal · Apple Pay · Google Pay · 카드 모듈로 분리했습니다.",
      "멀티 PG의 성공/취소/실패 리다이렉트 분기, 5개 언어 실패 화면, PG별 에러 Sentry 로깅을 정리했습니다.",
      "로컬 재현이 어려운 결제를 스테이지·QA 환경 반복 배포로 검증했습니다.",
    ],
    results: [
      { v: "PG 6개", l: "PayPal · INICIS · Eximbay · LINE Pay · Toss 등" },
      { v: "5개 언어", l: "실패 화면" },
      { v: "569줄 → 4개 모듈", l: "결제수단별 분리" },
      { v: "178건", l: "머지된 MR" },
    ],
    stack: "FastAPI · Jinja2 · JavaScript(ES Modules) · PayPal JS SDK · Sentry",
    flow: {
      caption: "결제창은 PG를 몰라도 된다 — 매칭과 분기는 모듈이 맡는다",
      steps: [
        { t: "결제창", s: "FastAPI · Jinja2", kind: "code" },
        { t: "PG 매칭", s: "merchant-id · SDK 동적 로딩", kind: "code" },
        { t: "PG 6개", s: "PayPal · INICIS · Eximbay · LINE Pay · Toss 등", kind: "ext" },
        { t: "성공 / 취소 / 실패", s: "리다이렉트 분기", kind: "code" },
        { t: "5개 언어 화면", s: "+ Sentry 로깅", kind: "store" },
      ],
    },
  },
  {
    no: "06",
    slug: "orbit",
    kind: "개인 · 풀스택",
    title: "Orbit",
    tagline: "프론트엔드 개발자가 백엔드·DB·배포까지 — 학습 동기부여 웹앱",
    meta: "2026.07 · 기획 · 풀스택",
    links: [
      { label: "Live", href: live("orbit")! },
      { label: "GitHub", href: repo("orbit")! },
    ],
    problem:
      "PC에서는 정상인데 iOS Safari에서만 로그인 직후 세션이 사라졌습니다. 진행도·스트릭을 따로 저장하면 기록을 지울 때 실제와 어긋날 수 있었습니다.",
    decision:
      "프론트(Vercel)와 백엔드(Railway)가 다른 사이트라 세션 쿠키가 제3자 쿠키로 차단된 것이었습니다. 쿠키 속성을 푸는(SameSite=None) 대신 브라우저 입장에서 같은 출처가 되게 했고, 파생값은 저장하지 않고 계산하게 했습니다.",
    build: [
      "Next.js rewrites로 /api 프록시를 두어 same-origin 요청으로 바꾸고, 쿠키는 SameSite=Lax로 되돌렸습니다.",
      "CORS · OAuth 콜백 · 쿠키 속성을 환경변수로 분리해 배포 환경마다 바꿀 수 있게 했습니다.",
      "FastAPI를 api → services → models로 계층화하고, 진행도·스트릭은 조회 시 기록에서 계산합니다(UTC → KST 자정 경계).",
      "Vercel · Railway · Neon · Cloudinary로 분리 배포하고, GitHub Actions CI에서 ruff/pytest · tsc/eslint/vitest를 돌립니다.",
    ],
    results: [
      { v: "65개", l: "pytest" },
      { v: "102개", l: "Vitest" },
      { v: "29개", l: "Playwright E2E" },
      { v: "같은 출처", l: "/api 프록시로 iOS Safari 세션 유실 해결" },
    ],
    stack: "Next.js · React · TypeScript · React Three Fiber · FastAPI · PostgreSQL · Google OAuth · GitHub Actions · Vercel · Railway · Neon",
    flow: {
      caption: "브라우저가 보기엔 한 출처 — 쿠키는 퍼스트파티로 남는다",
      steps: [
        { t: "브라우저", s: "iOS Safari 포함", kind: "ext" },
        { t: "Vercel · Next.js", s: "/api rewrite (같은 출처)", kind: "code" },
        { t: "Railway · FastAPI", s: "api → services → models", kind: "code" },
        { t: "Neon · PostgreSQL", kind: "store" },
      ],
    },
  },
];
