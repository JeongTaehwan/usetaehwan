"use client";

import { cn } from "../_ui/cn";
import { setDark, useDark, useMounted } from "../_ui/palette";

/**
 * PAPER(라이트) / BLUEPRINT(다크) 전환. 진실은 html.dark 클래스이고, 여기서는 그것을 읽고 쓴다.
 * 초기 적용은 layout.tsx의 인라인 스크립트가 맡는다.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useDark();
  const mounted = useMounted();

  const seg =
    "px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-mark";

  return (
    <div role="group" aria-label="테마" className={cn("inline-flex border border-line", className)}>
      <button
        type="button"
        onClick={() => setDark(false)}
        aria-pressed={mounted ? !dark : undefined}
        className={cn(seg, mounted && !dark ? "bg-ink text-paper" : "text-ink-3 hover:text-ink")}
      >
        Paper
      </button>
      <button
        type="button"
        onClick={() => setDark(true)}
        aria-pressed={mounted ? dark : undefined}
        className={cn(seg, mounted && dark ? "bg-ink text-paper" : "text-ink-3 hover:text-ink")}
      >
        Blueprint
      </button>
    </div>
  );
}
