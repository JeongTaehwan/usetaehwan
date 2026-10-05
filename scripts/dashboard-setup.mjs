#!/usr/bin/env node
/**
 * 대시보드 자동화 설치 — PC 에서 한 번만 돌린다.
 * 2026-10-05 사용자 승인: SessionEnd 훅 등록과 usetaehwan main 자동 push.
 *
 *   npm run dashboard:setup                 설치하고 바로 한 번 갱신·push, 주인 링크를 보여준다
 *   npm run dashboard:setup -- --uninstall  훅을 뗀다 (주인 키는 남긴다)
 *
 * 하는 일
 *   1. 주인 키를 만든다          ~/.claude/skill-audit/dashboard.key (이 PC 밖으로 나가지 않는다)
 *   2. SessionEnd 훅을 깐다      ~/.claude/hooks/usetaehwan-dashboard.sh + ~/.claude/settings.json 등록
 *   3. 지금 한 번 갱신한다       scripts/dashboard-auto.mjs --force
 *   4. 주인 링크를 보여준다      기기마다 한 번 열면 그 브라우저가 기억한다
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KEY_FILE, readKey } from "./dashboard-sync.mjs";

const SITE = "https://usetaehwan.page";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLAUDE = path.join(os.homedir(), ".claude");
const HOOK = path.join(CLAUDE, "hooks", "usetaehwan-dashboard.sh");
const SETTINGS = path.join(CLAUDE, "settings.json");
const HOOK_CMD = '"$HOME"/.claude/hooks/usetaehwan-dashboard.sh';
const MARK = "usetaehwan-dashboard.sh";

const sh = (s) => `'${s.replace(/'/g, `'\\''`)}'`;
const ours = (h) => String(h.command ?? "").includes(MARK);

function readSettings() {
  if (!fs.existsSync(SETTINGS)) return {};
  try {
    return JSON.parse(fs.readFileSync(SETTINGS, "utf8"));
  } catch {
    console.error(`${SETTINGS} 가 올바른 JSON 이 아니라 건드리지 않았다. 고친 뒤 다시 실행한다.`);
    process.exit(1);
  }
}

function writeSettings(s) {
  if (fs.existsSync(SETTINGS)) fs.copyFileSync(SETTINGS, `${SETTINGS}.bak`);
  fs.mkdirSync(CLAUDE, { recursive: true });
  fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + "\n");
}

if (process.argv.includes("--uninstall")) {
  const s = readSettings();
  if (s.hooks?.SessionEnd) {
    s.hooks.SessionEnd = s.hooks.SessionEnd.map((g) => ({ ...g, hooks: (g.hooks ?? []).filter((h) => !ours(h)) })).filter((g) => g.hooks.length);
    if (!s.hooks.SessionEnd.length) delete s.hooks.SessionEnd;
    writeSettings(s);
  }
  fs.rmSync(HOOK, { force: true });
  console.log(`훅을 뗐다. 주인 키는 남겨 뒀다: ${KEY_FILE}`);
  process.exit(0);
}

console.log("대시보드 자동화 설치\n");
const fail = (msg) => {
  console.error(`  ✗ ${msg}`);
  process.exit(1);
};
try {
  execFileSync(process.env.PYTHON ?? "python3", ["--version"], { stdio: "ignore" });
} catch {
  fail("python3 가 필요하다");
}
try {
  execFileSync("git", ["-C", ROOT, "remote", "get-url", "origin"], { stdio: "ignore" });
} catch {
  fail("이 폴더에 origin 원격이 없다");
}
const skills = [process.env.CLAUDE_SKILLS_DIR, path.join(ROOT, "../claude-skills"), path.join(os.homedir(), "workspace/claude-skills"), path.join(os.homedir(), "claude-skills")]
  .filter(Boolean)
  .map((p) => path.resolve(ROOT, p))
  .find((p) => fs.existsSync(path.join(p, "scripts/dashboard.py")));
if (!skills) fail("claude-skills 를 찾지 못했다 — ~/workspace/claude-skills 에 두거나 CLAUDE_SKILLS_DIR 를 준다");
console.log(`  ✓ claude-skills ${skills}`);

let key = readKey();
if (!key) {
  key = randomBytes(32);
  fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
  fs.writeFileSync(KEY_FILE, key.toString("base64url") + "\n", { mode: 0o600 });
}
console.log(`  ✓ 주인 키 ${KEY_FILE}`);

fs.mkdirSync(path.dirname(HOOK), { recursive: true });
fs.writeFileSync(
  HOOK,
  `#!/bin/sh
# SessionEnd 훅 — usetaehwan.page 대시보드 숫자를 자동으로 갱신한다 (npm run dashboard:setup 이 설치).
# 세션 종료를 막지 않게 뒤에서 돌리고, 어떤 경우에도 조용히 exit 0 한다. 간격·중복 판단은 dashboard-auto.mjs 가 한다.
cat > /dev/null 2>&1
REPO=${sh(ROOT)}
NODE=${sh(process.execPath)}
CLAUDE_SKILLS_DIR=${sh(skills)}; export CLAUDE_SKILLS_DIR
LOG="$HOME/.claude/skill-audit/dashboard-auto.log"
[ -f "$REPO/scripts/dashboard-auto.mjs" ] || exit 0
[ -x "$NODE" ] || NODE=node
mkdir -p "$HOME/.claude/skill-audit"
nohup "$NODE" "$REPO/scripts/dashboard-auto.mjs" >> "$LOG" 2>&1 < /dev/null &
exit 0
`,
  { mode: 0o755 },
);
console.log(`  ✓ 훅 파일 ${HOOK}`);

const s = readSettings();
s.hooks ??= {};
if (!(s.hooks.SessionEnd ?? []).some((g) => (g.hooks ?? []).some(ours))) {
  s.hooks.SessionEnd = [...(s.hooks.SessionEnd ?? []), { matcher: "*", hooks: [{ type: "command", command: HOOK_CMD, timeout: 10 }] }];
  writeSettings(s);
  console.log(`  ✓ ${SETTINGS} 에 SessionEnd 훅 등록 (이전 파일은 settings.json.bak)`);
} else {
  console.log("  ✓ SessionEnd 훅은 이미 등록돼 있다");
}

console.log("\n지금 한 번 갱신한다…");
try {
  process.stdout.write(
    execFileSync(process.execPath, [path.join(ROOT, "scripts/dashboard-auto.mjs"), "--force"], {
      encoding: "utf8",
      env: { ...process.env, CLAUDE_SKILLS_DIR: skills },
    }),
  );
} catch (e) {
  console.error("첫 갱신이 실패했다:", String(e.stderr || e.message).trim());
}
try {
  const st = JSON.parse(fs.readFileSync(path.join(CLAUDE, "skill-audit", "dashboard-auto.json"), "utf8"));
  if (st.ok === false) console.error(`  ✗ ${st.error}`);
} catch {}

console.log(`
끝. 이제 Claude Code 세션이 끝날 때마다(${process.env.DASHBOARD_AUTO_HOURS ?? 6}시간에 한 번까지) 숫자가 알아서 올라간다.
기록: ~/.claude/skill-audit/dashboard-auto.log

주인 링크 — 기기마다 한 번 열면 그 브라우저가 기억한다. 비밀번호처럼 다룬다:

  ${SITE}/dashboard#k=${key.toString("base64url")}

다시 보려면: npm run dashboard:sync -- --link`);
