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
    title: "StoreX Admin — 멀티테넌트 쇼핑몰 어드민 프론트엔드",
    summary:
      "기존 프로젝트를 인계받아 상품·브랜드·쿠폰·포인트·주문·리뷰 등 20개 이상의 관리 페이지를 단독으로 유지보수·신규 개발했습니다. 이후 후임 합류에 맞춰 온보딩과 코드 리뷰를 맡아 협업 체계로 전환했고, 테넌트별 마켓·다국어 구조를 대응해 현재 2개 고객사 · 5개 마켓(일본·미국·한국·대만) · 72개 브랜드가 운영되는 플랫폼을 담당하고 있습니다.",
  },
  {
    title: "어드민 대시보드 리팩토링 — Clean Architecture + AI 워크플로우",
    summary:
      "Vue 3 커머스 관리자 대시보드(페이지 145개 · 컴포넌트 187개)의 God Component 문제를 Entity → UseCase → Store → Page 4계층으로 재구조화했습니다. UI·상태·로직·API가 뒤섞인 1,000줄 이상의 페이지를 계층으로 분리하고, API를 Repository 패턴으로 통일해 테넌트 경로를 캡슐화했으며, 반복되는 관심사를 20여 개 composable로 추출했습니다. 4계층 규칙과 코딩 컨벤션을 CLAUDE.md·커스텀 스킬로 코드화해 AI가 규칙을 벗어나지 못하게 통제하고, 리팩토링 → 테스트 → 리뷰를 한 사이클로 설계했습니다. God Component를 평균 65% 축소(OrderManagement.vue 1,375 → 325줄, 76%↓)하고 단위·E2E 테스트를 도입했습니다.",
  },
  {
    title: "결제 중개 페이지 — 5개 결제사 통합 UI (프론트엔드)",
    summary:
      "앱·웹앱과 여러 결제사(PG) 사이에서 결제 흐름을 통합하는 중개 페이지의 프론트엔드를 담당했습니다(Toss·Inicis·Eximbay·LINE Pay·PayPal, 10여 결제수단, 5개국 운영). 결제 결과 콜백을 실행 환경에 따라 웹앱 팝업(postMessage)·네이티브 앱(WebView 브리지)·일반 웹(리다이렉트) 3가지로 분기 처리하고, 결제 취소·이탈 시 사용자 친화적인 에러 화면을 구현해 결제 UX를 안정화했습니다. (백엔드 API 및 PG 인증 처리는 별도 담당)",
  },
  {
    title: "STO 웹앱 — Flutter → React 마이그레이션 (단독)",
    summary:
      "일본 패션 이커머스 앱(STO)의 웹 버전 전체를 Flutter에서 React로 마이그레이션했습니다. 모바일 앱만 있던 서비스에 PC 웹의 필요성과 웹 환경의 속도 이점을 고려해 전환을 주도했고, 상품 탐색부터 결제·주문관리·마이페이지까지 커머스 전 여정을 단독으로 기획·설계·구현했습니다. 화면(WebApp-front)과 비즈니스 로직(@storex/web-core)을 2계층으로 분리하는 아키텍처를 직접 설계하고, 로직 코어는 독립 npm 패키지(사내 레지스트리, 시맨틱 버저닝)로 배포했습니다. 페이지 약 70개 · 약 89,000 LOC, 커스텀 훅 120여 개, E2E 39 spec + 단위 테스트 168개 규모이며, 결제 금액 계산(세율·면세 판정)을 원 단위까지 정합하게 재현했습니다. 화면 마이그레이션은 Claude Code로 초안을 생성한 뒤 민감한 로직은 백엔드 코드와 대조·검증하는 워크플로우로 진행했고, 전 여정 구현 완료 후 신규 기능을 지속 확장하고 있습니다.",
  },
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
          (주)셀메이트 · 2022.11 – 재직 중
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
      </Section>

      {/* ── § 03 Projects ── */}
      <Section id="projects" label="projects" index="03">
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
            시스템을 소비하는 새 프로젝트를 준비하고 있습니다.
          </Text>
        </div>
      </Section>

      {/* ── § 04 Design System (기술적 하이라이트) ── */}
      <Section id="system" label="designSystem" index="04">
        <Heading level={2}>이 사이트를 만든 디자인 시스템</Heading>
        <Text variant="body" className="mt-5">
          <span className="font-mono text-fg">useTaehwan()/ui</span> — 저채도 웜 뉴트럴
          토큰과 6개의 React 프리미티브로 구성된 작은 디자인 시스템입니다. 색 하나를
          바꾸면 사이트 전체가 따라 바뀝니다. 아래에서 직접 만져보세요.
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
            6 primitives · token-only · light + dark
          </Text>
          <a
            href={PACKAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-sm text-brand transition-colors hover:text-brand-hover"
          >
            read the docs →
          </a>
        </div>
      </Section>

      {/* ── § 05 Contact ── */}
      <Section id="contact" label="contact" index="05">
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
