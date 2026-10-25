/**
 * 챗봇 코퍼스 익스포터 — 사이트가 렌더하는 원본(app/_data · _site/intro · _site/resume)을 JSON으로 뽑는다.
 * 출처 링크의 앵커는 페이지와 같은 함수(app/_site/anchors.ts)로 만든다.
 *
 *   npx tsx scripts/ask-corpus.ts            # stdout
 *   npx tsx scripts/ask-corpus.ts out.json   # 파일
 *
 * 인제스트(ask-server: python -m ask.ingest)가 subprocess로 부른다. 민감정보 필터는 Python 쪽에서 한다.
 */
import { writeFileSync } from "node:fs";
import { PROJECTS } from "../app/_data/projects";
import { AWARDS, CERTIFICATIONS, COMPANY as COMPANY_LINE, EDUCATION, EXPERIENCE, GROWTH } from "../app/_data/experience";
import { PRACTICES } from "../app/_data/ai-practices";
import { TALKS } from "../app/_data/talks";
import { RECORDS, TRAITS } from "../app/_data/profile";
import { BLOG_URL, EMAIL, GITHUB_URL } from "../app/_data/links";
import { INTRO } from "../app/_site/intro";
import { anchors } from "../app/_site/anchors";
import * as R from "../app/_site/resume";

type Chunk = { anchor: string; section: string; text: string };
type Doc = { doc_id: string; source_path: string; title: string; url: string; kind: string; chunks: Chunk[] };

/** 이력서 원고의 **굵게** 표시 등 마크다운 기호를 걷어낸다 */
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").trim();
const lines = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join("\n");

const docs: Doc[] = [];

/* 홈 — 소개 · 경력 · 학력 · 연락 */
docs.push({
  doc_id: "home",
  source_path: "app/_site/intro.ts · app/_data/{profile,experience,links}.ts",
  title: "홈",
  url: "/",
  kind: "home",
  chunks: [
    {
      anchor: anchors.home.about,
      section: "소개",
      text: lines(
        ...INTRO,
        "성장 과정: " + GROWTH.map((g) => `${g.date} ${g.text}`).join(" · "),
        "대표 기록: " + RECORDS.map((r) => `${r.k} ${r.v} (${r.note})`).join(" · "),
        ...TRAITS.map((t) => `${t.k}: ${t.v}`),
      ),
    },
    ...EXPERIENCE.map((e, i) => ({
      anchor: anchors.home.experience(i),
      section: `경력: ${e.title}`,
      text: lines(`${COMPANY_LINE}`, `${e.period} · ${e.title}`, e.summary, `수치: ${e.dims.join(" · ")}`),
    })),
    {
      anchor: anchors.home.education,
      section: "학력 · 자격 · 수상",
      text: lines(
        ...EDUCATION.map((e) => `학력: ${e.school} · ${e.program}${e.credential ? ` · ${e.credential}` : ""} · ${e.period}`),
        ...CERTIFICATIONS.map((c) => `자격: ${c.name} · ${c.date}`),
        ...AWARDS.map((a) => `수상: ${a.name} · ${a.issuer} · ${a.date}`),
      ),
    },
    {
      anchor: anchors.home.contact,
      section: "연락",
      text: lines(`이메일: ${EMAIL}`, `GitHub: ${GITHUB_URL}`, `블로그: ${BLOG_URL}`, "제안이나 협업 이야기는 메일로 받습니다."),
    },
  ],
});

/* 프로젝트 상세 */
for (const p of PROJECTS) {
  if (!p.detail) continue;
  const d = p.detail;
  docs.push({
    doc_id: `project:${p.slug}`,
    source_path: "app/_data/projects.ts",
    title: `프로젝트 ${p.name}`,
    url: `/projects/${p.slug}`,
    kind: "project",
    chunks: [
      {
        anchor: anchors.project.overview,
        section: "개요",
        text: lines(`${p.name} — ${d.tagline}`, `역할: ${d.role} · 기간: ${d.period}`, p.summary, d.overview, `스택: ${d.stack.join(", ")}`),
      },
      ...(p.cases ?? []).map((c, i) => ({
        anchor: anchors.project.case(i),
        section: `사례: ${c.title}`,
        text: lines(`문제: ${c.problem}`, `파악: ${c.diagnosis}`, `해결: ${c.solution}`),
      })),
      ...d.highlights.map((h, i) => ({
        anchor: anchors.project.feature(i),
        section: `핵심 기능: ${h.title}`,
        text: h.body,
      })),
    ],
  });
}

/* AI 노트 */
for (const a of PRACTICES) {
  docs.push({
    doc_id: `ai:${a.slug}`,
    source_path: "app/_data/ai-practices.ts",
    title: `AI 노트 ${a.title}`,
    url: `/ai/${a.slug}`,
    kind: "ai",
    chunks: [
      {
        anchor: anchors.practice.intro,
        section: "도입",
        text: lines(a.summary, a.intro, `대표 수치: ${a.stat.value} — ${a.stat.label}`, `대표 규칙: ${a.keyRule}`),
      },
      ...a.items.map((it, i) => ({
        anchor: anchors.practice.case(i),
        section: `사례: ${it.title}`,
        text: lines(`문제: ${it.problem}`, `설계: ${it.design}`, `결과: ${it.result}`),
      })),
      { anchor: anchors.practice.rules, section: "남은 규칙", text: a.rules.map((r) => `- ${r}`).join("\n") },
    ],
  });
}

/* 발표 */
for (const t of TALKS) {
  docs.push({
    doc_id: `talk:${t.slug}`,
    source_path: "app/_data/talks.ts",
    title: `발표 ${t.title}`,
    url: `/talks/${t.slug}`,
    kind: "talk",
    chunks: [
      { anchor: anchors.talk.context, section: "배경", text: lines(`${t.title} · ${t.venue} · ${t.date}`, t.summary, t.context) },
      { anchor: anchors.talk.outline, section: "구성", text: t.outline.map((o) => `- ${o}`).join("\n") },
      { anchor: anchors.talk.takeaways, section: "핵심 메시지", text: t.takeaways.map((o) => `- ${o}`).join("\n") },
      ...(t.numbers?.length
        ? [{ anchor: anchors.talk.numbers, section: "인용 수치", text: t.numbers.map((n) => `${n.label}: ${n.value}`).join("\n") }]
        : []),
    ],
  });
}

/* 이력서 · 포트폴리오 (/resume) */
docs.push({
  doc_id: "resume",
  source_path: "app/_site/resume.ts",
  title: "이력서 · 포트폴리오",
  url: "/resume",
  kind: "resume",
  chunks: [
    { anchor: anchors.resume.summary, section: "요약", text: R.SUMMARY },
    { anchor: anchors.resume.stack, section: "기술 스택", text: R.STACK.map((s) => `${s.k}: ${s.v}`).join("\n") },
    {
      anchor: anchors.resume.jobs,
      section: "경력: 회사",
      text: lines(`${R.COMPANY.name} · ${R.COMPANY.role} · ${R.COMPANY.period}`, R.COMPANY.about, R.GROWTH_LINE, `그 외: ${R.JOB_ETC}`),
    },
    ...R.JOBS.map((j) => ({
      anchor: anchors.resume.jobs,
      section: `경력: ${j.title}`,
      text: lines(`${j.title} · ${j.period} · ${j.mr}`, ...j.lines.map(plain)),
    })),
    { anchor: anchors.resume.aiTalk, section: R.AI_TALK.label, text: lines(`「${R.AI_TALK.title}」 · ${R.AI_TALK.venue}`, R.AI_TALK.body) },
    { anchor: anchors.resume.aiNotes, section: "AI 노트", text: lines(...R.AI_NOTES.map((n) => `${n.title} — ${n.line}`)) },
    ...R.SIDE_PROJECTS.map((s) => ({
      anchor: anchors.resume.sideProjects,
      section: `개인 프로젝트: ${s.name}`,
      text: lines(`${s.name} · ${s.period} · ${s.stack}`, s.body),
    })),
    {
      anchor: anchors.resume.education,
      section: "학력",
      text: R.EDUCATION.map((e) => `${e.name}${e.note ? ` · ${e.note}` : ""} · ${e.period}`).join("\n"),
    },
    { anchor: anchors.resume.awards, section: "자격 · 수상", text: R.AWARDS.map((a) => `${a.name} · ${a.period}`).join("\n") },
    ...R.CASES.map((c) => ({
      anchor: anchors.resume.case(c.slug),
      section: `포트폴리오: ${c.title}`,
      text: lines(
        `${c.title} — ${c.tagline}`,
        `${c.kind} · ${c.meta}`,
        `문제: ${plain(c.problem)}`,
        `판단: ${plain(c.decision)}`,
        "구현:",
        ...c.build.map((b) => `- ${plain(b)}`),
        `결과: ${c.results.map((r) => `${r.l} ${r.v}`).join(" · ")}`,
        `기술: ${c.stack}`,
      ),
    })),
  ],
});

const out = JSON.stringify({ version: 1, documents: docs }, null, 2);
const path = process.argv[2];
if (path) writeFileSync(path, out);
else process.stdout.write(out);
