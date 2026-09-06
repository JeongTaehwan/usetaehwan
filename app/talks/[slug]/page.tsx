import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Container, Heading, Text } from "@usetaehwan/ui";
import { Reveal } from "../../_components/Reveal";
import { SubpageHeader } from "../../_components/SubpageHeader";
import { TALKS, getTalk } from "../../_data/talks";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return TALKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const talk = getTalk(slug);
  if (!talk) return { title: "Talk" };
  return { title: talk.title, description: talk.summary };
}

export default async function TalkDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const talk = getTalk(slug);
  if (!talk) notFound();

  return (
    <main className="min-h-dvh">
      <SubpageHeader backHref="/#experience" backLabel="Experience" />

      <Reveal as="section">
        <article className="py-16 sm:py-24">
          <Container size="md">
            <Text as="div" variant="muted" className="font-mono text-brand">
              .talks / {talk.slug}
            </Text>
            <Heading level={1} className="mt-3 text-4xl sm:text-5xl">
              {talk.title}
            </Heading>
            <Text variant="lead" className="mt-4">
              {talk.summary}
            </Text>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6">
              {[
                { k: "Venue", v: talk.venue },
                { k: "Date", v: talk.date },
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

            <div className="mt-10">
              <Heading level={3} className="mb-3">
                배경
              </Heading>
              <Text variant="body">{talk.context}</Text>
            </div>

            <div className="mt-10">
              <Heading level={3} className="mb-4">
                구성
              </Heading>
              <ol className="flex flex-col gap-3">
                {talk.outline.map((o, i) => (
                  <li key={o} className="flex gap-4">
                    <Text as="span" variant="small" className="w-6 shrink-0 font-mono text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <Text as="span" variant="body">
                      {o}
                    </Text>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-10">
              <Heading level={3} className="mb-4">
                핵심 메시지
              </Heading>
              <ul className="flex flex-col gap-3">
                {talk.takeaways.map((t) => (
                  <li key={t} className="border-l-2 border-brand pl-4">
                    <Text variant="body">{t}</Text>
                  </li>
                ))}
              </ul>
            </div>

            {talk.numbers && talk.numbers.length > 0 && (
              <div className="mt-10">
                <Heading level={3} className="mb-4">
                  발표에서 인용한 수치
                </Heading>
                <dl className="divide-y divide-border border-y border-border">
                  {talk.numbers.map((n) => (
                    <div
                      key={n.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                    >
                      <Text as="dt" variant="body">
                        {n.label}
                      </Text>
                      <Text as="dd" variant="body" className="font-mono text-fg">
                        {n.value}
                      </Text>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {talk.href && (
              <div className="mt-10">
                <a href={talk.href} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    발표 자료 ↗
                  </Button>
                </a>
              </div>
            )}

            <div className="mt-14 border-t border-border pt-8">
              <Link href="/#experience">
                <Button variant="ghost" size="sm">
                  ← Experience로
                </Button>
              </Link>
            </div>
          </Container>
        </article>
      </Reveal>
    </main>
  );
}
