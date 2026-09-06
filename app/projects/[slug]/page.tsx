import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, Container, Heading, Text } from "@usetaehwan/ui";
import { Reveal } from "../../_components/Reveal";
import { ThemeToggle } from "../../ThemeToggle";
import { PROJECTS, getProject } from "../../_data/projects";

type Params = { slug: string };

// 상세가 준비된(=detail 있는) 프로젝트만 정적 생성. placeholder는 제외.
export function generateStaticParams(): Params[] {
  return PROJECTS.filter((p) => p.detail).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.detail) return { title: "Project" };
  return {
    title: project.name,
    description: project.detail.tagline,
  };
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  // 미준비/없는 slug는 404
  if (!project || !project.detail) notFound();
  const { detail } = project;

  return (
    <main className="min-h-dvh">
      {/* 상세용 경량 헤더 */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <Container size="lg">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="text-lg text-fg">
              <span className="font-serif">useTaehwan</span>
              <span className="font-mono text-brand">()</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/#projects">
                <Button variant="ghost" size="sm">
                  ← Projects
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </header>

      <Reveal as="section">
        <article className="py-16 sm:py-24">
          <Container size="md">
            {/* 헤드 */}
            <Text as="div" variant="muted" className="font-mono text-brand">
              .projects / {project.slug}
            </Text>
            <Heading level={1} className="mt-3 text-4xl sm:text-5xl">
              {project.name}
            </Heading>
            <Text variant="lead" className="mt-4">
              {detail.tagline}
            </Text>

            {/* 메타 */}
            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6 sm:grid-cols-3">
              {[
                { k: "Role", v: detail.role },
                { k: "Period", v: detail.period },
                { k: "Year", v: project.year },
              ].map((m) => (
                <div key={m.k}>
                  <Text as="dt" variant="small" className="font-mono">
                    {m.k}
                  </Text>
                  <Text as="dd" variant="body" className="mt-1 text-fg">
                    {m.v}
                  </Text>
                </div>
              ))}
            </dl>

            {/* 개요 */}
            <div className="mt-10">
              <Heading level={3} className="mb-3">
                Overview
              </Heading>
              <Text variant="body">{detail.overview}</Text>
            </div>

            {/* 작업 사례 — 문제 → 파악 → 해결. 홈 카드와 같은 구조 */}
            {project.cases && project.cases.length > 0 && (
              <div className="mt-10">
                <Heading level={3} className="mb-4">
                  작업 사례
                </Heading>
                <ol className="flex flex-col gap-8">
                  {project.cases.map((c, i) => (
                    <li key={c.title} className="border-l-2 border-border pl-5">
                      <div className="flex items-baseline gap-3">
                        <Text as="span" variant="small" className="font-mono text-brand">
                          {String(i + 1).padStart(2, "0")}
                        </Text>
                        <Heading level={4} as="h4">
                          {c.title}
                        </Heading>
                      </div>
                      <dl className="mt-3 grid gap-y-2 sm:grid-cols-[3rem_1fr] sm:gap-x-4">
                        {[
                          { k: "문제", v: c.problem },
                          { k: "파악", v: c.diagnosis },
                          { k: "해결", v: c.solution },
                        ].map((row) => (
                          <div key={row.k} className="contents">
                            <Text as="dt" variant="small" className="font-mono text-brand sm:pt-0.5">
                              {row.k}
                            </Text>
                            <Text as="dd" variant="body">
                              {row.v}
                            </Text>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 핵심 기능 — 사례에 안 들어간 구성 요소를 짧게 */}
            <div className="mt-10">
              <Heading level={3} className="mb-4">
                핵심 기능
              </Heading>
              <div className="grid gap-4 sm:grid-cols-2">
                {detail.highlights.map((h) => (
                  <Card key={h.title} className="flex flex-col gap-2">
                    <Heading level={4} as="h4">
                      {h.title}
                    </Heading>
                    <Text variant="body">{h.body}</Text>
                  </Card>
                ))}
              </div>
            </div>

            {/* 스택 */}
            <div className="mt-10">
              <Heading level={3} className="mb-4">
                Stack
              </Heading>
              <div className="flex flex-wrap gap-2">
                {detail.stack.map((s) => (
                  <Badge key={s} variant="brand">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 링크 */}
            {detail.links && detail.links.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-3">
                {detail.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm">
                      {l.label} ↗
                    </Button>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-14 border-t border-border pt-8">
              <Link href="/#projects">
                <Button variant="ghost" size="sm">
                  ← 모든 프로젝트
                </Button>
              </Link>
            </div>
          </Container>
        </article>
      </Reveal>
    </main>
  );
}
