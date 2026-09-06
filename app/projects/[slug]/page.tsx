import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "../../_ui/Reveal";
import { SubHead, Rows } from "../../_ui/Sheet";
import { Label } from "../../_ui/Label";
import { Btn } from "../../_ui/Btn";
import { DetailSheet, MetaTable, SubpageHeader } from "../../_components/SubpageFrame";
import { PaletteLegend, PaletteScope } from "../../_components/Palette";
import { PROJECTS, getProject } from "../../_data/projects";

type Params = { slug: string };

// 상세가 준비된(=detail 있는) 프로젝트만 정적 생성. placeholder는 제외.
export function generateStaticParams(): Params[] {
  return PROJECTS.filter((p) => p.detail).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.detail) return { title: "Project" };
  return { title: project.name, description: project.detail.tagline };
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default async function ProjectDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !project.detail) notFound();
  const { detail } = project;
  const letter = LETTERS[PROJECTS.filter((p) => !p.placeholder).findIndex((p) => p.slug === slug)] ?? "A";

  return (
    <main className={`page paper-grid theme-${project.slug} min-h-dvh`}>
      <PaletteScope slug={project.slug} />
      <SubpageHeader
        backHref="/#projects"
        backLabel="Projects"
        sheetNo="04"
        right={<PaletteLegend palette={project.palette} />}
      />

      <Reveal>
        <DetailSheet
          crumb={`Detail ${letter} · ${project.slug}`}
          sheet={`Sheet 04 · Detail ${letter}`}
          title={project.name}
          lead={detail.tagline}
        >
          <MetaTable
            items={[
              { k: "Role", v: detail.role },
              { k: "Period", v: detail.period },
              { k: "Year", v: project.year },
            ]}
          />

          <div className="mt-12">
            <SubHead no="1.">Overview</SubHead>
            <p className="prose-draft mt-4">{detail.overview}</p>
          </div>

          {project.cases && project.cases.length > 0 && (
            <div className="mt-12">
              <SubHead no="2.">작업 사례 — Section views</SubHead>
              <ol className="mt-6 flex flex-col gap-8">
                {project.cases.map((c, i) => (
                  <li key={c.title} className="border-t border-line pt-5">
                    <div className="flex items-baseline gap-3">
                      <span className="figure-no text-sm text-mark">
                        {letter}-{i + 1}
                      </span>
                      <h4 className="text-base font-semibold text-ink">{c.title}</h4>
                    </div>
                    <Rows
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
            </div>
          )}

          <div className="mt-12">
            <SubHead no="3.">핵심 기능</SubHead>
            <div className="mt-6 grid gap-px border border-line bg-line-soft sm:grid-cols-2">
              {detail.highlights.map((h, i) => (
                <div key={h.title} className="bg-paper p-5">
                  <Label mark>{String(i + 1).padStart(2, "0")}</Label>
                  <h4 className="mt-2 font-semibold text-ink">{h.title}</h4>
                  <p className="prose-draft mt-2 text-sm">{h.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <SubHead no="4.">Stack</SubHead>
            <ul className="mt-4 flex flex-wrap gap-2">
              {detail.stack.map((s) => (
                <li key={s} className="border border-line px-2.5 py-1 font-mono text-xs text-ink">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {detail.links && detail.links.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-3">
              {detail.links.map((l) => (
                <Btn key={l.href} href={l.href}>
                  {l.label} ↗
                </Btn>
              ))}
            </div>
          )}

          <div className="cut mt-14 pt-6">
            <Btn href="/#projects" variant="text">
              ← Sheet 04 · 모든 프로젝트
            </Btn>
          </div>
        </DetailSheet>
      </Reveal>
    </main>
  );
}
