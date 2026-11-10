/**
 * 이력서 + 포트폴리오 PDF(/resume) 원고 — 기본본(3쪽). 회사별 버전은 scripts/resume-variants.mts.
 * 1쪽 이력서(소개 · 기술 · 경력·학력·자격) · 2쪽 프로젝트 · 기술·AI 활용 · 3쪽 대표 포트폴리오 하나.
 * 문제 → 한 것 → 결과 순서로, 한 항목 2~3줄. MR 건수처럼 양을 보여 주는 숫자는 쓰지 않고 결과 숫자만 쓴다.
 * 넣지 않는 것: 연봉 · 가족 · 주민번호 · 생년월일 · 성별 · 주소 · 사진 · 휴대폰
 */
import { getProject } from "../_data/projects";
import { AI_SETUP } from "../_data/ai-practices";
import { EMAIL, GITHUB_URL } from "../_data/links";
import { CAREER_LENGTH } from "../_data/career";
import { CAREER_INTRO, CERTIFICATIONS, LEAD_ROLE } from "../_data/experience";
import { INTRO } from "./intro";

const repo = (slug: string) => getProject(slug)?.detail?.links?.find((l) => l.label === "GitHub")?.href;
const live = (slug: string) => getProject(slug)?.detail?.links?.find((l) => l.label === "Live")?.href;

export const SITE_URL = "https://usetaehwan.page";

export const CONTACTS = [
  { label: EMAIL, href: `mailto:${EMAIL}` },
  { label: "github.com/JeongTaehwan", href: GITHUB_URL },
  { label: "usetaehwan.page", href: SITE_URL },
];

/** 상단 소개 — 홈 소개(intro.ts)를 한 문단으로 잇는다 */
export const SUMMARY = INTRO.join(" ");

/** 지원 직무 순서 — 프론트엔드가 앞, 백엔드·AI 서버 쪽은 맨 뒤 「그 외」 */
export const STACK = [
  { k: "Frontend", v: "React, TypeScript, Next.js, Vue 3 · Pinia, Tailwind · 테스트 Vitest, Cypress, Playwright" },
  { k: "AI 도구", v: "Claude Code · Codex, Claude · Gemini API, 에이전트 워크플로우" },
  { k: "Infra", v: "GitLab CI, GitHub Actions, Vercel" },
  { k: "그 외", v: "Python · FastAPI · LangGraph · PostgreSQL(pgvector), NestJS, Spring Boot, pytest" },
];

export const COMPANY = {
  name: "(주)셀메이트",
  role: "개발그룹 선임",
  period: `2022.11 ~ 재직 중 (${CAREER_LENGTH})`,
  about: `${CAREER_INTRO} 신규 쇼핑몰 웹앱은 전체 활성 사용자의 약 94%가 쓰는 웹 채널입니다.`,
};

export { LEAD_ROLE };

export type Job = { title: string; period: string; lines: string[] };

/** 회사별 버전(resume-variants.mts)은 이 제목으로 순서를 바꾼다 — 제목을 고치면 거기도 고친다 */
export const JOBS: Job[] = [
  {
    title: "신규 쇼핑몰 웹앱 · 앱·웹 공유 TypeScript 코어",
    period: "2026.02 ~ 현재",
    lines: [
      "앱과 웹이 금액을 따로 계산하면 같은 주문이 다른 금액이 될 수 있어, Next.js 웹앱을 새로 만들며 금액 로직은 앱·웹 공유 TS 코어 패키지로 모아 사내 레지스트리로 배포했습니다.",
      "쿠폰 상호 배타 · 상품쿠폰 per-unit 계산을 앱과 같은 결과로 맞추고, 단위 테스트 759개로 커버리지 **42.0% → 69.3%**.",
    ],
  },
  {
    title: "어드민 구조·기반 개선",
    period: "2023.08 ~ 2026.08",
    lines: [
      "파일이 너무 커서 읽기 어렵고 고칠 때 확인 범위가 넓었습니다. Page · Component · Store · Use Case · Adapter · Entity로 책임을 나누는 리팩토링을 주도하고, Composable/Helper 기준과 변경 전 명세서·계획서 규칙을 문서화했습니다.",
      // TODO(태환 확인): 지시문은 "82개를 먼저 깔고" — 기존 기록은 회귀가 난 뒤 남긴 테스트. 순서 확인
      "회귀를 막는 테스트 82개를 남기며 최대 파일 **1,224 → 499줄(59%↓)** · i18n 5개 언어 · Vite·Vitest 전환 · 2개 브랜드 배포 CI.",
    ],
  },
  {
    title: "결제 중개 서비스 — 결제창",
    period: "2025.03 ~ 2026.03",
    lines: [
      "PG 하나를 바꿔도 569줄 스크립트 전체를 건드려야 해서, PG별 예외 처리를 **4개 모듈**로 나눴습니다.",
      "PayPal은 처음부터 끝까지 직접 연동하고, PG 6개는 성공·취소·실패 분기와 에러 처리를 정리, 실패 화면은 5개 언어로.",
    ],
  },
  {
    title: "외부 시스템 연동 — 카페24 OAuth · 매장 주문 WebSocket",
    period: "2025",
    lines: ["카페24 OAuth 팝업 · 상품 30여 필드 매핑, 끝날 때까지 기다리던 엑셀 업로드는 WebSocket 알림으로."],
  },
  {
    title: "커머스 어드민 — 금액이 걸린 도메인 구축",
    period: "2023.05 ~ 현재",
    lines: ["서버와 금액이 어긋나지 않게 마진 통계는 \"응답값 그대로 표시\" 원칙으로, PG·MID · 쿠폰·정산 · 세트상품을 새로 구축."],
  },
];

/* ───────── 학력 · 자격 · 수상 — 경력과 한 섹션 ───────── */

export const EDUCATION = [
  { name: "배화여자대학교 모바일소프트웨어과 전문학사", note: "고숙련 일학습병행 P-TECH · 평점 3.98 / 4.5", period: "2024.02 ~ 2026.02" },
  { name: "광주소프트웨어마이스터고등학교 졸업", note: "", period: "2020.03 ~ 2023.01" },
];

const L5 = CERTIFICATIONS.find((c) => c.code === "SW개발_L5_20V1")!;

export const AWARDS = [
  { name: "일학습병행자격 SW개발_L5_20V1", note: L5.note, period: "2025.12" },
  { name: "정보처리기능사 (현 프로그래밍기능사)", note: null, period: "2021.10" },
  { name: "2021 소프트웨어마이스터고 4개교 연합 해커톤 네이버 클로바 기업상", note: null, period: "2021.11" },
];

/* ───────── 2쪽 — 프로젝트 · 기술·AI 활용 ───────── */

/** 프로젝트 — 한 줄(무엇을 해결했나) + 결과 숫자 하나. 문구 원본은 projects.ts 의 hook · stat */
const PROJECT_SLUGS = ["ask", "usetaehwan-ui", "gak", "oneureodi", "orbit"];

export type SideProject = { slug: string; name: string; period: string; hook: string; stat?: { value: string; label: string }; href?: string; live?: string };

export const SIDE_PROJECTS: SideProject[] = PROJECT_SLUGS.map((slug) => {
  const p = getProject(slug)!;
  return { slug, name: p.name, period: p.year, hook: p.hook, stat: p.stat, href: repo(slug), live: live(slug) };
});

/** 기술·AI 활용 — 카드에서 뺀 프로젝트별 기술과 AI를 쓴 곳 */
export const PROJECT_TECH = PROJECT_SLUGS.map((slug) => {
  const p = getProject(slug)!;
  return { name: p.name, stack: p.tags.join(" · "), ai: p.ai };
});

export { AI_SETUP };

/** 발표 — AI 발표와 D² 발표를 한곳에 */
export const TALK_LINES = [
  {
    title: "Claude Code 기반 E2E 테스트 자동화",
    venue: "사내 AI 활용 공유 세션 7회차 · 2026.05",
    body: "참조 앱의 파일:라인을 정답으로 먼저 고정하는 시나리오 작성법으로 E2E 기준선을 만들어 팀에 공유",
  },
  {
    title: "브라우저 렌더링과 SSR·CSR",
    venue: "전사 개발자 컨퍼런스 D² · 프론트엔드팀 대표 연사 · 2024",
    body: "",
  },
];

/* ───────── 3쪽 — 대표 포트폴리오 ───────── */

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
    slug: "ask",
    kind: "개인 · AI 서비스",
    title: "정태환에게 물어보기",
    tagline: "근거가 없으면 답하지 않는다 — 포트폴리오 RAG 챗봇",
    meta: "2026.10 · 기획 · 풀스택",
    links: [
      { label: "Live", href: live("ask")! },
      { label: "GitHub", href: repo("ask")! },
    ],
    problem:
      "포트폴리오에 대한 질문에 LLM이 그럴듯하게 지어내면 안 됩니다. 그런데 첫 실측에서 인용 정확도(LLM 심사)는 78%(39/50)였습니다.",
    decision:
      "근거가 없으면 답하지 않게 했습니다. LLM은 분류·관련성 판정·작성 세 곳에만 두고, 인용 번호와 숫자는 코드가 검증해 통과한 답만 내보냅니다. 수치가 나쁠 때는 모델보다 측정 도구부터 검증했습니다.",
    build: [
      "측정부터 검증 — 심사 FALSE 11건을 직접 검수하니 10건이 심사 오판(심사 모델이 근거 제목·섹션을 못 받음)이었습니다. 심사 입력을 생성과 통일하고 3회 다수결로 바꿔 98.1%(51/52).",
      "후보 8 → 15개에서 85.7%로 떨어진 인용 정확도를 생성 프롬프트(사실마다 근거 번호, 범위 단정 금지)로 98.1%(52/53) · 항목 재현율 11/11로 되돌렸습니다. 이 실행의 심사 TRUE 52쌍 중 무작위 20쌍은 사람이 블라인드로 검수해 20/20 일치(2건은 채점 기준 재확인 후 수정).",
      "조정 전에 커밋해 둔 holdout으로 확인 — 미리 정한 조건(인용 95%↑ · p95 10초↓)을 holdout-2(8문항·1회) 인용 15/15 · p95 6.96초로 통과해 채택했습니다.",
      "운영 모드에서 DB 주소·비밀값·모델 키가 없거나 기본값이면 시작을 거부하고, 로그엔 있음/없음만 남깁니다.",
      "한계 — 여러 근거 질문에서 관련성 판정이 맞는 근거를 걸러 항목을 빠뜨립니다(holdout-2 항목 재현율 2/4).",
    ],
    results: [
      { v: "78% → 98.1%", l: "인용 정확도 (LLM 심사) — 측정을 고친 뒤" },
      { v: "10 / 11", l: "사람이 검수한 심사 FALSE 중 심사 오판" },
      { v: "5/5 · 4/4", l: "개인정보·범위 밖 거절 · 인젝션 대응 (30문항)" },
      { v: "$0.00079", l: "질문당 생성 비용 평균 (30문항)" },
    ],
    stack: "Python · FastAPI · LangGraph · PostgreSQL(pgvector, Neon) · Gemini 임베딩 · Claude Haiku · SSE · Docker · Railway · Next.js",
    flow: {
      caption: "질문 한 건의 흐름 — LLM은 세 곳에만 · 코드 검증에 걸리면 1회 재작성, 그래도 실패하면 검증된 문장만(fallback) · 갈래: refuse / no_evidence",
      steps: [
        { t: "pre_guard", s: "개인정보 규칙", kind: "code" },
        { t: "classify", s: "LLM", kind: "llm" },
        { t: "retrieve", s: "pgvector top-15", kind: "store" },
        { t: "grade", s: "LLM", kind: "llm" },
        { t: "generate", s: "LLM", kind: "llm" },
        { t: "verify", s: "코드 · 인용·숫자", kind: "code" },
        { t: "finalize", s: "검증된 답 + 출처", kind: "code" },
      ],
    },
  },
];
