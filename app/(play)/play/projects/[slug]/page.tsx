import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "../../../../_data/projects";
import { Console } from "../../../../_console/Console";
import { BackRow, Dialog, DocHero, PBox, Rows, Sub, TypeChip } from "../../../../_console/ui";
import { PROJECT_SPRITE } from "../../../../_console/scenes/common";
import { dexNo } from "../../../../_console/scenes/Dex";

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

/** 프로젝트 상세 — 도감 한 항목. 머리는 그 프로젝트의 실제 팔레트로 칠한다. */
export default async function ProjectDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.detail) notFound();
  const { detail } = project;
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  const sw = Object.fromEntries(project.palette.swatches.map((s) => [s.name, s.value]));

  return (
    <Console label={`도감 · ${dexNo(i)} ${project.name}`} backHref="/play#dex" top={<div className="detail-top">        <DocHero sprite={PROJECT_SPRITE[slug] ?? "blocks"} no={`${dexNo(i)} · ${project.year}`} title={project.name} bg={sw.bg} fg={sw.fg} accent={sw.brand}>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <TypeChip key={t}>{t}</TypeChip>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label={`팔레트 ${project.palette.label}`}>
            {project.palette.swatches.map((s) => (
              <span key={s.name} className="h-3.5 w-3.5 border-2 border-current" style={{ background: s.value }} title={`${s.name} ${s.value}`} />
            ))}
          </div>
        </DocHero>

        <Dialog className="mt-4 text-[15px] leading-[1.75] @min-[440px]/screen:text-[16px]">
          <p className="[word-break:keep-all]">{detail.tagline}</p>
        </Dialog></div>}>
      <article className="document">


        <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
          <Rows
            rows={[
              { k: "역할", v: detail.role },
              { k: "기간", v: detail.period },
            ]}
          />
          {detail.links && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {detail.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" data-nav className="pbtn pbtn-sm">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </PBox>

        <Sub no="01">개요</Sub>
        <p className="body-kr">{detail.overview}</p>

        {project.cases && (
          <>
            <Sub no="02">작업 사례</Sub>
            <ol className="flex flex-col gap-3">
              {project.cases.map((c, n) => (
                <li key={c.title}>
                  <PBox className="p-4 @min-[440px]/screen:p-5">
                    <div className="text-[12px] font-bold text-red">사례 {n + 1}</div>
                    <h4 className="mt-1 text-[16px] font-bold leading-[1.5] [word-break:keep-all] @min-[440px]/screen:text-[17px]">{c.title}</h4>
                    <Rows
                      className="mt-3"
                      rows={[
                        { k: "문제", v: c.problem },
                        { k: "파악", v: c.diagnosis },
                        { k: "해결", v: c.solution },
                      ]}
                    />
                  </PBox>
                </li>
              ))}
            </ol>
          </>
        )}

        <Sub no="03">핵심 기능</Sub>
        <div className="grid gap-3 @min-[440px]/screen:grid-cols-2">
          {detail.highlights.map((h) => (
            <PBox key={h.title} className="p-4">
              <div className="text-[15px] font-bold [word-break:keep-all]">{h.title}</div>
              <p className="body-kr mt-2 !text-[13.5px]">{h.body}</p>
            </PBox>
          ))}
        </div>

        <Sub no="04">스택</Sub>
        <div className="flex flex-wrap gap-1.5">
          {detail.stack.map((s) => (
            <span key={s} className="stat-chip">
              {s}
            </span>
          ))}
        </div>

        <BackRow href="/play#dex" label="도감으로" />
      </article>
    </Console>
  );
}
