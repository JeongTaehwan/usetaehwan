import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRACTICES, getPractice } from "../../../_data/ai-practices";
import { ButtonLink, DefList, DocBar, DocHeader, DocHeading, DocShell, Pills, PrevNext, Prose, no2 } from "../../../_site/ui";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRACTICES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPractice(slug);
  return doc ? { title: doc.title, description: doc.summary } : { title: "AI" };
}

/** AI 노트 상세 — 사례(문제 · 설계 · 결과)와 남은 규칙 */
export default async function PracticeDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getPractice(slug);
  if (!doc) notFound();
  const i = PRACTICES.findIndex((p) => p.slug === slug);
  const prev = PRACTICES[i - 1];
  const next = PRACTICES[i + 1];

  return (
    <DocShell bar={<DocBar back="/#ai" backLabel="AI 노트" play={`/play/ai/${slug}`} />}>
      <DocHeader kicker={`AI 노트 ${no2(i)} / ${no2(PRACTICES.length - 1)}`} title={doc.title} lead={doc.summary}>
        <Pills items={doc.tags} className="mt-6" />
      </DocHeader>

      <figure className="mt-10 flex flex-col gap-1 rounded-xl border border-line bg-card p-5 sm:flex-row sm:items-baseline sm:gap-5 sm:p-6">
        <span className="font-mono text-[30px] leading-tight font-medium text-accent">{doc.stat.value}</span>
        <figcaption className="text-[14.5px] leading-[1.6] text-ink-2">{doc.stat.label}</figcaption>
      </figure>

      <Prose className="mt-10">{doc.intro}</Prose>

      <DocHeading>사례</DocHeading>
      <ol className="flex flex-col gap-4">
        {doc.items.map((it, n) => (
          <li key={it.title} className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <p className="font-mono text-[12.5px] text-mute">
              {no2(i)}-{n + 1}
            </p>
            <h3 className="mt-1 text-[17px] leading-[1.5] font-bold">{it.title}</h3>
            <DefList
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

      <DocHeading>남은 규칙</DocHeading>
      <ol className="flex flex-col gap-4">
        {doc.rules.map((r, n) => (
          <li key={r} className="flex gap-4">
            <span className="shrink-0 pt-[3px] font-mono text-[13px] text-accent">{no2(n)}</span>
            <span className="text-[16px] leading-[1.8] text-ink">{r}</span>
          </li>
        ))}
      </ol>

      {doc.links && doc.links.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2.5">
          {doc.links.map((l) => (
            <ButtonLink key={l.href} href={l.href}>
              {l.label}
            </ButtonLink>
          ))}
        </div>
      )}

      <PrevNext prev={prev && { href: `/ai/${prev.slug}`, title: prev.title }} next={next && { href: `/ai/${next.slug}`, title: next.title }} />
    </DocShell>
  );
}
