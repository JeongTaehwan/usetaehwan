import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Container, Heading, Text } from "@usetaehwan/ui";
import { Reveal } from "../../_components/Reveal";
import { SubpageHeader } from "../../_components/SubpageHeader";
import { PRACTICES, getPractice } from "../../_data/ai-practices";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRACTICES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPractice(slug);
  if (!doc) return { title: "AI — useTaehwan()" };
  return { title: `${doc.title} — useTaehwan()`, description: doc.summary };
}

export default async function PracticeDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getPractice(slug);
  if (!doc) notFound();

  return (
    <main className="min-h-dvh">
      <SubpageHeader backHref="/#ai" backLabel="AI" />

      <Reveal as="section">
        <article className="py-16 sm:py-24">
          <Container size="md">
            <Text as="div" variant="muted" className="font-mono text-brand">
              .ai / {doc.slug}
            </Text>
            <Heading level={1} className="mt-3 text-4xl sm:text-5xl">
              {doc.title}
            </Heading>
            <Text variant="lead" className="mt-4">
              {doc.summary}
            </Text>
            <div className="mt-6 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <Badge key={t} variant="brand">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-10 border-t border-border pt-8">
              <Text variant="body">{doc.intro}</Text>
            </div>

            {/* 사례 — 문제 → 설계 → 결과 */}
            <div className="mt-10">
              <Heading level={3} className="mb-4">
                사례
              </Heading>
              <ol className="flex flex-col gap-8">
                {doc.items.map((it, i) => (
                  <li key={it.title} className="border-l-2 border-border pl-5">
                    <div className="flex items-baseline gap-3">
                      <Text as="span" variant="small" className="font-mono text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </Text>
                      <Heading level={4} as="h4">
                        {it.title}
                      </Heading>
                    </div>
                    <dl className="mt-3 grid gap-y-2 sm:grid-cols-[3rem_1fr] sm:gap-x-4">
                      {[
                        { k: "문제", v: it.problem },
                        { k: "설계", v: it.design },
                        { k: "결과", v: it.result },
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

            {/* 규칙 — 실패에서 역산한 결론 */}
            <div className="mt-10">
              <Heading level={3} className="mb-4">
                남은 규칙
              </Heading>
              <ol className="flex flex-col gap-3">
                {doc.rules.map((r, i) => (
                  <li key={r} className="flex gap-4">
                    <Text as="span" variant="small" className="w-6 shrink-0 font-mono text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <Text as="span" variant="body" className="text-fg">
                      {r}
                    </Text>
                  </li>
                ))}
              </ol>
            </div>

            {doc.links && doc.links.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-3">
                {doc.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      {l.label} ↗
                    </Button>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-14 border-t border-border pt-8">
              <Link href="/#ai">
                <Button variant="ghost" size="sm">
                  ← 모든 AI 활용 문서
                </Button>
              </Link>
            </div>
          </Container>
        </article>
      </Reveal>
    </main>
  );
}
