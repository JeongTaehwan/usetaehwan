import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TALKS, getTalk } from "../../../_data/talks";
import { ButtonLink, DefList, DocBar, DocHeader, DocHeading, DocShell, PrevNext, Prose, no2 } from "../../../_site/ui";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return TALKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const talk = getTalk(slug);
  return talk ? { title: talk.title, description: talk.summary } : { title: "Talk" };
}

/** 발표 상세 — 배경 · 구성 · 핵심 메시지 · 인용 수치 */
export default async function TalkDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const talk = getTalk(slug);
  if (!talk) notFound();
  const i = TALKS.findIndex((t) => t.slug === slug);
  const prev = TALKS[i - 1];
  const next = TALKS[i + 1];

  return (
    <DocShell bar={<DocBar back="/#talks" backLabel="발표" play={`/play/talks/${slug}`} />}>
      <DocHeader kicker={`발표 · ${talk.date}`} title={talk.title} lead={talk.summary} />

      <div className="mt-10 rounded-xl border border-line bg-card p-5 sm:p-6">
        <DefList
          rows={[
            { k: "무대", v: talk.venue },
            { k: "날짜", v: talk.date },
          ]}
        />
        {talk.href && (
          <div className="mt-6">
            <ButtonLink href={talk.href}>발표 자료</ButtonLink>
          </div>
        )}
      </div>

      <DocHeading>배경</DocHeading>
      <Prose>{talk.context}</Prose>

      <DocHeading>구성</DocHeading>
      <ol className="flex flex-col gap-3">
        {talk.outline.map((o, n) => (
          <li key={o} className="flex gap-4">
            <span className="shrink-0 pt-[3px] font-mono text-[13px] text-mute">{no2(n)}</span>
            <span className="text-[16px] leading-[1.8] text-ink-2">{o}</span>
          </li>
        ))}
      </ol>

      <DocHeading>핵심 메시지</DocHeading>
      <ul className="flex flex-col gap-4">
        {talk.takeaways.map((t) => (
          <li key={t} className="border-l-2 border-accent pl-4 text-[16px] leading-[1.8] text-ink">
            {t}
          </li>
        ))}
      </ul>

      {talk.numbers && talk.numbers.length > 0 && (
        <>
          <DocHeading>발표에서 인용한 수치</DocHeading>
          <dl className="divide-y divide-line rounded-xl border border-line bg-card px-5">
            {talk.numbers.map((n) => (
              <div key={n.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
                <dt className="text-[14.5px] text-ink-2">{n.label}</dt>
                <dd className="font-mono text-[15px] font-medium">{n.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <PrevNext prev={prev && { href: `/talks/${prev.slug}`, title: prev.title }} next={next && { href: `/talks/${next.slug}`, title: next.title }} />
    </DocShell>
  );
}
