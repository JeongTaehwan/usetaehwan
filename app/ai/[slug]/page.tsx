import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "../../_ui/Reveal";
import { SubHead, Rows } from "../../_ui/Sheet";
import { Label } from "../../_ui/Label";
import { Btn } from "../../_ui/Btn";
import { DetailSheet, SubpageHeader } from "../../_components/SubpageFrame";
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
  if (!doc) return { title: "AI" };
  return { title: doc.title, description: doc.summary };
}

export default async function PracticeDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getPractice(slug);
  if (!doc) notFound();
  const no = PRACTICES.findIndex((p) => p.slug === slug) + 1;

  return (
    <main className="page paper-grid min-h-dvh">
      <SubpageHeader backHref="/#ai" backLabel="AI Notes" sheetNo="05" />

      <Reveal>
        <DetailSheet crumb={`Note ${no} · ${doc.slug}`} sheet={`Sheet 05 · Note ${no}`} title={doc.title} lead={doc.summary}>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {doc.tags.map((t) => (
              <Label key={t}>#{t}</Label>
            ))}
            <div className="ml-auto flex items-baseline gap-3">
              <Label mark>Measured</Label>
              <span className="figure-no text-2xl">{doc.stat.value}</span>
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <p className="prose-draft">{doc.intro}</p>
          </div>

          <div className="mt-12">
            <SubHead no="1.">사례</SubHead>
            <ol className="mt-6 flex flex-col gap-8">
              {doc.items.map((it, i) => (
                <li key={it.title} className="border-t border-line pt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="figure-no text-sm text-mark">
                      {no}-{i + 1}
                    </span>
                    <h4 className="text-base font-semibold text-ink">{it.title}</h4>
                  </div>
                  <Rows
                    className="mt-4"
                    rows={[
                      { k: "문제", v: it.problem },
                      { k: "설계", v: it.design },
                      { k: "결과", v: it.result },
                    ]}
                  />
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12">
            <SubHead no="2.">남은 규칙</SubHead>
            <ol className="mt-6 divide-y divide-line-soft border-y border-line">
              {doc.rules.map((r, i) => (
                <li key={r} className="flex gap-5 py-4">
                  <span className="figure-no w-8 shrink-0 text-sm text-mark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="prose-draft text-ink">{r}</span>
                </li>
              ))}
            </ol>
          </div>

          {doc.links && doc.links.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-3">
              {doc.links.map((l) => (
                <Btn key={l.href} href={l.href}>
                  {l.label} ↗
                </Btn>
              ))}
            </div>
          )}

          <div className="cut mt-14 pt-6">
            <Btn href="/#ai" variant="text">
              ← Sheet 05 · 모든 AI 노트
            </Btn>
          </div>
        </DetailSheet>
      </Reveal>
    </main>
  );
}
