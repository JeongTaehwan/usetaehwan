"use client";

import { cn } from "../_ui/cn";
import { setDark, useDark, useMounted } from "../_ui/palette";

function Sun({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function Moon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  );
}

/**
 * Morning / Evening. 진실은 html.dark (Evening) — v2의 다크모드 스토어를 그대로 쓴다.
 * 마운트 전에는 강조 없이 그려 SSR과 어긋나지 않게 한다.
 */
export function TimeToggle({ className }: { className?: string }) {
  const dark = useDark();
  const mounted = useMounted();
  const seg = "flex items-center gap-1.5 rounded-full px-3 py-1.5 karla text-[12px] font-semibold transition-colors";
  const on = "bg-brass text-[#fffdf7] dark:text-[#2b2622]";
  const off = "text-muted hover:text-ink";
  return (
    <div role="group" aria-label="시간대" className={cn("inline-flex items-center rounded-full border border-line p-[3px]", className)}>
      <button type="button" onClick={() => setDark(false)} aria-pressed={mounted ? !dark : undefined} className={cn(seg, mounted && !dark ? on : off)}>
        <Sun /> <span>Morning</span>
      </button>
      <button type="button" onClick={() => setDark(true)} aria-pressed={mounted ? dark : undefined} className={cn(seg, mounted && dark ? on : off)}>
        <Moon /> <span>Evening</span>
      </button>
    </div>
  );
}
