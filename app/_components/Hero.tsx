"use client";

import { motion, type Variants } from "framer-motion";
import { Label } from "../_ui/Label";
import { Dim } from "../_ui/Dim";
import { Stamp } from "../_ui/Stamp";
import { Btn } from "../_ui/Btn";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/* 표지 우측 스펙표 — 본문 Experience·Projects에 적힌 실측치만 옮겨 적는다 */
const SPEC = [
  { k: "Merge requests", v: "361", note: "신규 쇼핑몰 웹앱 · 화면 244 / 코어 117" },
  { k: "Unit tests", v: "759", note: "앱·웹 공유 코어 패키지" },
  { k: "Coverage", v: "42.0 → 69.3 %", note: "코어 패키지 단위 테스트" },
  { k: "Acceptance tests", v: "109", note: "각(Gak) · 검증 AI가 요구사항에서 추출" },
];

export function Hero() {
  return (
    <section id="top" className="pt-10 sm:pt-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12">
        <motion.div variants={container} initial="hidden" animate="show" className="sheet">
          {/* 도면 테두리 존 마커 — 위 A–F, 왼쪽 1–4 */}
          <div aria-hidden className="zones zones-x hidden md:flex">
            {["A", "B", "C", "D", "E", "F"].map((z) => (
              <span key={z}>{z}</span>
            ))}
          </div>
          <div aria-hidden className="zones zones-y hidden md:flex">
            {["1", "2", "3", "4"].map((z) => (
              <span key={z}>{z}</span>
            ))}
          </div>
          {/* 표지 상단 띠 */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-5 py-3 sm:px-8"
          >
            <Label>Drawing no. UT-2026-01</Label>
            <Label className="hidden sm:block">Sheet 00 · Cover</Label>
            <Label className="hidden md:block">Scale 1:1</Label>
            <Label>Seoul, KR</Label>
          </motion.div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
            {/* 좌: 제목 */}
            <div className="min-w-0">
              <motion.div variants={item} className="flex items-center gap-3">
                <Stamp>Rev 2.0 · 2026.09</Stamp>
              </motion.div>

              <h1 className="display mt-8 text-[3.4rem] leading-[0.92] sm:text-7xl lg:text-8xl">
                <motion.span variants={item} className="block">
                  Frontend
                </motion.span>
                <motion.span variants={item} className="block">
                  engineer,
                </motion.span>
                <motion.span variants={item} className="block text-mark">
                  drafted.
                </motion.span>
              </h1>

              <motion.div variants={item} className="mt-6 max-w-md">
                <Dim>3 yrs 10 mo · commerce frontend · payments · settlement</Dim>
              </motion.div>

              <motion.p variants={item} className="prose-draft mt-8 max-w-xl text-ink">
                구조를 먼저 그리고, 숫자로 확인하고, 문서로 남기는 프론트엔드 개발자 정태환입니다.
                결제·정산·쿠폰처럼 틀리면 조용히 손해가 나는 도메인을 다뤄 왔고, AI는 절차 안에
                두고 씁니다 — 역할을 나누고, 결과를 코드로 검증하고, 체감 대신 측정값으로
                판단합니다.
              </motion.p>

              <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
                <Btn href="#projects" variant="solid">
                  Sheet 04 · Projects
                </Btn>
                <Btn href="#contact">Sheet 06 · Contact</Btn>
              </motion.div>
            </div>

            {/* 우: 스펙표 */}
            <motion.aside variants={item} className="min-w-0 lg:border-l lg:border-line lg:pl-8">
              <div className="flex items-baseline justify-between">
                <Label>Specification</Label>
                <Label mark>measured</Label>
              </div>
              <dl className="mt-3 divide-y divide-line-soft border-y border-line">
                {SPEC.map((s) => (
                  <div key={s.k} className="py-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <Label as="dt">{s.k}</Label>
                      <dd className="figure-no text-xl">{s.v}</dd>
                    </div>
                    <p className="mt-1 text-xs text-ink-3">{s.note}</p>
                  </div>
                ))}
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="border border-line p-2">
                  <Label>Drawn by</Label>
                  <div className="mt-1 font-mono text-xs text-ink">Taehwan Jeong</div>
                </div>
                <div className="border border-line p-2">
                  <Label>Position</Label>
                  <div className="mt-1 font-mono text-xs text-ink">Frontend, 4th yr</div>
                </div>
              </div>
            </motion.aside>
          </div>

          {/* 표지 하단 띠 — 시트 목차 */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line px-5 py-2.5 sm:px-8"
          >
            <Label>Index</Label>
            {[
              ["01", "About"],
              ["02", "Experience"],
              ["03", "Background"],
              ["04", "Projects"],
              ["05", "AI Notes"],
              ["06", "Contact"],
            ].map(([no, label]) => (
              <a
                key={no}
                href={`#${label.toLowerCase().replace(" notes", "")}`}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3 transition-colors hover:text-mark"
              >
                {no} {label}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
