import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "../../_ui/Reveal";
import { SubHead } from "../../_ui/Sheet";
import { Btn } from "../../_ui/Btn";
import { DetailSheet, MetaTable, SubpageHeader } from "../../_components/SubpageFrame";
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
  const ref = TALKS.findIndex((t) => t.slug === slug) + 1;

  return (
    <main className="page paper-grid min-h-dvh">
      <SubpageHeader backHref="/#experience" backLabel="Experience" sheetNo="02" />

      <Reveal>
        <DetailSheet crumb={`Ref. [${ref}] · ${talk.slug}`} sheet={`Sheet 02 · Ref. [${ref}]`} title={talk.title} lead={talk.summary}>
          <MetaTable
            items={[
              { k: "Venue", v: talk.venue },
              { k: "Date", v: talk.date },
            ]}
          />

          <div className="mt-12">
            <SubHead no="1.">배경</SubHead>
            <p className="prose-draft mt-4">{talk.context}</p>
          </div>

          <div className="mt-12">
            <SubHead no="2.">구성</SubHead>
            <ol className="mt-6 divide-y divide-line-soft border-y border-line">
              {talk.outline.map((o, i) => (
                <li key={o} className="flex gap-5 py-4">
                  <span className="figure-no w-8 shrink-0 text-sm text-mark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="prose-draft">{o}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12">
            <SubHead no="3.">핵심 메시지</SubHead>
            <ul className="mt-6 flex flex-col gap-4">
              {talk.takeaways.map((t) => (
                <li key={t} className="border-l-2 border-mark pl-4">
                  <p className="prose-draft text-ink">{t}</p>
                </li>
              ))}
            </ul>
          </div>

          {talk.numbers && talk.numbers.length > 0 && (
            <div className="mt-12">
              <SubHead no="4.">발표에서 인용한 수치</SubHead>
              <dl className="mt-6 divide-y divide-line-soft border-y border-line">
                {talk.numbers.map((n) => (
                  <div
                    key={n.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                  >
                    <dt className="text-sm text-ink-2">{n.label}</dt>
                    <dd className="figure-no text-sm">{n.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {talk.href && (
            <div className="mt-12">
              <Btn href={talk.href}>발표 자료 ↗</Btn>
            </div>
          )}

          <div className="cut mt-14 pt-6">
            <Btn href="/#experience" variant="text">
              ← Sheet 02 · Experience
            </Btn>
          </div>
        </DetailSheet>
      </Reveal>
    </main>
  );
}
