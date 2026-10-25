import type { Metadata } from "next";
import { Fragment } from "react";
import { anchors } from "../../_site/anchors";
import {
  AI_NOTES,
  AI_TALK,
  AWARDS,
  CASES,
  COMPANY,
  CONTACTS,
  EDUCATION,
  GROWTH_LINE,
  JOB_ETC,
  JOBS,
  SIDE_PROJECTS,
  STACK,
  SUMMARY,
  type Case,
  type FlowNode,
  type FlowStep,
} from "../../_site/resume";

/* 지원서 첨부용 인쇄 페이지 — 검색엔진에는 노출하지 않는다 */
export const metadata: Metadata = {
  title: "정태환 이력서 · 포트폴리오",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const TOTAL = 2 + CASES.length;

/** "**굵게**" 표기만 해석한다 */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <strong key={i} className="r-strong">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Sheet({
  page,
  id,
  className,
  children,
}: {
  page: number;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`sheet ${className ?? ""}`} aria-label={`${page}쪽`}>
      {children}
      <footer className="sheet-foot">
        <span>정태환 · 이력서 · 포트폴리오</span>
        <span>
          {page} / {TOTAL}
        </span>
      </footer>
    </section>
  );
}

function Label({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={`r-label ${className ?? ""}`}>
      {children}
    </h2>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="r-link" target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/* ───────── 1~2쪽 이력서 ───────── */

/** 1쪽에 싣는 경력 수 — 나머지는 2쪽 위에 「경력 (계속)」으로 */
const P1_JOBS = 4;

function Jobs({ from, to }: { from: number; to?: number }) {
  return (
    <ol className={`flex flex-col gap-2 ${from === 0 ? "mt-2.5" : "mt-2"}`}>
      {JOBS.slice(from, to).map((j, k) => {
        const i = from + k;
        return (
          <li key={j.title}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-bold">
                <span className="mr-1.5 text-[var(--brick)]">{i + 1}</span>
                {j.title}
              </h3>
              <p className="shrink-0 text-[9pt] text-mute">
                {j.period} · {j.mr}
              </p>
            </div>
            <ul className="mt-0.5 flex flex-col gap-0.5 pl-4">
              {j.lines.map((l) => (
                <li
                  key={l}
                  className="relative text-ink-2 before:absolute before:top-[0.72em] before:-left-3 before:h-[3px] before:w-[3px] before:rounded-full before:bg-mute"
                >
                  <Rich text={l} />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

function ResumeFirst() {
  return (
    <Sheet page={1}>
      <header className="flex items-end justify-between gap-6 border-b-2 border-[var(--brick)] pb-3">
        <div>
          <h1 className="text-[24pt] leading-none font-bold tracking-[-0.02em]">
            정태환{" "}
            <span className="text-[13pt] font-medium text-mute">Donny</span>
          </h1>
          <p className="mt-2 text-[11pt] font-medium text-ink-2">
            프론트엔드 개발자 · AI 기반 애플리케이션
          </p>
        </div>
        <ul className="flex flex-col items-end gap-0.5 text-[9.5pt]">
          {CONTACTS.map((c) => (
            <li key={c.href}>
              <Ext href={c.href}>{c.label}</Ext>
            </li>
          ))}
        </ul>
      </header>

      <p id={anchors.resume.summary} className="mt-3.5 text-ink-2">
        {SUMMARY}
      </p>

      <Label id={anchors.resume.stack} className="mt-3">
        기술 스택
      </Label>
      <dl className="mt-2 grid grid-cols-[4.2rem_minmax(0,1fr)] gap-x-3">
        {STACK.map((s) => (
          <div key={s.k} className="contents">
            <dt className="font-bold text-ink">{s.k}</dt>
            <dd className="text-ink-2">{s.v}</dd>
          </div>
        ))}
      </dl>

      <Label id={anchors.resume.jobs} className="mt-3">
        경력
      </Label>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p className="text-[11pt] font-bold">
          {COMPANY.name}{" "}
          <span className="font-medium text-ink-2">· {COMPANY.role}</span>
        </p>
        <p className="shrink-0 text-[9.5pt] text-mute">{COMPANY.period}</p>
      </div>
      <p className="mt-0.5 text-ink-2">{COMPANY.about}</p>
      <p className="mt-1 text-[9pt] leading-[1.55] text-ink-2">{GROWTH_LINE}</p>

      <Jobs from={0} to={P1_JOBS} />
    </Sheet>
  );
}

function ResumeSecond() {
  return (
    <Sheet page={2}>
      <Label>경력 (계속)</Label>
      <Jobs from={P1_JOBS} />
      <p className="mt-2 text-ink-2">
        <span className="font-bold text-ink">그 외 · </span>
        {JOB_ETC}
      </p>

      <aside id={anchors.resume.aiTalk} className="mt-2 rounded-lg border border-[var(--brick)] bg-[var(--brick-soft)] px-4 py-2">
        <p className="text-[9pt] font-bold tracking-[0.04em] text-[var(--brick)]">
          {AI_TALK.label}
        </p>
        <p className="mt-0.5 text-[11.5pt] font-bold">「{AI_TALK.title}」</p>
        <p className="text-[9pt] text-mute">{AI_TALK.venue}</p>
        <p className="mt-1 text-ink-2">{AI_TALK.body}</p>
      </aside>

      <Label id={anchors.resume.aiNotes} className="mt-2">
        AI 노트
      </Label>
      <ul className="mt-1 flex flex-col gap-0.5 text-[9pt] leading-[1.5]">
        {AI_NOTES.map((n) => (
          <li key={n.href}>
            <Ext href={n.href}>{n.title}</Ext>
            <span className="text-ink-2"> — {n.line}</span>
          </li>
        ))}
      </ul>

      <Label id={anchors.resume.sideProjects} className="mt-2">
        개인 프로젝트
      </Label>
      <ul className="mt-1 flex flex-col gap-0.5">
        {SIDE_PROJECTS.map((p) => (
          <li key={p.name}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-bold">
                {p.name}{" "}
                <span className="ml-1 text-[9pt] font-normal text-mute">
                  {p.stack}
                </span>
              </h3>
              <p className="shrink-0 text-[9pt] text-mute">
                {p.period}
                {p.live && (
                  <>
                    {" · "}
                    <Ext href={p.live}>Live</Ext>
                  </>
                )}
                {p.href && (
                  <>
                    {" · "}
                    <Ext href={p.href}>GitHub</Ext>
                  </>
                )}
              </p>
            </div>
            {p.body && <p className="mt-0.5 text-ink-2">{p.body}</p>}
          </li>
        ))}
      </ul>

      <Label id={anchors.resume.education} className="mt-2">
        학력
      </Label>
      <ul className="mt-1 flex flex-col gap-0.5">
        {EDUCATION.map((e) => (
          <li
            key={e.name}
            className="flex items-baseline justify-between gap-4"
          >
            <p>
              <span className="font-bold">{e.name}</span>
              {e.note && <span className="text-ink-2"> · {e.note}</span>}
            </p>
            <p className="shrink-0 text-[9pt] text-mute">{e.period}</p>
          </li>
        ))}
      </ul>

      <Label id={anchors.resume.awards} className="mt-2">
        자격 · 수상
      </Label>
      <ul className="mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5">
        {AWARDS.map((a) => (
          <li
            key={a.name}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="font-medium">{a.name}</span>
            <span className="shrink-0 text-[9pt] text-mute">{a.period}</span>
          </li>
        ))}
      </ul>

      <Label className="mt-2">포트폴리오</Label>
      <ol className="mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5">
        {CASES.map((c, i) => (
          <li key={c.slug} className="flex items-baseline gap-2">
            <span className="shrink-0 font-bold text-[var(--brick)]">
              {c.no}
            </span>
            <span className="font-bold">{c.title}</span>
            <span className="ml-auto shrink-0 text-[9pt] text-mute">
              {i + 3}쪽
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-1 text-[9pt] text-mute">
        수치는 머지된 MR·테스트 기록, 저장소 문서, 사내 분석 도구에서 확인한 값입니다 · 자세히는{" "}
        <Ext href="https://usetaehwan.page">usetaehwan.page</Ext>
      </p>
    </Sheet>
  );
}

/* ───────── 3~9쪽 포트폴리오 ───────── */

function Node({ n }: { n: FlowNode }) {
  return (
    <div className="flow-node" data-kind={n.kind ?? "code"}>
      <b>{n.t}</b>
      {n.s && <span>{n.s}</span>}
    </div>
  );
}

function Flow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flow">
      {steps.map((st, i) => (
        <span key={i} className="flow-step">
          {i > 0 && (
            <span className="flow-arrow" aria-hidden>
              →
            </span>
          )}
          {Array.isArray(st) ? (
            <span className="flow-par">
              {st.map((n) => (
                <Node key={n.t} n={n} />
              ))}
            </span>
          ) : (
            <Node n={st} />
          )}
        </span>
      ))}
    </div>
  );
}

function CasePage({ c, page }: { c: Case; page: number }) {
  const kinds = new Set(c.flow.steps.flat().map((n) => n.kind));
  const gap = c.dense ? "mt-4" : "mt-5";
  return (
    <Sheet page={page} id={anchors.resume.case(c.slug)} className="sheet-case">
      <header className="border-b-2 border-[var(--brick)] pb-3">
        <div className="flex items-baseline justify-between gap-4 text-[9pt] text-mute">
          <span>
            <span className="font-bold text-[var(--brick)]">
              PORTFOLIO {c.no}
            </span>{" "}
            · {c.kind}
          </span>
          <span>
            {c.meta}
            {c.links?.map((l) => (
              <Fragment key={l.href}>
                {" · "}
                <Ext href={l.href}>{l.label}</Ext>
              </Fragment>
            ))}
          </span>
        </div>
        <h1 className="mt-1.5 text-[19pt] leading-tight font-bold tracking-[-0.02em]">
          {c.title}
        </h1>
        <p className="mt-1 text-[11pt] font-medium text-ink-2">{c.tagline}</p>
      </header>

      <div className={`${gap} grid grid-cols-2 gap-3`}>
        <div className="rounded-lg border border-line px-4 py-3.5">
          <p className="text-[9pt] font-bold tracking-[0.06em] text-mute">
            문제
          </p>
          <p className="mt-1 text-ink-2">{c.problem}</p>
        </div>
        <div className="rounded-lg border border-[var(--brick)] px-4 py-3.5">
          <p className="text-[9pt] font-bold tracking-[0.06em] text-[var(--brick)]">
            내 판단
          </p>
          <p className="mt-1 text-ink">{c.decision}</p>
        </div>
      </div>

      <Label className={gap}>구현</Label>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {c.build.map((b) => (
          <li
            key={b}
            className="relative pl-4 text-ink-2 before:absolute before:top-[0.72em] before:left-1 before:h-[3px] before:w-[3px] before:rounded-full before:bg-[var(--brick)]"
          >
            {b}
          </li>
        ))}
      </ul>

      <Label className={gap}>결과</Label>
      <dl className="mt-2.5 grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-line bg-line">
        {c.results.map((r) => (
          <div key={r.l} className="flex flex-col bg-white px-3.5 py-3">
            <dd className="text-[14pt] leading-tight font-bold tracking-[-0.01em] text-ink">
              {r.v}
            </dd>
            <dt className="mt-1 text-[9.5pt] leading-[1.45] text-mute">{r.l}</dt>
          </div>
        ))}
      </dl>

      <Label className={gap}>구조</Label>
      <figure className="mt-2.5 rounded-lg bg-hover px-4 py-4">
        <Flow steps={c.flow.steps} />
        <figcaption className="mt-3 text-[9pt] text-mute">
          {c.flow.caption}
          {kinds.has("llm") && (
            <span className="ml-2 inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm border border-[var(--brick)] bg-[var(--brick-soft)]"
                aria-hidden
              />{" "}
              LLM
            </span>
          )}
          {kinds.has("ext") && (
            <span className="ml-2 inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm border border-dashed border-line-2"
                aria-hidden
              />{" "}
              외부 시스템
            </span>
          )}
        </figcaption>
      </figure>

      <p className={`${gap} text-ink-2`}>
        <span className="font-bold text-ink">기술 · </span>
        {c.stack}
      </p>
    </Sheet>
  );
}

/** /resume — 화면에서는 종이 미리보기, 인쇄하면 A4 8쪽 */
export default function ResumePage() {
  return (
    <main className="resume">
      <ResumeFirst />
      <ResumeSecond />
      {CASES.map((c, i) => (
        <CasePage key={c.slug} c={c} page={i + 3} />
      ))}
    </main>
  );
}
