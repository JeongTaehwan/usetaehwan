/**
 * /resume 를 A4 PDF로 출력한다 — Playwright(Chromium).
 * 실행: 서버를 띄운 뒤 `npm run resume:pdf [-- <url> <출력 경로>]`
 *   기본 url: http://localhost:3000/resume · 기본 출력: ./정태환_이력서_포트폴리오.pdf
 * 출력 전에 쪽마다 넘친 글자가 없는지 DOM으로 확인하고, 하나라도 넘치면 실패한다.
 */
import { chromium } from "playwright";
import { statSync } from "node:fs";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3000/resume";
const out = path.resolve(process.argv[3] ?? "정태환_이력서_포트폴리오.pdf");

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

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
