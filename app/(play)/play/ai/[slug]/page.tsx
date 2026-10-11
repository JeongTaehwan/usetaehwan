import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRACTICES, getPractice } from "../../../../_data/ai-practices";
import { Console } from "../../../../_console/Console";
import { BackRow, Dialog, DocHero, PBox, Rows, Sub, TypeChip } from "../../../../_console/ui";
import { tmNo } from "../../../../_console/scenes/Notes";

type Params = { slug: string };
export function generateStaticParams(): Params[] {
  return PRACTICES.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPractice(slug);
  return doc ? { title: doc.title, description: doc.summary } : { title: "AI" };
}

/** AI 노트 상세 — 기술머신 한 장 */
export default async function PracticeDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getPractice(slug);
  if (!doc) notFound();
  const i = PRACTICES.findIndex((p) => p.slug === slug);

  return (
    <Console label={`기술머신 · ${tmNo(i)}`} backHref="/play#notes" top={<div className="detail-top">        <DocHero sprite="disk" no={`${tmNo(i)} · 기술머신 ${i + 1} / ${PRACTICES.length}`} title={doc.title} bg="var(--color-purple)" fg="var(--color-lcd)" accent="var(--color-gold)">
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.tags.map((t) => (
              <TypeChip key={t}>{t}</TypeChip>
            ))}
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-[26px] font-bold text-gold">{doc.stat.value}</span>
            <span className="text-[12px] leading-[1.5] opacity-85 [word-break:keep-all]">{doc.stat.label}</span>
          </div>
        </DocHero></div>}>
      <article className="document">
        <Dialog className="mb-1 text-[15px] leading-[1.75] @min-[440px]/screen:text-[16px]">
          <p className="[word-break:keep-all]">{doc.summary}</p>
        </Dialog>


        <p className="body-kr mt-5">{doc.intro}</p>

        <Sub no="01">사례</Sub>
        <ol className="flex flex-col gap-3">
          {doc.items.map((it, n) => (
            <li key={it.title}>
              <PBox className="p-4 @min-[440px]/screen:p-5">
                <div className="text-[12px] font-bold text-purple">
                  {tmNo(i)}-{n + 1}
                </div>
                <h4 className="mt-1 text-[16px] font-bold leading-[1.5] [word-break:keep-all] @min-[440px]/screen:text-[17px]">{it.title}</h4>
                <Rows
                  className="mt-3"
                  rows={[
                    { k: "문제", v: it.problem },
                    { k: "설계", v: it.design },
                    { k: "결과", v: it.result },
                  ]}
                />
              </PBox>
            </li>
          ))}
        </ol>

        <Sub no="02">남은 규칙</Sub>
        <PBox className="p-4 @min-[440px]/screen:p-5">
          <ol className="flex flex-col gap-3">
            {doc.rules.map((r, n) => (
              <li key={r} className="flex gap-3">
                <span className="shrink-0 text-[13px] font-bold text-purple">{String(n + 1).padStart(2, "0")}</span>
                <span className="body-kr !text-ink">{r}</span>
              </li>
            ))}
          </ol>
        </PBox>

        {doc.links && doc.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {doc.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" data-nav className="pbtn pbtn-sm">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        <BackRow href="/play#notes" label="기술머신으로" />
      </article>
    </Console>
  );
}
