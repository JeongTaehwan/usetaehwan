"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PRACTICES } from "../../_data/ai-practices";
import { RoomCaption, SceneFinish } from "../scene/primitives";
import { cn } from "../../_ui/cn";

/** 수첩 — AI Notes. 왼쪽 목차를 누르면 오른쪽 페이지가 넘어간다. */
export function Notebook() {
  const [i, setI] = useState(0);
  const n = PRACTICES[i];
  return (
    <section id="ai" className="relative isolate overflow-hidden pt-24 sm:pt-28 lg:min-h-[100svh]">
      <div className="wood-dark absolute inset-0 [background:linear-gradient(160deg,var(--color-wood)_0%,var(--color-wood-2)_60%,var(--color-wood-3)_100%)]" />
      <div className="sunbeam left-[14%] top-[-10%] h-[120%] w-[40%]" />
      <div className="lampglow" style={{ ["--lamp-x" as string]: "80%", ["--lamp-y" as string]: "12%" }} />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 sm:px-8 lg:px-14 lg:pb-32">
        <div className="mx-auto grid max-w-[1060px] shadow-[0_40px_60px_-24px_var(--shadow)] lg:grid-cols-2">
          {/* 왼쪽 페이지 — 목차 */}
          <div className="relative rounded-t-lg bg-[#f8f2e6] p-7 shadow-[inset_-22px_0_28px_-24px_rgba(0,0,0,0.4)] sm:p-11 lg:rounded-l-lg lg:rounded-tr-none">
            <div className="caps text-accent">General notes · AI를 통제 대상으로</div>
            <h2 className="myeongjo mt-3 text-[24px] leading-[1.3] text-[#2b2622] sm:text-[26px]">코드 생성기가 아니라<br />절차 안에 두는 것.</h2>
            <p className="mt-3 text-[13.5px] leading-[1.7] text-[#5c534a] [word-break:keep-all]">역할을 나누고, 환각을 코드로 막고, 테스트의 정답을 먼저 고정하고, 체감 대신 숫자로 판단한 기록 네 편. 실측한 값만 씁니다.</p>
            <ol className="mt-6">
              {PRACTICES.map((p, k) => (
                <li key={p.slug} className="border-t border-[rgba(43,38,34,0.14)]">
                  <button type="button" onClick={() => setI(k)} aria-pressed={k === i} className={cn("flex w-full items-baseline gap-4 py-3.5 text-left transition-colors", k === i ? "text-[#2b2622]" : "text-[#5c534a] hover:text-[#2b2622]")}>
                    <span className="caslon w-7 shrink-0 text-[14px] text-accent">{k + 1}.</span>
                    <span className="flex-1 text-[14px] leading-[1.5] [word-break:keep-all]">{p.title}</span>
                    <span className="caslon text-[16px]">{p.stat.value}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          {/* 오른쪽 페이지 — 노트 */}
          <div className="relative min-h-[520px] rounded-b-lg bg-[#f8f2e6] p-7 shadow-[inset_22px_0_28px_-24px_rgba(0,0,0,0.4)] sm:p-11 lg:rounded-r-lg lg:rounded-bl-none">
            <div className="absolute -top-1.5 right-6 h-[200px] w-[18px] bg-accent [clip-path:polygon(0_0,100%_0,100%_100%,50%_88%,0_100%)]" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div key={n.slug} initial={{ opacity: 0, rotateY: -12, x: 20 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 12, x: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex h-full flex-col gap-4 [transform-origin:left_center]">
                <div className="caps text-[#8b7f72]">Note {i + 1} of {PRACTICES.length}</div>
                <h3 className="myeongjo max-w-[380px] text-[24px] leading-[1.3] text-[#2b2622] sm:text-[30px]">{n.title}</h3>
                <p className="text-[14px] leading-[1.75] text-[#5c534a] [word-break:keep-all]">{n.summary}</p>
                <blockquote className="caslon border-y border-[rgba(43,38,34,0.14)] py-3.5 text-[18px] italic leading-[1.5] text-[#2b2622] sm:text-[20px]">“{n.keyRule}”</blockquote>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                  <div className="flex items-baseline gap-4"><span className="caslon text-[56px] leading-none text-[#2b2622] sm:text-[64px]">{n.stat.value}</span><span className="max-w-[200px] text-[12px] leading-[1.5] text-[#8b7f72] [word-break:keep-all]">{n.stat.label}</span></div>
                  <Link href={`/ai/${n.slug}`} className="caps text-accent hover:underline">읽기 →</Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <RoomCaption name="Notebook" note="AI notes · 목차를 누르면 페이지가 넘어간다" />
      <SceneFinish />
    </section>
  );
}
