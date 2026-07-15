import Link from "next/link";
import { Badge, Button, Container, Heading, Text } from "@/design-system";
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
          <div className="grid gap-8 md:grid-cols-[7rem_1fr] md:gap-12">
            <div className="md:pt-2">
              <Text as="div" variant="muted" className="font-mono text-brand">
                .{label}
              </Text>
              <Text as="div" variant="small" className="mt-1 font-mono">
                § {index}
              </Text>
            </div>
            <div>{children}</div>
          </div>
        </Container>
      </section>
    </Reveal>
  );
}

/* ── 콘텐츠 데이터 ── */

const EXPERIENCE = [
  {
    role: "StoreX Admin — 멀티테넌트 쇼핑몰 어드민",
    org: "Sellmate · Global Team",
    period: "재직 중",
    desc: "기존 프로젝트를 인계받아 상품·브랜드·쿠폰·포인트·주문·리뷰 등 20개 이상의 관리 페이지를 단독으로 유지보수·신규 개발했습니다. 후임 합류 이후에는 온보딩과 코드 리뷰를 맡아 협업 체계로 전환했고, 테넌트별 마켓·다국어 구조를 대응해 2개 고객사 · 5개 마켓(일본·미국·한국·대만) · 72개 브랜드가 운영되는 플랫폼을 담당하고 있습니다.",
    tags: ["React", "TypeScript", "디자인 시스템", "i18n"],
  },
  { role: "대규모 화면 리팩토링", org: "Sellmate", period: "준비 중", placeholder: true },
  { role: "결제 중개 연동", org: "Sellmate", period: "준비 중", placeholder: true },
  { role: "React 웹앱 신규 구축", org: "Sellmate", period: "준비 중", placeholder: true },
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
          Sellmate — 2022.11 ~ ing
        </Text>
        <ol className="flex flex-col gap-10 border-l border-border pl-6">
          {EXPERIENCE.map((e, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full ${
                  e.placeholder ? "bg-border" : "bg-brand"
                }`}
                aria-hidden
              />
              <div className={e.placeholder ? "opacity-60" : undefined}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Heading level={4} as="h3">
                    {e.role}
                  </Heading>
                  <Text as="span" variant="small" className="font-mono">
                    {e.period}
                  </Text>
                </div>
                <Text as="div" variant="muted" className="mt-1 text-brand">
                  {e.org}
                </Text>
                {e.desc ? (
                  <Text variant="body" className="mt-3">
                    {e.desc}
                  </Text>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="neutral">준비 중</Badge>
                    <Text as="span" variant="small">
                      정리해서 곧 채워집니다.
                    </Text>
                  </div>
                )}
                {e.tags && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <Badge key={t} variant="neutral">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
          {PROJECTS.map((p) => {
            const row = (
              <div className="grid gap-2 px-2 py-6 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8">
                <div className="flex items-baseline gap-3">
                  <Heading
                    level={4}
                    as="h3"
                    className={p.placeholder ? undefined : "transition-colors group-hover:text-brand"}
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
                    {!p.placeholder && (
                      <span
                        aria-hidden
                        className="mt-0.5 shrink-0 font-mono text-brand transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <Badge key={t} variant={p.placeholder ? "neutral" : "brand"}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );

            return p.placeholder ? (
              <div key={p.slug} className="opacity-60">
                {row}
              </div>
            ) : (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="group block transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
              >
                {row}
              </Link>
            );
          })}
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
            href={REPO_URL}
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
