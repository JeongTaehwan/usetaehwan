import Link from "next/link";
import { Badge, Button, Container, Heading, Text } from "@usetaehwan/ui";
import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { Reveal } from "./_components/Reveal";
import { TokenPlayground } from "./_components/TokenPlayground";
import { PROJECTS } from "./_data/projects";

/* ─────────────────────────────────────────────
   섹션 공통 껍데기: 왼쪽 라벨(.about / § 01) + 오른쪽 본문.
   모바일에선 세로로 쌓인다. Reveal로 스크롤 진입 모션.
   ───────────────────────────────────────────── */
function Section({
  id,
  label,
  index,
  children,
}: {
  id: string;
  label: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section">
      <section id={id} className="scroll-mt-20 border-t border-border py-16 sm:py-24">
        <Container size="lg">
          <div className="grid gap-8 md:grid-cols-[7rem_minmax(0,1fr)_7rem] md:gap-8">
            <div className="md:pt-2">
              <Text as="div" variant="muted" className="font-mono text-brand">
                .{label}
              </Text>
              <Text as="div" variant="small" className="mt-1 font-mono">
                § {index}
              </Text>
            </div>
            <div>{children}</div>
            {/* 오른쪽 대칭 거터: 왼쪽 라벨 폭만큼 비워 본문을 페이지 중앙에 정렬 */}
            <div aria-hidden className="hidden md:block" />
          </div>
        </Container>
      </section>
    </Reveal>
  );
}

/* ── 콘텐츠 데이터 ── */

const EXPERIENCE = [
  {
    title: "결제 중개 서비스 — PayPal PG 엔드투엔드 연동 (2025.03 – 2026.03)",
    summary:
      "FastAPI + Jinja2 결제창의 프론트(바닐라 JS ES 모듈)를 맡아 PayPal을 주문 생성 → approve → confirm → capture 전 구간으로 연동했습니다(MR 178건). 동일 결제수단에 복수 PG가 물리는 구조라 merchant-id별 SDK 동적 로딩과 PG 벤더 매칭을 설계했고, 앱 웹뷰에서 SDK가 동작하지 않는 제약은 외부 브라우저 플로우로 우회했습니다. 569줄 모놀리식 스크립트를 PayPal·Apple Pay·Google Pay·카드 모듈로 분리하고, INICIS·Eximbay·LINE Pay·Toss까지 멀티 PG의 성공/취소/실패 분기와 5개 언어 실패 화면, PG별 에러 Sentry 로깅을 정리했습니다.",
  },
  {
    title: "커머스 어드민 — 금액이 걸린 도메인 구축 (2023.05 – 현재)",
    summary:
      "PG·MID 관리, 쿠폰·할인정책·정산·마진 통계, 세트상품처럼 금액 계산이 얽힌 도메인을 신규 구축했습니다. 실제 마진 통계는 프론트가 재계산하면 서버와 어긋날 수 있어 '응답값 그대로 표시, 재계산 금지' 원칙을 세우고 0 나눗셈·음수만 가드했습니다. 세트상품은 등록·상세부터 주문 8개 페이지와 신규주문 생성(구성상품 variants의 cartesian product 조합)까지 관통 구현했고, 입점 브랜드 상품 검수 워크플로(5개월·MR 41건)와 매출·주문 통계 4종(추세선 최소제곱법 직접 계산, 월 선택기 자체 제작)도 만들었습니다.",
  },
  {
    title: "외부 시스템 연동 — 판매채널 OAuth · 매장 주문 WebSocket (2025)",
    summary:
      "카페24 외부 판매채널 연동(MR 114건)에서 OAuth 팝업 플로우를 직접 구현했습니다 — authorize 파라미터 수신 → 팝업 → 콜백의 code/state를 postMessage로 받아 Promise resolver에 연결하고, 팝업 차단·토큰 만료를 예외 처리했습니다. 채널 상품 → 자사 상품 30여 필드 매핑과 WebSocket 진행 상태 플로팅 알림을 만들고, 이후 내보내기와 중국 Youzan 채널로 확장하면서 채널별 정책 차이를 엔티티 레이어에 격리했습니다. 오프라인 매장 주문 시스템(MR 74건·4개월)에서는 QR/바코드 스캐너 모드와 픽업 상태 머신을 구현하고, 배송처리 엑셀 업로드를 동기 대기에서 WebSocket 비동기 통지로 바꿨습니다.",
  },
  {
    title: "신규 쇼핑몰 웹앱 · 앱·웹 공유 도메인 코어 (2026.02 – 현재)",
    summary:
      "Flutter 모바일 앱을 참조 구현으로 삼아 웹 버전을 Next.js로 신규 구축하고, 앱과 웹이 공유하는 프레임워크 독립 TypeScript 코어 패키지를 만들었습니다(MR 361건 — 화면 244·코어 117). 코어는 사내 패키지 레지스트리에 release/publish CI로 배포하고, 쿠폰 상호 배타 로직과 상품쿠폰 per-unit 계산 등 금액 계산을 앱과 1:1로 정합시킨 뒤 단위 테스트 759개로 커버리지를 42.0% → 69.3%까지 올렸습니다. 웹앱은 세트상품 구매 파이프라인(상품상세 → 카트 → 체크아웃 → PG 금액 정합), 비회원 구매, LINE 로그인, 독립몰 SSO를 구현했고 정적 페이지 65개·E2E 35개 페이지 커버를 확보했습니다. 실배포 후 무파라미터 카트 조회가 백엔드를 폭주시키던 문제를 페이지네이션 전환 + 중복 호출 제거로 잡았습니다.",
  },
  {
    title: "프론트엔드 기반 개선 — i18n · Vite · 부트스트랩 · 배포 파이프라인 (2023.08 – 2024)",
    summary:
      "운영 중인 어드민의 국제화·빌드·환경설정·배포 기반을 기능 개발과 병행해 교체했습니다. i18n은 vue-i18n 세팅부터 87개 파일의 하드코딩 문자열 치환까지 약 1주에 단독 수행했고, 라우트 name을 번역문으로 쓰던 구조가 언어 전환 시 페이지 이동을 깨뜨리는 문제를 찾아 교정한 뒤 5개 언어 체계로 확장했습니다. Webpack → Vite, Jest → Vitest 전환(196개 파일), 화면마다 반복 호출되던 환경설정 API를 boot 체인 + Pinia 캐싱으로 1회 로드 통합(45개 파일), GitLab CI를 템플릿 잡으로 추상화해 한 코드베이스를 2개 브랜드 서비스로 빌드·배포하는 파이프라인을 구성했습니다.",
  },
  {
    title: "클린 아키텍처 리팩토링 캠페인 주도 (2025.09 – 2026.08)",
    summary:
      "UI·상태·로직·API 호출이 한 파일에 뒤섞인 어드민 페이지를 Entity / API Repository / UseCase / Store 4계층으로 분리하는 캠페인을 콘텐츠 도메인에서 시작해 주문·포인트·리뷰·카테고리·MID 등으로 확산했습니다(리팩토링 MR 132건). 주문 도메인 9개 페이지는 엔티티 6종·API 17개·useCase 12종을 신설하며 백엔드 페이로드를 동일하게 보존하는 원칙으로 옮겼고, 최대 파일은 1,224 → 499줄(59%↓), 다른 도메인 페이지 컨테이너는 50~90% 줄었습니다. 회귀는 원인 커밋 단위로 역추적해 유닛 테스트 82개로 봉인했고, 컴포넌트 19개 전환 중 computed 내부 ref 부수효과로 금액 표시가 흔들릴 수 있던 잠복 결함 3건을 발굴했습니다. 규칙은 팀 리팩토링 가이드로 제정해 AI 협업 규칙(CLAUDE.md)과 연동하고, 어드민 전체 Vitest 1,345개·Cypress e2e를 도입했습니다.",
  },
  {
    title: "POS 웹 서비스 · 사내 디자인시스템(Quasar UI킷) (2022.11 – 2023.04)",
    summary:
      "AngularJS 1.x + Laravel Blade 레거시에서 회원가입 퍼널(약관 → 휴대폰 인증 → 업체정보 → 완료)과 매장별 매출통계 차트를 신규 구축했습니다. 차트는 매장 수가 많아도 읽히도록 Y축 canvas와 그래프 canvas를 분리해 축은 고정하고 그래프만 가로 스크롤되는 구조를 설계했습니다. 같은 시기 사내 Quasar 기반 UI킷(MR 18건)의 컴포넌트를 제작하면서 어드민에서 소비하는 양쪽을 담당했고, 이 경험이 이후 @usetaehwan/ui의 '소비처에서 먼저 검증하고 추출한다'는 순서로 이어졌습니다.",
  },
];

/* 사내 발표 — 최신순. 자료 상세는 싣지 않고 주제·대상·시기만. */
const TALKS = [
  {
    title: "Claude Code 기반 E2E 테스트 자동화",
    venue: "사내 AI 활용 공유 세션 (7회차)",
    date: "2026.05",
    summary:
      "정답을 참조 앱의 파일:라인으로 먼저 고정하는 증거 기반 시나리오 작성법. 77개 페이지 시나리오 약 700건, Cypress 케이스 515건, QA 체크리스트 83항목 기준선을 만든 과정을 공유했습니다.",
  },
  {
    title: "브라우저 렌더링 원리와 SSR·CSR / SPA·MPA",
    venue: "전사 개발자 컨퍼런스 · 프론트엔드팀 연사",
    date: "2024",
    summary:
      "다른 직군 개발자가 신규 SPA 프론트 구조를 이해할 수 있도록, 렌더링 과정부터 SSR·CSR과 SPA·MPA의 차이까지 설명했습니다.",
  },
];

/* 학력 — 최신순(대학 먼저). Experience처럼 좌측 타임라인으로. */
const EDUCATION = [
  {
    school: "배화여자대학교",
    period: "2024.02 – 2026.02",
    program: "고숙련 일학습병행 P-TECH · 모바일소프트웨어과",
    credential: "전문학사 취득",
  },
  {
    school: "광주소프트웨어마이스터고등학교",
    period: "2020.03 – 2023.01",
    program: "졸업",
    credential: null,
  },
];

/* 자격증 — 최신순. code는 종목 코드(개인 자격번호 아님). */
const CERTIFICATIONS = [
  { name: "일학습병행자격 SW개발 L5", code: "SW개발_L5_20V1", date: "2025.12" },
  { name: "프로그래밍기능사", code: null, date: "2021.10" },
];

/* 디자인 시스템 섹션의 정적 토큰 스와치 (라이트/다크 자동 전환) */
const SWATCHES = [
  { token: "bg", className: "bg-bg border border-border" },
  { token: "surface", className: "bg-surface border border-border" },
  { token: "border", className: "bg-border" },
  { token: "brand", className: "bg-brand" },
  { token: "brand-subtle", className: "bg-brand-subtle" },
  { token: "success", className: "bg-success" },
  { token: "warning", className: "bg-warning" },
  { token: "danger", className: "bg-danger" },
];

const REPO_URL = "https://github.com/JeongTaehwan/usetaehwan";
const PACKAGE_URL = "https://www.npmjs.com/package/@usetaehwan/ui";
const DS_DEMO_URL = "https://ui.usetaehwan.page";
const EMAIL = "kt26625417@gmail.com";
const MAIL_SUBJECT = "usetaehwan.page 문의";
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(
  MAIL_SUBJECT
)}`;

export default function Home() {
  return (
    <main className="min-h-dvh">
      <Nav />
      <Hero />

      {/* ── § 01 About ── */}
      <Section id="about" label="about" index="01">
        <Heading level={2}>잘 만든 코드는 잘 쓴 문서와 닮았습니다.</Heading>
        <Text variant="body" className="mt-5">
          4년차 프론트엔드 개발자입니다. 명확한 구조, 신중한 기본값, 다음 사람을 위한
          설명 — 좋은 인터페이스와 좋은 문서는 같은 원리로 만들어진다고 생각합니다.
          다국가 이커머스 어드민을 만들며 디자인 시스템과 아키텍처를 설계했고, 그 과정을
          늘 기록으로 남깁니다.
        </Text>
        <Text variant="body" className="mt-4">
          혼자 잘하는 것보다 함께 잘하는 걸 중요하게 생각합니다. 팀의 경계에서 오가는
          소통이 결국 결과물의 품질을 만든다고 믿습니다.
        </Text>
      </Section>

      {/* ── § 02 Experience ── */}
      <Section id="experience" label="experience" index="02">
        <Text variant="muted" className="mb-8">
          (주)셀메이트 · 2022.11 – 재직 중 (3년 10개월) · 일본 시장 커머스 플랫폼 — 2개 브랜드 서비스 · 4개
          마켓(JP·KR·US·TW) · 5개 언어를 한 코드베이스로 운영
        </Text>
        <ol className="flex flex-col gap-10 border-l border-border pl-6">
          {EXPERIENCE.map((e, i) => (
            <li key={i} className="relative">
              <span
                className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-brand"
                aria-hidden
              />
              <Heading level={4} as="h3">
                {e.title}
              </Heading>
              <Text variant="body" className="mt-3">
                {e.summary}
              </Text>
            </li>
          ))}
        </ol>

        {/* 발표 — 경력과 같은 타임라인 언어로, 제목 옆에 시기 */}
        <Heading level={3} as="h2" className="mt-14">
          Talks
        </Heading>
        <ol className="mt-6 flex flex-col gap-8 border-l border-border pl-6">
          {TALKS.map((t) => (
            <li key={t.title} className="relative">
              <span
                className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-brand"
                aria-hidden
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Heading level={4} as="h3">
                  {t.title}
                </Heading>
                {t.date && (
                  <Text as="span" variant="small" className="font-mono">
                    {t.date}
                  </Text>
                )}
              </div>
              <Text variant="muted" className="mt-1">
                {t.venue}
              </Text>
              <Text variant="body" className="mt-2">
                {t.summary}
              </Text>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── § 03 Background (학력 · 자격증) ── */}
      <Section id="background" label="background" index="03">
        {/* 학력 — 경력과 같은 타임라인 언어로 (연대순 콘텐츠라 결이 맞는다) */}
        <Heading level={3} as="h2">
          Education
        </Heading>
        <ol className="mt-6 flex flex-col gap-8 border-l border-border pl-6">
          {EDUCATION.map((e) => (
            <li key={e.school} className="relative">
              <span
                className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-brand"
                aria-hidden
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Heading level={4} as="h3">
                  {e.school}
                </Heading>
                <Text as="span" variant="small" className="font-mono">
                  {e.period}
                </Text>
              </div>
              <Text variant="body" className="mt-2">
                {e.program}
              </Text>
              {e.credential && (
                <Text variant="muted" className="mt-1">
                  {e.credential}
                </Text>
              )}
            </li>
          ))}
        </ol>

        {/* 자격증 — 항목이 짧아 절제된 분리 리스트로 (이름 좌 / 취득 시기 우) */}
        <Heading level={3} as="h2" className="mt-14">
          Certifications
        </Heading>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {CERTIFICATIONS.map((c) => (
            <li
              key={c.name}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Heading level={4} as="h3">
                  {c.name}
                </Heading>
                {c.code && (
                  <Text as="span" variant="muted" className="font-mono">
                    {c.code}
                  </Text>
                )}
              </div>
              <Text as="span" variant="small" className="font-mono">
                {c.date}
              </Text>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── § 04 Projects ── */}
      <Section id="projects" label="projects" index="04">
        <Heading level={2} className="mb-8">
          Projects
        </Heading>
        <div className="divide-y divide-border border-y border-border">
          {PROJECTS.filter((p) => !p.placeholder).map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group block transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
            >
              <div className="grid gap-2 px-2 py-6 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8">
                <div className="flex items-baseline gap-3">
                  <Heading
                    level={4}
                    as="h3"
                    className="transition-colors group-hover:text-brand"
                  >
                    {p.name}
                  </Heading>
                  <Text as="span" variant="small" className="font-mono">
                    {p.year}
                  </Text>
                </div>
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Text variant="body">{p.summary}</Text>
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 font-mono text-brand transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 준비 중인 프로젝트는 여러 placeholder 대신 절제된 안내 한 줄로 */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge variant="neutral">곧 공개</Badge>
          <Text as="span" variant="muted">
            다음 프로젝트를 준비하고 있습니다.
          </Text>
        </div>
      </Section>

      {/* ── § 05 Design System (기술적 하이라이트) ── */}
      <Section id="system" label="designSystem" index="05">
        <Heading level={2}>이 사이트를 만든 디자인 시스템</Heading>
        <Text variant="body" className="mt-5">
          <span className="font-mono text-fg">useTaehwan()/ui</span> — 토큰 기반 React
          디자인 시스템입니다. 지금 보고 있는 이 사이트도 이 시스템의 10개 컴포넌트로
          만들었고, 토큰만 덮어쓰면 프로젝트마다 전혀 다른 테마를 입힐 수 있습니다. 색
          하나를 바꾸면 사이트 전체가 따라 바뀝니다. 아래에서 직접 만져보세요.
        </Text>

        {/* 토큰 스와치 */}
        <div className="mt-8 flex flex-wrap gap-4">
          {SWATCHES.map((s) => (
            <div key={s.token} className="flex flex-col items-center gap-1.5">
              <span className={`h-10 w-10 rounded-md ${s.className}`} aria-hidden />
              <Text as="span" variant="small" className="font-mono">
                {s.token}
              </Text>
            </div>
          ))}
        </div>

        {/* 인터랙티브 데모 */}
        <div className="mt-8">
          <TokenPlayground />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Text as="span" variant="small" className="font-mono">
            10 components · token-only · theme per project
          </Text>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={DS_DEMO_URL}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-brand transition-colors hover:text-brand-hover"
            >
              live demo →
            </a>
            <a
              href={PACKAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-brand transition-colors hover:text-brand-hover"
            >
              npm →
            </a>
          </div>
        </div>
      </Section>

      {/* ── § 06 Contact ── */}
      <Section id="contact" label="contact" index="06">
        <Heading level={2}>함께 만들 게 있다면</Heading>
        <Text variant="body" className="mt-5">
          제안, 협업, 혹은 그냥 인사도 좋아요. 편하게 메일 주시면 빠르게 회신드리겠습니다.
        </Text>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={GMAIL_COMPOSE} target="_blank" rel="noreferrer">
            <Button variant="primary">메일 보내기</Button>
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            <Button variant="ghost">GitHub ↗</Button>
          </a>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10">
        <Container size="lg">
          <Text as="span" variant="small" className="font-mono">
            © 2026 Taehwan Jeong · built with{" "}
            <span className="text-brand">useTaehwan()/ui</span>
          </Text>
        </Container>
      </footer>
    </main>
  );
}
