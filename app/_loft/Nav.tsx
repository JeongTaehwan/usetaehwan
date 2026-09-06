"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "../_ui/cn";
import { TimeToggle } from "./TimeToggle";

export const ROOMS = [
  { id: "top", label: "Lobby" },
  { id: "about", label: "Study" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Skyline" },
  { id: "talks", label: "Meeting room" },
  { id: "ai", label: "Notebook" },
  { id: "contact", label: "Window" },
];

/** 로프트 상단 내비 — 방 이름이 곧 섹션. 좁은 화면은 햄버거 시트 안에 시간대 토글까지 */
export function LoftNav({ current = "top" }: { current?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header data-print="hide" className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link href="/" className="caslon text-[18px] italic text-ink sm:text-[20px]">
          Taehwan Jeong
        </Link>
        <nav aria-label="방" className="hidden items-center gap-6 md:flex lg:gap-7">
          {ROOMS.map((r) => (
            <a
              key={r.id}
              href={`#${r.id}`}
              aria-current={r.id === current ? "true" : undefined}
              className={cn(
                "karla border-b pb-0.5 text-[13px] tracking-[0.02em] transition-colors",
                r.id === current ? "border-brass text-ink" : "border-transparent text-muted hover:text-ink"
              )}
            >
              {r.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <TimeToggle />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="room-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
          </svg>
        </button>
      </div>
      <div className="mx-auto h-px max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      </div>
      {/* 모바일 시트 */}
      <div id="room-menu" className={cn("border-b border-line bg-wall/95 backdrop-blur-sm md:hidden", open ? "block" : "hidden")}>
        <nav aria-label="방" className="flex flex-col px-5 py-2">
          {ROOMS.map((r) => (
            <a key={r.id} href={`#${r.id}`} onClick={() => setOpen(false)} className="karla border-b border-line py-3 text-[15px] text-ink last:border-b-0">
              {r.label}
            </a>
          ))}
        </nav>
        <div className="px-5 pb-4">
          <TimeToggle />
        </div>
      </div>
    </header>
  );
}
