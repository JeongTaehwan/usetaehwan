import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "../../_data/projects";
import { WORLDS, isWorldSlug } from "../../_loft/worlds/scenes";
import { Parallax, SceneFit } from "../../_loft/Ambient";
import { cn } from "../../_ui/cn";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.filter((p) => p.detail).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.detail) return { title: "Project" };
  return { title: project.name, description: project.detail.tagline };
}

/**
 * 프로젝트 상세 — 문 너머의 세계(관중 시점)가 히어로, 아래로 그 세계의 종이 위에
 * 개요 → 작업 사례(문제·파악·해결) → 핵심 기능 → 스택 → 링크.
 */
export default async function ProjectDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !project.detail || !isWorldSlug(slug)) notFound();
  const { detail } = project;
  const w = WORLDS[slug];
  const L = w.letter;

  return (
    <main className={cn("world relative min-h-dvh", `world-${slug}`)}>
      {/* 헤더 */}
      <header data-print="hide" className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
          <Link href="/" className="caslon text-[18px] italic text-[var(--w-ink)] sm:text-[20px]">Taehwan Jeong</Link>
          <Link href="/#projects" className="w-btn w-btn-line border-[var(--w-acc)] text-[var(--w-acc)] hover:bg-[var(--w-acc)] hover:text-[var(--w-on)]">← Projects · Detail {L}</Link>
        </div>
      </header>

      {/* 히어로 — 세계 */}
      <div className="relative h-[min(100svh,900px)] min-h-[420px] overflow-hidden">
        <Parallax speed={0.25} className="absolute inset-0">
          <SceneFit className="h-full w-full"><w.Scene /></SceneFit>
        </Parallax>
        {/* 패널 — 이름 · 한 줄 · 사례 제목 */}
        <div className="absolute inset-x-5 bottom-[12%] sm:inset-x-8 lg:left-14 lg:right-auto lg:top-[28%] lg:bottom-auto lg:w-[560px]">
          <div className="w-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h1 className="caslon text-[30px] leading-none text-[var(--w-ink)] sm:text-[34px]">{project.name}</h1><span className="caps text-[9px] text-[var(--w-acc)]">Detail {L} · {w.place}</span></div>
            <p className="mt-3 text-[14px] leading-[1.75] text-[var(--w-ink-2)] [word-break:keep-all]">{detail.tagline}</p>
            <ol className="mt-3 hidden sm:block">
              {project.cases?.map((c, i) => (
                <li key={c.title} className="flex gap-4 border-t border-[var(--w-line)] py-2.5"><span className="caslon w-8 shrink-0 text-[13px] text-[var(--w-acc)]">{L}-{i + 1}</span><a href={`#case-${i + 1}`} className="text-[13.5px] text-[var(--w-ink)] hover:text-[var(--w-acc)] [word-break:keep-all]">{c.title}</a></li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href="#full" className="w-btn w-btn-acc">Full drawing</a>
              {detail.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="w-btn w-btn-line">{l.label}</a>)}
              <span className="caps ml-auto hidden text-[9px] text-[var(--w-muted)] sm:inline">{project.tags.join(" · ")}</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[140px] bg-gradient-to-b from-transparent to-[var(--w-bg)]" />
        <div className="grain" />
      </div>

      {/* 본문 */}
      <div id="full" className="mx-auto w-full max-w-[1040px] scroll-mt-16 px-5 pb-24 pt-14 sm:px-8">
        <div className="caps text-[var(--w-acc)]">Detail {L} · {w.place} · Full drawing</div>
        <h2 className="caslon mt-4 text-[40px] leading-[1.05] text-[var(--w-ink)] sm:text-[56px]">{project.name}</h2>
        <dl className="mt-6 grid grid-cols-2 border border-[var(--w-line)] bg-[var(--w-paper)] sm:grid-cols-4">
          {[["Role", detail.role], ["Period", detail.period], ["Year", project.year], ["Place", w.placeKo]].map(([k, v]) => (
            <div key={k} className="border-[var(--w-line)] p-4 [&:not(:first-child)]:border-l max-sm:[&:nth-child(3)]:border-l-0 max-sm:[&:nth-child(n+3)]:border-t"><dt className="caps text-[9px] text-[var(--w-muted)]">{k}</dt><dd className="mt-1.5 text-[14px] text-[var(--w-ink)]">{v}</dd></div>
          ))}
        </dl>

        <Section no="1." title="Overview"><p className="max-w-[820px] text-[15.5px] leading-[1.85] text-[var(--w-ink-2)] [word-break:keep-all]">{detail.overview}</p></Section>

        {project.cases && (
          <Section no="2." title="작업 사례 — Section views">
            <ol>
              {project.cases.map((c, i) => (
                <li key={c.title} id={`case-${i + 1}`} className="grid scroll-mt-20 gap-3 border-t border-[var(--w-line)] py-7 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-7">
                  <div><div className="caslon text-[22px] text-[var(--w-acc)]">{L}-{i + 1}</div><div className="caps mt-1 text-[9px] text-[var(--w-muted)]">Section view</div></div>
                  <div className="flex flex-col gap-3">
                    <h4 className="myeongjo text-[18px] leading-[1.4] text-[var(--w-ink)] sm:text-[20px]">{c.title}</h4>
                    {[["문제", c.problem], ["파악", c.diagnosis], ["해결", c.solution]].map(([k, v]) => (
                      <div key={k} className="grid gap-1 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-4"><div className="caps pt-1 text-[var(--w-acc)]">{k}</div><div className="text-[14.5px] leading-[1.8] text-[var(--w-ink-2)] [word-break:keep-all]">{v}</div></div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <Section no="3." title="핵심 기능">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {detail.highlights.map((h, i) => (
              <div key={h.title} className="border border-[var(--w-line)] bg-[var(--w-paper)] p-5"><div className="caps text-[9px] text-[var(--w-acc)]">{String(i + 1).padStart(2, "0")}</div><div className="myeongjo mt-2 text-[16px] text-[var(--w-ink)]">{h.title}</div><p className="mt-2 text-[13.5px] leading-[1.7] text-[var(--w-ink-2)] [word-break:keep-all]">{h.body}</p></div>
            ))}
          </div>
        </Section>

        <Section no="4." title="Stack"><div className="flex flex-wrap gap-2">{detail.stack.map((s) => <span key={s} className="caps border border-[var(--w-line)] px-3 py-2 text-[10px] text-[var(--w-ink)]">{s}</span>)}</div></Section>

        <div className="mt-12 flex flex-wrap items-center gap-2.5">
          {detail.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="w-btn w-btn-line border-[var(--w-acc)] text-[var(--w-acc)]">{l.label} ↗</a>)}
          <Link href="/#projects" className="caps ml-auto text-[var(--w-muted)] hover:text-[var(--w-ink)]">← Projects · 복도로</Link>
        </div>
      </div>
      <div className="grain" />
    </main>
  );
}

function Section({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-baseline gap-3.5"><span className="caslon text-[14px] text-[var(--w-acc)]">{no}</span><h3 className="myeongjo text-[22px] text-[var(--w-ink)] sm:text-[26px]">{title}</h3></div>
      {children}
    </section>
  );
}
