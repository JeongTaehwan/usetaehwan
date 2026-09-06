"use client";

import { useState } from "react";
import { COMPANY, EXPERIENCE, EDUCATION, CERTIFICATIONS } from "../../_data/experience";
import { RoomCaption, RoomLabel, SceneFinish, Skyline as SkylineSvg } from "../scene/primitives";
import { cn } from "../../_ui/cn";

const START = 2022 * 12 + 9; // 2022-10
const MONTHS = 48;
const MAX_MR = Math.max(...EXPERIENCE.map((e) => e.mr));
const ym = (s: string) => { const [y, m] = s.split("-").map(Number); return y * 12 + (m - 1); };

/**
 * 스카이라인 — Experience. 창밖 건물 하나가 한 시기: x = 시작 시점, 폭 = 기간, 높이 = 머지된 MR 수.
 * 건물을 고르면 창에 불이 켜지고(Evening) 옆 카드에 그 기록이 열린다. 좁은 화면은 아래 목록.
 */
export function Skyline() {
  const [sel, setSel] = useState(0);
  const cur = EXPERIENCE[sel];
  const bldg = EXPERIENCE.map((e, i) => {
    const x0 = ((ym(e.start) - START) / MONTHS) * 100;
    const x1 = ((ym(e.end) - START) / MONTHS) * 100;
    const h = 12 + (e.mr / MAX_MR) * 78;
    const bg = i === 5; // 어드민 — 3년 넘게 이어지는 뒤쪽 낮은 건물
    return { e, i, left: x0, width: x1 - x0, height: h, bg };
  });

  return (
    <section id="experience" className="relative isolate overflow-hidden bg-wall pt-24 sm:pt-28 lg:min-h-[100svh]">
      <div className="brick absolute inset-0" />
      <div className="floor absolute inset-x-0 bottom-0 h-[14%]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-[18%] sm:px-8 lg:px-14 lg:pb-[16%]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          {/* 창 */}
          <div>
            <RoomLabel>Experience · The skyline</RoomLabel>
            <h2 className="myeongjo mt-4 text-[28px] leading-[1.25] text-ink sm:text-[34px]">창밖의 건물 하나가<br className="sm:hidden" /> 한 시기입니다.</h2>
            <p className="mt-3 text-[13.5px] leading-[1.7] text-ink-2 [word-break:keep-all]">가로축은 시간, 건물의 폭은 그 일을 맡은 기간, 높이는 머지된 MR 수. 겹쳐 선 건물은 같은 시기에 병행한 일입니다.</p>

            <div className="relative mt-8 aspect-[1320/560] w-full bg-wood-3 p-[10px] shadow-[inset_0_0_60px_rgba(0,0,0,0.25)]">
              <div className="glass relative h-full w-full overflow-hidden">
                <SkylineSvg className="absolute inset-x-0 bottom-0 h-[24%] opacity-30 blur-[2px]" />
                <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-transparent to-[rgba(40,30,25,0.45)]" />
                {/* 건물 */}
                <div className="absolute inset-x-[4%] bottom-0 top-0">
                  {bldg.map(({ e, i, left, width, height, bg }) => {
                    const on = sel === i;
                    return (
                      <button
                        key={e.title}
                        type="button"
                        onMouseEnter={() => setSel(i)}
                        onFocus={() => setSel(i)}
                        onClick={() => setSel(i)}
                        aria-pressed={on}
                        aria-label={`${e.title} · MR ${e.mr}`}
                        className={cn("group absolute bottom-0 transition-[opacity,filter] duration-300", bg ? "opacity-30" : "opacity-90", on && "opacity-100")}
                        style={{ left: `${left}%`, width: `${width}%`, height: `${height}%`, background: e.color, zIndex: bg ? 1 : 2 + i, boxShadow: on ? `0 0 0 2px var(--color-brass), -8px 0 20px rgba(0,0,0,0.15)` : "-8px 0 20px rgba(0,0,0,0.15)" }}
                      >
                        {/* 창 불빛: Evening이거나 선택됐을 때 */}
                        <span
                          aria-hidden
                          className={cn("absolute inset-[10%_8%] transition-opacity duration-500", on ? "opacity-100" : "opacity-[calc(var(--window-light)*0.9)]")}
                          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,220,150,0.55) 0 5px, transparent 5px 18px), repeating-linear-gradient(90deg, rgba(255,220,150,0.55) 0 5px, transparent 5px 18px)" }}
                        />
                        <span className={cn("caps absolute left-0 hidden whitespace-nowrap text-[9px] md:block", bg ? "left-2 top-2 text-[#fbf6ec]" : ["-top-6", "-top-11", "-top-16"][i % 3] + " text-ink")}>{e.title.split(" — ")[0].split(" · ")[0]} · MR {e.mr}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="absolute inset-y-0 left-1/2 w-[12px] -translate-x-1/2 bg-wood-3" />
                <div className="absolute inset-x-0 top-[38%] h-[12px] bg-wood-3" />
              </div>
              {/* 연도 눈금 */}
              <div className="caps absolute -bottom-6 left-[4%] right-[4%] flex justify-between text-[10px] text-muted" aria-hidden>
                {[2023, 2024, 2025, 2026].map((y) => <span key={y} style={{ position: "absolute", left: `${((y * 12 - START) / MONTHS) * 100}%` }}>{y}</span>)}
              </div>
            </div>
          </div>

          {/* 기록 카드 */}
          <div className="paper relative self-start p-6 sm:p-7 lg:mt-24" aria-live="polite">
            <div className="caps text-accent">{cur.period} · MR {cur.mr}</div>
            <h3 className="myeongjo mt-2 text-[18px] leading-[1.4] text-[#2b2622]">{cur.title}</h3>
            <p className="mt-3 text-[13.5px] leading-[1.75] text-[#5c534a] [word-break:keep-all]">{cur.summary}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">{cur.dims.map((d) => <span key={d} className="caps text-[9px] text-[#8b7f72]">{d}</span>)}</div>
            <div className="caps mt-5 border-t border-[rgba(43,38,34,0.14)] pt-3 text-[9px] text-[#8b7f72]">{COMPANY}</div>
          </div>
        </div>

        {/* 목록(모바일) + 학력·자격 */}
        <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ol className="md:hidden">
            {EXPERIENCE.map((e, i) => (
              <li key={e.title}>
                <button type="button" onClick={() => setSel(i)} aria-pressed={sel === i} className={cn("flex w-full items-center gap-3 border-t border-line py-3 text-left", sel === i && "text-ink")}>
                  <span className="h-[10px] w-[10px] shrink-0" style={{ background: e.color }} />
                  <span className="flex-1 text-[13px] text-ink">{e.title}</span>
                  <span className="caslon text-[13px] text-ink">MR {e.mr}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <RoomLabel>Education</RoomLabel>
              <ol className="mt-3 divide-y divide-line border-y border-line">
                {EDUCATION.map((e) => (
                  <li key={e.school} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4"><span className="myeongjo text-[16px] text-ink">{e.school}</span><span className="caps text-[9px] text-muted">{e.period}</span></div>
                    <div className="mt-1 text-[13px] text-ink-2">{e.program}{e.credential ? ` · ${e.credential}` : ""}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <RoomLabel>Certifications</RoomLabel>
              <ol className="mt-3 divide-y divide-line border-y border-line">
                {CERTIFICATIONS.map((c) => (
                  <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-4 py-4">
                    <span className="myeongjo text-[16px] text-ink">{c.name}</span>
                    <span className="caps text-[9px] text-muted">{c.code ? `${c.code} · ` : ""}{c.date}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      <RoomCaption name="Skyline" note="Experience · x = 시작 · 폭 = 기간 · 높이 = 머지된 MR" />
      <SceneFinish />
    </section>
  );
}
