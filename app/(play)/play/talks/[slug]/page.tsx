import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TALKS, getTalk } from "../../../../_data/talks";
import { Console } from "../../../../_console/Console";
import { BackRow, Dialog, DocHero, PBox, Rows, Sub } from "../../../../_console/ui";
import { talkNo } from "../../../../_console/scenes/Caster";

type Params = { slug: string };
export function generateStaticParams(): Params[] {
  return TALKS.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const talk = getTalk(slug);
  return talk ? { title: talk.title, description: talk.summary } : { title: "Talk" };
}

/** 발표 상세 — 라이브캐스터 발표 기록 */
export default async function TalkDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const talk = getTalk(slug);
  if (!talk) notFound();
  const i = TALKS.findIndex((t) => t.slug === slug);
  // 발표 자료는 빌드 시점에 public/에 파일이 있을 때만 링크한다
  const slides = talk.slides && existsSync(path.join(process.cwd(), "public", talk.slides)) ? talk.slides : undefined;

  return (
    <Console label={`라이브캐스터 · ${talkNo(i)}`} backHref="/play#caster" top={<div className="detail-top">        <DocHero sprite="caster" no={talkNo(i)} title={talk.title} bg="var(--color-ink)" fg="var(--color-lcd)" accent="var(--color-gold)">
          <div className="mt-2 text-[12px] opacity-85">
            {talk.venue} · {talk.date}
          </div>
        </DocHero></div>}>
      <article className="document">
        <Dialog className="mb-1 text-[15px] leading-[1.75] @min-[440px]/screen:text-[16px]">
          <p className="[word-break:keep-all]">{talk.summary}</p>
        </Dialog>


        <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
          <Rows
            rows={[
              { k: "무대", v: talk.venue },
              { k: "날짜", v: talk.date },
            ]}
          />
        </PBox>

        <Sub no="01">배경</Sub>
        <p className="body-kr">{talk.context}</p>

        <Sub no="02">구성</Sub>
        <PBox className="p-4 @min-[440px]/screen:p-5">
          <ol className="flex flex-col gap-2.5">
            {talk.outline.map((o, n) => (
              <li key={o} className="flex gap-3">
                <span className="shrink-0 text-[13px] font-bold text-red">{String(n + 1).padStart(2, "0")}</span>
                <span className="body-kr">{o}</span>
              </li>
            ))}
          </ol>
        </PBox>

        <Sub no="03">핵심 메시지</Sub>
        <ul className="flex flex-col gap-3">
          {talk.takeaways.map((t) => (
            <li key={t}>
              <Dialog>
                <p className="body-kr !text-ink">{t}</p>
              </Dialog>
            </li>
          ))}
        </ul>

        {talk.numbers && talk.numbers.length > 0 && (
          <>
            <Sub no="04">발표에서 인용한 수치</Sub>
            <PBox className="p-4 @min-[440px]/screen:p-5">
              <dl className="flex flex-col divide-y divide-line">
                {talk.numbers.map((n) => (
                  <div key={n.label} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                    <dt className="text-[13px] text-ink-2">{n.label}</dt>
                    <dd className="text-[14px] font-bold">{n.value}</dd>
                  </div>
                ))}
              </dl>
            </PBox>
          </>
        )}

        {slides && (
          <div className="mt-5">
            <a href={slides} target="_blank" rel="noreferrer" data-nav className="pbtn pbtn-sm">
              발표 자료 ↗
            </a>
          </div>
        )}

        <BackRow href="/play#caster" label="라이브캐스터로" />
      </article>
    </Console>
  );
}
