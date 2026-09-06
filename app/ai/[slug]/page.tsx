import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRACTICES, getPractice } from "../../_data/ai-practices";
import { LoftHeader, LoftPaper, PaperHead, PaperRows } from "../../_loft/LoftPage";

type Params = { slug: string };
export function generateStaticParams(): Params[] { return PRACTICES.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params; const doc = getPractice(slug);
  return doc ? { title: doc.title, description: doc.summary } : { title: "AI" };
}

export default async function PracticeDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getPractice(slug);
  if (!doc) notFound();
  const no = PRACTICES.findIndex((p) => p.slug === slug) + 1;
  return (
    <main className="relative">
      <LoftHeader backHref="/#ai" backLabel="Notebook" />
      <LoftPaper crumb={`Notebook · Note ${no} of ${PRACTICES.length}`} title={doc.title} lead={doc.summary}>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          {doc.tags.map((t) => <span key={t} className="caps text-[#8b7f72]">#{t}</span>)}
          <div className="ml-auto flex items-baseline gap-3"><span className="caps text-accent">Measured</span><span className="caslon text-[24px] text-[#2b2622]">{doc.stat.value}</span></div>
        </div>
        <p className="mt-8 border-t border-[rgba(43,38,34,0.14)] pt-7 text-[14.5px] leading-[1.8] text-[#5c534a] [word-break:keep-all]">{doc.intro}</p>
        <div className="mt-10"><PaperHead no="1.">사례</PaperHead>
          <ol className="mt-5 flex flex-col gap-7">
            {doc.items.map((it, i) => (
              <li key={it.title} className="border-t border-[rgba(43,38,34,0.14)] pt-5">
                <div className="flex items-baseline gap-3"><span className="caslon text-[13px] text-accent">{no}-{i + 1}</span><h4 className="myeongjo text-[16px] text-[#2b2622]">{it.title}</h4></div>
                <div className="mt-3"><PaperRows rows={[{ k: "문제", v: it.problem }, { k: "설계", v: it.design }, { k: "결과", v: it.result }]} /></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-10"><PaperHead no="2.">남은 규칙</PaperHead>
          <ol className="mt-5 divide-y divide-[rgba(43,38,34,0.14)] border-y border-[rgba(43,38,34,0.14)]">
            {doc.rules.map((r, i) => <li key={r} className="flex gap-5 py-3.5"><span className="caslon w-8 shrink-0 text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</span><span className="text-[14.5px] leading-[1.75] text-[#2b2622] [word-break:keep-all]">{r}</span></li>)}
          </ol>
        </div>
        {doc.links && doc.links.length > 0 && <div className="mt-10 flex flex-wrap gap-2.5">{doc.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn-outline !text-[#2b2622]">{l.label} ↗</a>)}</div>}
        <div className="mt-12 border-t border-dashed border-[rgba(43,38,34,0.2)] pt-6"><Link href="/#ai" className="caps text-[#8b7f72] hover:text-accent">← Notebook · 모든 노트</Link></div>
      </LoftPaper>
    </main>
  );
}
