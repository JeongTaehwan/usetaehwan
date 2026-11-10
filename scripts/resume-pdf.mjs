/**
 * /resume 를 A4 PDF로 출력한다 — Playwright(Chromium).
 * 실행: 서버를 띄운 뒤 `npm run resume:pdf [-- <url> <출력 경로>] [--variant=<이름>]`
 *   기본 url: http://localhost:3000/resume · 기본 출력: ./정태환_이력서_포트폴리오.pdf
 *   --variant: scripts/resume-variants.mts(로컬 전용, git 제외) 의 지원처별 버전 — 출력 직전에 DOM 에서 부제·소개·경력 순서(일부 생략 가능)·대표 링크만 바꾼다.
 *     기본 출력은 ./정태환_이력서_<회사>.pdf. 없으면 페이지를 그대로 찍는다.
 * 출력 전에 쪽마다 넘친 글자가 없는지 DOM으로 확인하고, 하나라도 넘치면 실패한다.
 */
import { chromium } from "playwright";
import { statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const variantName = args.find((a) => a.startsWith("--variant="))?.slice("--variant=".length);
const [urlArg, outArg] = args.filter((a) => !a.startsWith("--variant="));
// 지원처 이름이 담긴 파일이라 저장소에 올리지 않는다 — --variant 를 줄 때만 읽는다.
const VARIANTS = variantName === undefined ? {} : (await import("./resume-variants.mts")).VARIANTS;
const variant = variantName === undefined ? undefined : VARIANTS[variantName];
if (variantName !== undefined && !variant) {
  console.error(`알 수 없는 variant: ${variantName} (가능: ${Object.keys(VARIANTS).join(", ")})`);
  process.exit(1);
}

const url = urlArg ?? "http://localhost:3000/resume";
const out = path.resolve(outArg ?? (variant ? `정태환_이력서_${variant.company}.pdf` : "정태환_이력서_포트폴리오.pdf"));

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  if (variant) {
    const result = await page.evaluate(({ subtitle, intro, jobs, link }) => {
      const first = document.querySelector(".sheet");
      const sub = first?.querySelector("header > div > p");
      const summary = document.getElementById("summary");
      const contacts = first?.querySelector("header ul");
      const list = document.querySelector("ol[data-jobs]");
      if (!sub || !summary || !contacts || !list) return { problem: "부제·소개·연락처·경력 목록을 찾지 못했습니다" };

      // 경력 — 제목(번호 span 제외)으로 찾아 새 순서로 다시 꽂는다. 설정에 없는 경력은 뺀다
      const items = new Map(
        [...list.children].map((li) => {
          const h3 = li.querySelector("h3");
          return [[...h3.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("").trim(), li];
        }),
      );
      const unknown = jobs.filter((t) => !items.has(t));
      if (unknown.length || new Set(jobs).size !== jobs.length)
        return { problem: `경력 제목이 맞지 않습니다 — 페이지에 없는 제목: ${unknown.join(" / ") || "없음"} (중복도 안 됩니다)` };
      const dropped = [...items.keys()].filter((t) => !jobs.includes(t));
      dropped.forEach((t) => items.get(t).remove());
      jobs.forEach((t, i) => {
        const li = items.get(t);
        li.querySelector("h3 > span").textContent = String(i + 1);
        list.appendChild(li);
      });

      sub.textContent = subtitle;
      summary.textContent = intro;

      // 대표 링크 — 이미 연락처에 같은 주소가 있으면 덧붙이지 않는다
      const same = (a, b) => new URL(a).href === new URL(b).href;
      if (link && ![...contacts.querySelectorAll("a")].some((a) => same(a.href, link.href))) {
        const li = contacts.lastElementChild.cloneNode(true);
        const a = li.querySelector("a");
        a.href = link.href;
        a.textContent = link.label;
        contacts.appendChild(li);
      }
      return { problem: null, dropped };
    }, variant);
    if (result.problem) {
      console.error(result.problem);
      process.exit(1);
    }
    if (result.dropped.length) console.log(`이 버전에서 뺀 경력: ${result.dropped.join(" / ")}`);
  }

  // 쪽마다: 본문 요소가 종이 안쪽 여백(아래 16mm — 쪽 번호 자리) 밖으로 나가거나 가로로 넘치면 실패
  const problems = await page.evaluate(() => {
    const mm = 96 / 25.4;
    return [...document.querySelectorAll(".sheet")].flatMap((sheet, i) => {
      const box = sheet.getBoundingClientRect();
      const limitBottom = box.bottom - 16 * mm + 1;
      const limitRight = box.right - 15 * mm + 1;
      const issues = [];
      for (const el of sheet.querySelectorAll("*")) {
        if (el.closest(".sheet-foot")) continue;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.bottom > limitBottom) issues.push(`${i + 1}쪽 아래로 넘침: "${(el.textContent ?? "").trim().slice(0, 40)}"`);
        else if (r.right > limitRight) issues.push(`${i + 1}쪽 오른쪽으로 넘침: "${(el.textContent ?? "").trim().slice(0, 40)}"`);
        const st = getComputedStyle(el);
        if (el.scrollWidth > el.clientWidth + 1 && st.overflowX !== "visible") issues.push(`${i + 1}쪽 가로 잘림: "${(el.textContent ?? "").trim().slice(0, 40)}"`);
        if (el.scrollHeight > el.clientHeight + 1 && st.overflowY !== "visible") issues.push(`${i + 1}쪽 세로 잘림: "${(el.textContent ?? "").trim().slice(0, 40)}"`);
      }
      return issues.slice(0, 3);
    });
  });
  const sheets = await page.locator(".sheet").count();
  if (problems.length) {
    console.error("넘친 글자가 있습니다:\n" + problems.join("\n"));
    process.exitCode = 1;
  } else {
    await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
    console.log(`쪽 ${sheets}개 · ${out} · ${(statSync(out).size / 1024).toFixed(0)}KB`);
  }
} finally {
  await browser.close();
}
