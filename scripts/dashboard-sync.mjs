#!/usr/bin/env node
/**
 * claude-skills 대시보드 데이터를 사이트로 옮긴다.
 *
 *   npm run dashboard:sync                    # 전체 기간
 *   npm run dashboard:sync -- --days 30       # 최근 30일
 *   npm run dashboard:sync -- --gen-key       # 주인 전용 데이터 암호화 키를 만든다 (.env.local 에 저장)
 *
 * 만드는 파일
 *   app/_data/dashboard/public.json       누구나 보는 숫자 — 요청 원문·저장소 밖 스킬 이름은 넣지 않는다
 *   app/_data/dashboard/private.enc.json  주인 전용 — DASHBOARD_DATA_KEY 로 AES-256-GCM 암호화.
 *                                         키가 없으면 비워 둔다. 평문은 디스크에 남기지 않는다.
 *
 * 데이터 원본은 이 컴퓨터의 Claude Code 기록(~/.claude)이라, 기록이 있는 PC 에서 돌린다.
 * claude-skills 위치: CLAUDE_SKILLS_DIR 환경 변수 → .env.local → ../claude-skills
 */
import { execFileSync } from "node:child_process";
import { createCipheriv, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "app/_data/dashboard");
const ENV_FILE = path.join(ROOT, ".env.local");
const AAD = Buffer.from("usetaehwan-dashboard-v1");

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const fileEnv = readEnvFile();
const env = (k) => process.env[k] ?? fileEnv[k];

if (process.argv.includes("--gen-key")) {
  if (env("DASHBOARD_DATA_KEY")) {
    console.log("DASHBOARD_DATA_KEY 가 이미 있다. 바꾸려면 .env.local 에서 지우고 다시 실행한다.");
    process.exit(0);
  }
  const key = randomBytes(32).toString("base64");
  fs.appendFileSync(ENV_FILE, `${fs.existsSync(ENV_FILE) ? "\n" : ""}DASHBOARD_DATA_KEY=${key}\n`);
  console.log(`.env.local 에 DASHBOARD_DATA_KEY 를 저장했다.\nVercel 프로젝트 환경 변수에도 같은 값을 넣는다:\n\n  DASHBOARD_DATA_KEY=${key}\n`);
  process.exit(0);
}

// ── 1. claude-skills 의 collect() 를 그대로 부른다 — 판정 로직을 두 벌로 만들지 않는다
const skillsDir = path.resolve(ROOT, arg("--skills") ?? env("CLAUDE_SKILLS_DIR") ?? "../claude-skills");
const dashPy = path.join(skillsDir, "scripts/dashboard.py");
if (!fs.existsSync(dashPy)) {
  console.error(`claude-skills 를 찾지 못했다: ${dashPy}\nCLAUDE_SKILLS_DIR 를 .env.local 에 적거나 --skills <경로> 를 준다.`);
  process.exit(1);
}
const days = Number(arg("--days") ?? 0);
const PY = `import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("dashboard", sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
d = int(sys.argv[2])
print(json.dumps(m.collect(d or None, False), ensure_ascii=False))`;
const raw = JSON.parse(
  execFileSync(env("PYTHON") ?? "python3", ["-c", PY, dashPy, String(days)], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  }),
);

// ── 2. 공개본 — 숫자만. 저장소에 있는 스킬·에이전트 이름만 남기고 나머지는 '기타'로 묶는다
const repoSkills = new Set(raw.budget.skills.map((s) => s.name));
const repoAgents = new Set(raw.budget.agents.map((a) => a.name));
const split = (rows, known) => {
  const kept = rows.filter((r) => known.has(r.name));
  const other = rows.filter((r) => !known.has(r.name));
  return { kept, other, otherCount: other.reduce((n, r) => n + r.count, 0) };
};
const sk = split(raw.usage.skills, repoSkills);
const ag = split(raw.usage.agents, repoAgents);

const g = raw.ontology;
let ontology = null;
if (g) {
  const concepts = new Map(g.nodes.filter((n) => n.kind === "concept").map((n) => [n.id, n]));
  const refs = new Map(g.nodes.filter((n) => n.kind === "reference").map((n) => [n.id, n]));
  const rel = {};
  const about = new Map();
  const cross = new Map();
  for (const e of g.edges) {
    rel[e.rel] = (rel[e.rel] ?? 0) + 1;
    if (e.rel === "about") about.set(e.to, (about.get(e.to) ?? 0) + 1);
    if (e.rel === "see_instead") {
      const a = refs.get(e.from)?.domain, b = refs.get(e.to)?.domain;
      if (a && b && a !== b) {
        const k = [a, b].sort().join("|");
        cross.set(k, (cross.get(k) ?? 0) + 1);
      }
    }
  }
  const label = (d) => g.domain_labels?.[d] ?? d;
  const byDomain = {};
  for (const r of refs.values()) byDomain[r.domain] = (byDomain[r.domain] ?? 0) + 1;
  ontology = {
    concepts: concepts.size,
    references: refs.size,
    relations: rel,
    topConcepts: [...about.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, n]) => ({ label: concepts.get(id)?.label ?? id, domain: label(concepts.get(id)?.domain), count: n })),
    domains: Object.entries(byDomain)
      .sort((a, b) => b[1] - a[1])
      .map(([d, n]) => ({ label: label(d), count: n })),
    crossDomain: [...cross.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k, n]) => ({ pair: k.split("|").map(label), count: n })),
  };
}

const pub = {
  generated: raw.generated.slice(0, 10),
  days: raw.days ?? null,
  repo: raw.repo,
  usage: {
    source: raw.usage.source,
    skills: sk.kept,
    agents: ag.kept,
    otherCount: sk.otherCount + ag.otherCount,
    unused: raw.usage.unused.filter((n) => repoSkills.has(n)),
    daily: raw.usage.daily,
  },
  candidates: {
    groups: raw.candidates.length,
    requests: raw.candidates.reduce((n, c) => n + c.count, 0),
  },
  budget: {
    skills: raw.budget.skills.map(({ name, desc, body }) => ({ name, desc, body })),
    agents: raw.budget.agents.map(({ name, model, desc }) => ({ name, model, desc: desc.length })),
    memory: raw.budget.memory,
    limits: raw.budget.limits,
  },
  profiles: {
    models: raw.profiles.models,
    profiles: Object.entries(raw.profiles.profiles).map(([name, p]) => ({
      name,
      description: p.description,
      skills: p.skills.includes("*") ? "all" : p.skills.length,
      agents: p.agents.includes("*") ? "all" : p.agents.length,
    })),
    evals: raw.profiles.evals.map((e) => e.title),
  },
  ontology,
};

// ── 3. 주인 전용 — 요청 원문이 든 스킬 후보, 저장소 밖 스킬 이름. 키가 있을 때만 암호화해 남긴다
const priv = {
  generated: raw.generated,
  days: raw.days ?? null,
  candidates: raw.candidates,
  otherUsage: { skills: sk.other, agents: ag.other },
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "public.json"), JSON.stringify(pub, null, 1) + "\n");

const keyB64 = env("DASHBOARD_DATA_KEY");
let privFile;
if (keyB64) {
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    console.error("DASHBOARD_DATA_KEY 는 base64 로 32바이트여야 한다. --gen-key 로 새로 만든다.");
    process.exit(1);
  }
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  c.setAAD(AAD);
  const data = Buffer.concat([c.update(JSON.stringify(priv), "utf8"), c.final()]);
  privFile = {
    v: 1,
    alg: "A256GCM",
    generated: pub.generated,
    iv: iv.toString("base64"),
    tag: c.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
} else {
  privFile = { v: 1, status: "empty" };
  console.warn("DASHBOARD_DATA_KEY 가 없어 주인 전용 데이터는 비워 둔다. 키를 만들려면: npm run dashboard:sync -- --gen-key");
}
fs.writeFileSync(path.join(OUT, "private.enc.json"), JSON.stringify(privFile) + "\n");

console.log(
  `public.json — 사용 ${pub.usage.source} · 스킬 ${pub.usage.skills.length}개 · 후보 ${pub.candidates.groups}묶음 · 개념 ${ontology?.concepts ?? 0}개\n` +
    `private.enc.json — ${keyB64 ? "암호화됨" : "비어 있음"}\n` +
    `반영하려면 커밋하고 push 한다.`,
);
