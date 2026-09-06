"use client";

import { useEffect, useState } from "react";
import { cn } from "../_ui/cn";
import { ThemeToggle } from "./ThemeToggle";
import { setCrosshair, useCrosshair, useMounted } from "../_ui/palette";

export const SHEETS = [
  { id: "about", no: "01", label: "About" },
  { id: "experience", no: "02", label: "Experience" },
  { id: "background", no: "03", label: "Background" },
  { id: "projects", no: "04", label: "Projects" },
  { id: "ai", no: "05", label: "AI Notes" },
  { id: "contact", no: "06", label: "Contact" },
];

const BLOG_URL = "https://taepuwan.tistory.com/";
const GITHUB_URL = "https://github.com/JeongTaehwan";

/** 뷰포트 중앙 밴드에 걸린 섹션 id를 추적하는 스크롤 스파이 */
function useActiveSheet(ids: string[]): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const IDS = SHEETS.map((s) => s.id);

/**
 * 도면 우하단의 표제란(title block)이 곧 내비게이션.
 * 데스크톱: 화면 우하단 고정, 시트 목록·테마·외부 링크를 담는다.
 * 모바일: 하단 고정 띠. 탭하면 시트 목록이 펼쳐진다.
 */
function CrosshairToggle() {
  const on = useCrosshair();
  const mounted = useMounted();
  return (
    <button
      type="button"
      onClick={() => setCrosshair(!on)}
      aria-pressed={mounted ? on : undefined}
      aria-label={on ? "십자선 커서 끄기" : "십자선 커서 켜기"}
      title="Crosshair cursor"
      className={cn(
        "hidden h-6 w-6 items-center justify-center border font-mono text-xs transition-colors md:inline-flex",
        mounted && on ? "border-mark text-mark" : "border-line text-ink-3 hover:text-ink"
      )}
    >
      ✛
    </button>
  );
}

export function TitleBlock() {
  const [open, setOpen] = useState(false);
  const active = useActiveSheet(IDS);
  const current = SHEETS.find((s) => s.id === active);

  return (
    <div data-print="hide" className="fixed inset-x-0 bottom-0 z-50 md:inset-x-auto md:bottom-6 md:right-6">
      <div className="group border-t border-line bg-paper md:w-[19.5rem] md:border md:shadow-[8px_8px_0_0_var(--color-line-soft)]">
        {/* 상단 행: 워드마크 · 현재 시트 · 열기 */}
        <div className="grid grid-cols-[1fr_auto_auto] items-stretch divide-x divide-line">
          <a href="#top" className="flex items-center gap-1 px-3 py-2.5 text-sm text-ink">
            <span className="display text-base tracking-tight">useTaehwan</span>
            <span className="font-mono text-mark">()</span>
          </a>
          <div className="flex flex-col justify-center px-3 py-1.5">
            <span className="label">Sheet</span>
            <span className="figure-no text-sm leading-tight">
              {current ? current.no : "00"} / {String(SHEETS.length).padStart(2, "0")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="sheet-index"
            aria-label={open ? "시트 목록 닫기" : "시트 목록 열기"}
            className="flex w-11 items-center justify-center font-mono text-ink transition-colors hover:bg-mark-soft hover:text-mark"
          >
            {open ? "×" : "≡"}
          </button>
        </div>

        {/* 시트 목록 */}
        <nav
          id="sheet-index"
          aria-label="시트 목록"
          className={cn("border-t border-line", open ? "block" : "hidden md:group-hover:block md:group-focus-within:block")}
        >
          <ol className="grid grid-cols-2 md:grid-cols-1">
            {SHEETS.map((s) => {
              const isActive = s.id === active;
              return (
                <li key={s.id} className="border-b border-line-soft last:border-b-0 md:border-b-0">
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex items-baseline gap-3 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                      isActive
                        ? "bg-ink text-paper"
                        : "text-ink-3 hover:bg-mark-soft hover:text-mark"
                    )}
                  >
                    <span className="tabular-nums">{s.no}</span>
                    <span>{s.label}</span>
                    {isActive && <span className="ml-auto">◆</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* 하단 행: 테마 · 외부 링크 */}
        <div
          className={cn(
            "items-center justify-between gap-2 border-t border-line px-3 py-2",
            open ? "flex" : "hidden md:group-hover:flex md:group-focus-within:flex"
          )}
        >
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CrosshairToggle />
          </div>
          <div className="flex gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
            <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="text-ink-3 hover:text-mark">
              Blog ↗
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-ink-3 hover:text-mark">
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
