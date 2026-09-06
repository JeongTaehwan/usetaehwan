"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { TALKS } from "../../_data/talks";
import { RoomCaption, RoomLabel, SceneFinish } from "../scene/primitives";
import { cn } from "../../_ui/cn";

/** 회의실 — Talks. 프로젝터 화면에 발표 한 편, 옆 벽에 아젠다. 화살표로 슬라이드를 넘긴다. */
export function MeetingRoom() {
  const [i, setI] = useState(0);
  const t = TALKS[i];
  const go = (d: number) => setI((v) => (v + d + TALKS.length) % TALKS.length);

  return (
    <section id="talks" className="relative isolate overflow-hidden bg-wall pt-24 sm:pt-28 lg:min-h-[100svh]">
      <div className="brick absolute inset-0" />
      <div className="floor absolute inset-x-0 bottom-0 h-[30%]" />
      {/* 회의 테이블 */}
      <div className="wood absolute inset-x-[10%] bottom-[10%] h-[12%] shadow-[0_30px_40px_-20px_var(--shadow)] [clip-path:polygon(12%_0,88%_0,100%_100%,0_100%)]" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-[34%] sm:px-8 lg:px-14 lg:pb-[30%]">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <RoomLabel>Talks · The meeting room</RoomLabel>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
          {/* 프로젝터 화면 */}
          <div className="relative border-[6px] border-[#2b2622] bg-[#f7f3ea] shadow-[0_30px_50px_-24px_var(--shadow)]">
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(115deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_60%)]" />
            <div className="relative min-h-[380px] p-7 sm:min-h-[470px] sm:p-12">
              <AnimatePresence mode="wait">
                <motion.div key={t.slug} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="caps text-accent">Talk {String(i + 1).padStart(2, "0")} · {t.venue} · {t.date}</div>
                    <h3 className="myeongjo mt-4 text-[26px] leading-[1.25] text-[#2b2622] sm:text-[40px]">{t.title}</h3>
                    <p className="mt-4 max-w-[560px] text-[14px] leading-[1.7] text-[#5c534a] [word-break:keep-all]">{t.summary}</p>
                  </div>
                  {t.numbers && t.numbers.length > 0 ? (
                    <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-[rgba(43,38,34,0.14)] pt-5">
                      {t.numbers.slice(0, 4).map((n) => (
                        <div key={n.label}><div className="caslon text-[24px] text-[#2b2622] sm:text-[30px]">{n.value}</div><div className="caps mt-1 text-[10px] text-[#8b7f72]">{n.label}</div></div>
                      ))}
                    </div>
                  ) : (
                    <ol className="grid gap-2 border-t border-[rgba(43,38,34,0.14)] pt-5 sm:grid-cols-2">
                      {t.outline.slice(0, 4).map((o, k) => <li key={o} className="flex gap-3 text-[13px] text-[#5c534a]"><span className="caslon text-accent">{String(k + 1).padStart(2, "0")}</span><span className="[word-break:keep-all]">{o}</span></li>)}
                    </ol>
                  )}
                  <div className="flex items-center justify-between">
                    <Link href={`/talks/${t.slug}`} className="caps text-accent hover:underline">발표 문서 →</Link>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => go(-1)} aria-label="이전 발표" className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(43,38,34,0.2)] text-[#2b2622] hover:border-accent hover:text-accent">‹</button>
                      <span className="caps text-[10px] text-[#8b7f72]">{i + 1} / {TALKS.length}</span>
                      <button type="button" onClick={() => go(1)} aria-label="다음 발표" className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(43,38,34,0.2)] text-[#2b2622] hover:border-accent hover:text-accent">›</button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          {/* 아젠다 */}
          <div className="paper p-5">
            <div className="caps text-accent">Agenda</div>
            <ol className="mt-3">
              {TALKS.map((x, k) => (
                <li key={x.slug} className="border-t border-[rgba(43,38,34,0.14)] first:border-t-0">
                  <button type="button" onClick={() => setI(k)} aria-pressed={k === i} className={cn("w-full py-3 text-left", k === i ? "text-[#2b2622]" : "text-[#5c534a]")}>
                    <div className="caps text-[9px] text-[#8b7f72]">{String(k + 1).padStart(2, "0")} · {x.date}</div>
                    <div className="mt-1 text-[13px] leading-[1.5] [word-break:keep-all]">{x.title}</div>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <RoomCaption name="Meeting room" note="Talks · 슬라이드를 넘기면 다음 발표" />
      <SceneFinish />
    </section>
  );
}
