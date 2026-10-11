#!/usr/bin/env node
/**
 * claude-skills 대시보드 데이터를 사이트로 옮긴다. 기록이 있는 PC 에서 직접 돌린다.
 *
 *   npm run dashboard:sync                    # 전체 기간
 *   npm run dashboard:sync -- --days 30       # 최근 30일
 *   npm run dashboard:sync -- --gen-key       # 주인 키를 만들고 주인 링크를 보여준다 (처음 한 번)
 *   npm run dashboard:sync -- --link          # 주인 링크를 다시 보여준다
 *
 * 만드는 파일
 *   app/_data/dashboard/public.json     누구나 보는 숫자 — 요청 원문·저장소 밖 스킬 이름은 넣지 않는다
 *   public/dashboard-owner.enc.json     주인 전용 — 256비트 무작위 키로 AES-256-GCM 암호화.
 *                                       브라우저가 주인 키로 직접 푼다. 서버에는 비밀값이 없다
 *
 * 내용이 그대로면(동기화 날짜만 다르면) 파일을 다시 쓰지 않는다 — 자동 실행이 빈 커밋을 만들지 않게.
 *
 * 주인 키:      DASHBOARD_KEY 환경 변수 → ~/.claude/skill-audit/dashboard.key
 * claude-skills: CLAUDE_SKILLS_DIR → ../claude-skills → ~/workspace/claude-skills → ~/claude-skills
 */
import { execFileSync } from "node:child_process";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const AAD = "usetaehwan-dashboard-v1";
export const KEY_FILE = path.join(os.homedir(), ".claude", "skill-audit", "dashboard.key");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_OUT = path.join(ROOT, "app/_data/dashboard/public.json");
const OWNER_OUT = path.join(ROOT, "public/dashboard-owner.enc.json");

export function readKey() {
  const raw = (process.env.DASHBOARD_KEY ?? (fs.existsSync(KEY_FILE) ? fs.readFileSync(KEY_FILE, "utf8") : "")).trim();
  if (!raw) return null;
  const key = Buffer.from(raw, "base64url");
  if (key.length !== 32) throw new Error(`주인 키는 32바이트여야 한다 (${KEY_FILE})`);
  return key;
}

export function encrypt(key, obj, generated) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  c.setAAD(Buffer.from(AAD));
  const data = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final(), c.getAuthTag()]);
  return { v: 2, alg: "A256GCM", generated, iv: iv.toString("base64"), data: data.toString("base64") };
}

export function decrypt(key, file) {
  const buf = Buffer.from(file.data, "base64");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(file.iv, "base64"));
  d.setAAD(Buffer.from(AAD));
  d.setAuthTag(buf.subarray(buf.length - 16));
  return JSON.parse(Buffer.concat([d.update(buf.subarray(0, buf.length - 16)), d.final()]).toString("utf8"));
}

function findSkillsDir(arg) {
  const home = os.homedir();
  const tries = [arg, process.env.CLAUDE_SKILLS_DIR, path.join(ROOT, "../claude-skills"), path.join(home, "workspace/claude-skills"), path.join(home, "claude-skills")];
  return tries.filter(Boolean).map((p) => path.resolve(ROOT, p)).find((p) => fs.existsSync(path.join(p, "scripts/dashboard.py")));
}

/** generated 를 뺀 내용이 같은가 */
const sameExceptDate = (a, b) => JSON.stringify({ ...a, generated: "" }) === JSON.stringify({ ...b, generated: "" });
const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

const SITE = "https://usetaehwan.page";
const ownerLink = (key) => `${SITE}/dashboard#k=${key.toString("base64url")}`;

function main() {
  const argv = process.argv.slice(2);
  const arg = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);

  if (argv.includes("--gen-key") || argv.includes("--link")) {
    let key = readKey();
    if (!key && argv.includes("--gen-key")) {
      key = randomBytes(32);
      fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
      fs.writeFileSync(KEY_FILE, key.toString("base64url") + "\n", { mode: 0o600 });
      console.log(`주인 키를 만들었다: ${KEY_FILE}`);
    }
    if (!key) {
      console.error("주인 키가 없다. npm run dashboard:sync -- --gen-key 로 만든다.");
      process.exit(1);
    }
    console.log(`\n주인 링크 — 기기마다 한 번 열면 그 브라우저가 기억한다. 비밀번호처럼 다룬다:\n\n  ${ownerLink(key)}\n`);
    return;
  }

  // ── 1. claude-skills 의 collect() 를 그대로 부른다 — 판정 로직을 두 벌로 만들지 않는다
  const skillsDir = findSkillsDir(arg("--skills"));
  if (!skillsDir) {
    console.error("claude-skills 를 찾지 못했다. CLAUDE_SKILLS_DIR 를 주거나 --skills <경로> 로 알려준다.");
    process.exit(1);
  }
  const days = Number(arg("--days") ?? 0);
  const PY = `import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("dashboard", sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
d = int(sys.argv[2])
print(json.dumps(m.collect(d or None, False), ensure_ascii=False))`;
  const raw = JSON.parse(
    execFileSync(process.env.PYTHON ?? "python3", ["-c", PY, path.join(skillsDir, "scripts/dashboard.py"), String(days)], {
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

  // ── 3. 주인 전용 — 요청 원문이 든 스킬 후보, 저장소 밖 스킬 이름
  const priv = {
    generated: raw.generated,
    days: raw.days ?? null,
    candidates: raw.candidates,
    otherUsage: { skills: sk.other, agents: ag.other },
  };

  const changed = [];
  const oldPub = readJson(PUBLIC_OUT);
  if (!oldPub || !sameExceptDate(oldPub, pub)) {
    fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
    fs.writeFileSync(PUBLIC_OUT, JSON.stringify(pub, null, 1) + "\n");
    changed.push("public.json");
  }

  const key = readKey();
  if (key) {
    const oldFile = readJson(OWNER_OUT);
    let same = false;
    if (oldFile?.data) {
      try {
        same = sameExceptDate(decrypt(key, oldFile), priv);
      } catch {
        same = false; // 다른 키로 만든 파일 — 새 키로 다시 쓴다
      }
    }
    if (!same) {
      fs.mkdirSync(path.dirname(OWNER_OUT), { recursive: true });
      fs.writeFileSync(OWNER_OUT, JSON.stringify(encrypt(key, priv, pub.generated)) + "\n");
      changed.push("dashboard-owner.enc.json");
    }
  }

  console.log(
    `[dashboard-sync] 사용 ${pub.usage.source} · 스킬 ${pub.usage.skills.length}개 · 후보 ${pub.candidates.groups}묶음 · ` +
      (key ? "주인 데이터 암호화" : "주인 키 없음 — 공개본만") +
      ` · ${changed.length ? `바뀜: ${changed.join(", ")}` : "바뀐 것 없음"}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
