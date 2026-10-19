import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TALKS, getTalk } from "../../../_data/talks";
import { anchors } from "../../../_site/anchors";
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

/** 사진 폭 — 문서 본문 폭(46rem - 좌우 여백)에 맞춘다 */
const PHOTO_SIZES = "(min-width: 46rem) 42rem, calc(100vw - 2.5rem)";

/** 발표 상세 — 현장 사진 · 배경 · 구성 · 핵심 메시지 · 인용 수치 */
export default async function TalkDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const talk = getTalk(slug);
  if (!talk) notFound();
  const i = TALKS.findIndex((t) => t.slug === slug);
  const prev = TALKS[i - 1];
  const next = TALKS[i + 1];
  const [cover, ...rest] = talk.photos ?? [];
  // 발표 자료는 빌드 시점에 public/에 파일이 있을 때만 버튼을 보인다
  const slides = talk.slides && existsSync(path.join(process.cwd(), "public", talk.slides)) ? talk.slides : undefined;

  return (
    <DocShell bar={<DocBar back="/#talks" backLabel="발표" play={`/play/talks/${slug}`} />}>
      <DocHeader kicker={`발표 · ${talk.date}`} title={talk.title} lead={talk.summary} />

      {cover && (
        <div className="mt-10 flex flex-col gap-3">
          {/* 대표 사진은 본문 폭 그대로, 세로로 긴 사진은 아래(무대 쪽)를 남기고 잘라 높이를 맞춘다 */}
          <Image
            src={cover.src}
            alt={cover.alt}
            width={cover.width}
            height={cover.height}
            sizes={PHOTO_SIZES}
            loading="eager"
            className="max-h-[28rem] w-full rounded-xl border border-line object-cover object-bottom"
          />
          {rest.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {rest.map((p) => (
                <Image
                  key={p.src}
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  sizes="(min-width: 46rem) 21rem, calc(100vw - 2.5rem)"
                  className="h-auto w-full rounded-xl border border-line"
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`${cover ? "mt-6" : "mt-10"} rounded-xl border border-line bg-card p-5 sm:p-6`}>
        <DefList
          rows={[
            { k: "무대", v: talk.venue },
            { k: "날짜", v: talk.date },
          ]}
        />
        {slides && (
          <div className="mt-6">
            <ButtonLink href={slides} newTab>
              발표 자료
            </ButtonLink>
          </div>
        )}
      </div>

      <DocHeading id={anchors.talk.context}>배경</DocHeading>
      <Prose>{talk.context}</Prose>

      <DocHeading id={anchors.talk.outline}>구성</DocHeading>
      <ol className="flex flex-col gap-3">
        {talk.outline.map((o, n) => (
          <li key={o} className="flex gap-4">
            <span className="shrink-0 pt-[3px] font-mono text-[13px] text-mute">{no2(n)}</span>
            <span className="text-[16px] leading-[1.8] text-ink-2">{o}</span>
          </li>
        ))}
      </ol>

      <DocHeading id={anchors.talk.takeaways}>핵심 메시지</DocHeading>
      <ul className="flex flex-col gap-4">
        {talk.takeaways.map((t) => (
          <li key={t} className="border-l-2 border-accent pl-4 text-[16px] leading-[1.8] text-ink">
            {t}
          </li>
        ))}
      </ul>

      {talk.numbers && talk.numbers.length > 0 && (
        <>
          <DocHeading id={anchors.talk.numbers}>발표에서 인용한 수치</DocHeading>
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
