#!/usr/bin/env node
/**
 * 대시보드 숫자 자동 갱신 — Claude Code 세션이 끝날 때 훅이 부른다 (npm run dashboard:setup 이 설치).
 * 2026-10-05 사용자 승인: SessionEnd 훅 등록과 usetaehwan main 자동 push.
 *
 *   작업 폴더는 건드리지 않는다. ~/.claude/skill-audit/usetaehwan-sync 에 따로 둔 사본에서
 *   main 최신을 받고, 데이터 파일 두 개만 갱신해 커밋·push 한다. push 하면 Vercel 이 배포한다.
 *
 *   - 간격: DASHBOARD_AUTO_HOURS 시간에 한 번 (기본 6). --force 로 무시
 *   - 바뀐 게 없으면 커밋하지 않는다
 *   - 동시에 두 번 돌지 않는다
 *   - 실패해도 조용히 끝난다. 기록은 ~/.claude/skill-audit/dashboard-auto.log
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(os.homedir(), ".claude", "skill-audit");
const CLONE = process.env.DASHBOARD_SYNC_CLONE ?? path.join(DIR, "usetaehwan-sync");
const STATE = path.join(DIR, "dashboard-auto.json");
const LOCK = path.join(DIR, "dashboard-auto.lock");
const HOURS = Number(process.env.DASHBOARD_AUTO_HOURS ?? 6);
const FILES = ["app/_data/dashboard/public.json", "public/dashboard-owner.enc.json"];

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const log = (msg) => console.log(`${now()} ${msg}`);
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 180_000 }).trim();
const git = (args, cwd = CLONE) => run("git", args, cwd);

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE, "utf8"));
  } catch {
    return {};
  }
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** 사본이 없으면 만들고, 있으면 origin/main 으로 맞춘다 */
function freshClone() {
  if (!fs.existsSync(path.join(CLONE, ".git"))) {
    const url = git(["remote", "get-url", "origin"], ROOT);
    fs.mkdirSync(path.dirname(CLONE), { recursive: true });
    run("git", ["clone", "--depth", "1", "--branch", "main", url, CLONE], path.dirname(CLONE));
  } else {
    git(["fetch", "--depth", "1", "origin", "main"]);
    git(["reset", "--hard", "origin/main"]);
  }
}

/** 동기화하고, 바뀌었으면 커밋. 커밋했으면 true */
function syncAndCommit() {
  run(process.execPath, [path.join(CLONE, "scripts/dashboard-sync.mjs")], CLONE);
  const present = FILES.filter((f) => fs.existsSync(path.join(CLONE, f)));
  git(["add", "--", ...present]);
  try {
    git(["diff", "--cached", "--quiet"]);
    return false;
  } catch {
    git(["commit", "-m", `대시보드 자동 갱신 · ${now().slice(0, 10)}`, "--", ...present]);
    return true;
  }
}

function main() {
  const force = process.argv.includes("--force");
  fs.mkdirSync(DIR, { recursive: true });
  const state = readState();
  if (!force && state.last && Date.now() - Date.parse(state.last) < HOURS * 3600_000) return;

  if (fs.existsSync(LOCK)) {
    const pid = Number(fs.readFileSync(LOCK, "utf8"));
    if (pid && alive(pid)) return;
  }
  fs.writeFileSync(LOCK, String(process.pid));
  try {
    freshClone();
    if (!syncAndCommit()) {
      log("변화 없음 — 커밋하지 않음");
    } else {
      try {
        git(["push", "origin", "HEAD:main"]);
      } catch {
        // 그사이 main 이 움직였다 — 최신으로 맞추고 한 번만 다시 한다
        freshClone();
        if (syncAndCommit()) git(["push", "origin", "HEAD:main"]);
      }
      log(`push ${git(["rev-parse", "--short", "HEAD"])}`);
    }
    fs.writeFileSync(STATE, JSON.stringify({ last: new Date().toISOString(), ok: true }) + "\n");
  } catch (e) {
    const detail = String(e.stderr || e.message || e).trim().split("\n").slice(-3).join(" / ");
    log(`실패 — ${detail}`);
    fs.writeFileSync(STATE, JSON.stringify({ last: new Date().toISOString(), ok: false, error: detail }) + "\n");
  } finally {
    fs.rmSync(LOCK, { force: true });
  }
}

main();
