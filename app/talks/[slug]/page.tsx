import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TALKS, getTalk } from "../../_data/talks";
import { LoftHeader, LoftPaper, PaperHead, PaperMeta } from "../../_loft/LoftPage";

type Params = { slug: string };
export function generateStaticParams(): Params[] { return TALKS.map((t) => ({ slug: t.slug })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params; const talk = getTalk(slug);
  return talk ? { title: talk.title, description: talk.summary } : { title: "Talk" };
}

export default async function TalkDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const talk = getTalk(slug);
  if (!talk) notFound();
  const no = TALKS.findIndex((t) => t.slug === slug) + 1;
  return (
    <main className="relative">
      <LoftHeader backHref="/#talks" backLabel="Meeting room" />
      <LoftPaper crumb={`Meeting room · Talk ${String(no).padStart(2, "0")}`} title={talk.title} lead={talk.summary}>
        <PaperMeta items={[{ k: "Venue", v: talk.venue }, { k: "Date", v: talk.date }]} />
        <div className="mt-10"><PaperHead no="1.">배경</PaperHead><p className="mt-4 text-[14.5px] leading-[1.8] text-[#5c534a] [word-break:keep-all]">{talk.context}</p></div>
        <div className="mt-10"><PaperHead no="2.">구성</PaperHead>
          <ol className="mt-5 divide-y divide-[rgba(43,38,34,0.14)] border-y border-[rgba(43,38,34,0.14)]">
            {talk.outline.map((o, i) => <li key={o} className="flex gap-5 py-3.5"><span className="caslon w-8 shrink-0 text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</span><span className="text-[14.5px] leading-[1.75] text-[#5c534a] [word-break:keep-all]">{o}</span></li>)}
          </ol>
        </div>
        <div className="mt-10"><PaperHead no="3.">핵심 메시지</PaperHead>
          <ul className="mt-5 flex flex-col gap-4">{talk.takeaways.map((t) => <li key={t} className="border-l-2 border-accent pl-4 text-[14.5px] leading-[1.8] text-[#2b2622] [word-break:keep-all]">{t}</li>)}</ul>
        </div>
        {talk.numbers && talk.numbers.length > 0 && (
          <div className="mt-10"><PaperHead no="4.">발표에서 인용한 수치</PaperHead>
            <dl className="mt-5 divide-y divide-[rgba(43,38,34,0.14)] border-y border-[rgba(43,38,34,0.14)]">
              {talk.numbers.map((n) => <div key={n.label} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3"><dt className="text-[14px] text-[#5c534a]">{n.label}</dt><dd className="caslon text-[15px] text-[#2b2622]">{n.value}</dd></div>)}
            </dl>
          </div>
        )}
        {talk.href && <div className="mt-10"><a href={talk.href} target="_blank" rel="noreferrer" className="btn btn-outline !text-[#2b2622]">발표 자료 ↗</a></div>}
        <div className="mt-12 border-t border-dashed border-[rgba(43,38,34,0.2)] pt-6"><Link href="/#talks" className="caps text-[#8b7f72] hover:text-accent">← Meeting room</Link></div>
      </LoftPaper>
    </main>
  );
}
