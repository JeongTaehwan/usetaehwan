import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "../../../_data/projects";
import { anchors } from "../../../_site/anchors";
import { ButtonLink, DefList, DocBar, DocHeader, DocHeading, DocShell, Pills, PrevNext, ProjectMark, Prose } from "../../../_site/ui";

type Params = { slug: string };

const WITH_DETAIL = PROJECTS.filter((p) => p.detail);

export function generateStaticParams(): Params[] {
  return WITH_DETAIL.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.detail) return { title: "Project" };
  return { title: project.name, description: project.detail.tagline };
}

/** 프로젝트 상세 — 개요 · 작업 사례 · 핵심 기능 · 스택 */
export default async function ProjectDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.detail) notFound();
  const { detail } = project;
  const i = WITH_DETAIL.findIndex((p) => p.slug === slug);
  const prev = WITH_DETAIL[i - 1];
  const next = WITH_DETAIL[i + 1];

  return (
    <DocShell bar={<DocBar back="/#projects" backLabel="프로젝트" play={`/play/projects/${slug}`} />}>
      <DocHeader kicker={`프로젝트 · ${project.year}`} title={project.name} lead={detail.tagline} mark={<ProjectMark project={project} size="lg" />}>
        <Pills items={project.tags} className="mt-6" />
      </DocHeader>

      <div className="mt-10 rounded-xl border border-line bg-card p-5 sm:p-6">
        <DefList
          rows={[
            { k: "역할", v: detail.role },
            { k: "기간", v: detail.period },
            {
              k: "팔레트",
              v: (
                <span className="flex flex-wrap items-center gap-2">
                  {project.palette.swatches.map((s) => (
                    <span key={s.name} className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-mute">
                      <span className="h-3.5 w-3.5 rounded-full border border-line-2" style={{ background: s.value }} aria-hidden />
                      {s.value}
                    </span>
                  ))}
                </span>
              ),
            },
          ]}
        />
        {detail.links && (
          <div className="mt-6 flex flex-wrap gap-2.5">
            {detail.links.map((l) => (
              <ButtonLink key={l.href} href={l.href}>
                {l.label}
              </ButtonLink>
            ))}
          </div>
        )}
      </div>

      <DocHeading id={anchors.project.overview}>개요</DocHeading>
      <Prose>{detail.overview}</Prose>

      {project.cases && (
        <>
          <DocHeading>작업 사례</DocHeading>
          <ol className="flex flex-col gap-4">
            {project.cases.map((c, n) => (
              <li key={c.title} id={anchors.project.case(n)} className="rounded-xl border border-line bg-card p-5 sm:p-6">
                <p className="font-mono text-[12.5px] text-mute">사례 {n + 1}</p>
                <h3 className="mt-1 text-[17px] leading-[1.5] font-bold">{c.title}</h3>
                <DefList
                  className="mt-4"
                  rows={[
                    { k: "문제", v: c.problem },
                    { k: "파악", v: c.diagnosis },
                    { k: "해결", v: c.solution },
                  ]}
                />
              </li>
            ))}
          </ol>
        </>
      )}

      <DocHeading>핵심 기능</DocHeading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {detail.highlights.map((h, n) => (
          <li key={h.title} id={anchors.project.feature(n)} className="rounded-xl border border-line p-5">
            <h3 className="text-[15.5px] leading-[1.5] font-bold">{h.title}</h3>
            <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-2">{h.body}</p>
          </li>
        ))}
      </ul>

      <DocHeading>스택</DocHeading>
      <Pills items={detail.stack} />

      <PrevNext
        prev={prev && { href: `/projects/${prev.slug}`, title: prev.name }}
        next={next && { href: `/projects/${next.slug}`, title: next.name }}
      />
    </DocShell>
  );
}
