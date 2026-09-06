"use client";

import { useEffect } from "react";
import { cn } from "../_ui/cn";
import { Label } from "../_ui/Label";
import { setPalette, usePalette } from "../_ui/palette";
import type { ProjectPalette } from "../_data/projects";

/** 팔레트 스와치 행 — 토큰 이름은 hover/focus 시 툴팁으로 */
export function Swatches({ palette, className }: { palette: ProjectPalette; className?: string }) {
  return (
    <ul className={cn("flex items-center gap-1", className)} aria-label={`${palette.label} 팔레트`}>
      {palette.swatches.map((s) => (
        <li key={s.name} className="group/sw relative">
          <span
            className="block h-4 w-4 border border-line-soft transition-transform group-hover/sw:scale-125"
            style={{ backgroundColor: s.value }}
            title={`${s.name} ${s.value}`}
            aria-label={`${s.name} ${s.value}`}
            role="img"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * "이 팔레트를 도면 전체에 입히기" 토글. html.theme-<slug>를 켜고 끈다.
 * 다른 프로젝트 카드의 토글을 누르면 그쪽으로 갈아탄다.
 */
export function PaletteBleed({ slug, palette }: { slug: string; palette: ProjectPalette }) {
  const active = usePalette() === slug;
  return (
    <button
      type="button"
      onClick={() => setPalette(active ? null : slug)}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
        active
          ? "border-mark bg-mark text-on-mark"
          : "border-line text-ink-3 hover:border-mark hover:text-mark"
      )}
    >
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: palette.swatches.find((s) => s.name === "brand")?.value }}
      />
      {active ? "전체 도면에 적용 중 — 끄기" : "전체 도면에 입히기"}
    </button>
  );
}

/** 상세 페이지에서 html에 팔레트 클래스를 붙였다가, 떠날 때 뗀다 (오버스크롤·선택색까지 일치) */
export function PaletteScope({ slug }: { slug: string }) {
  useEffect(() => {
    setPalette(slug);
    return () => setPalette(null);
  }, [slug]);
  return null;
}

/** 상세 페이지 헤더의 팔레트 범례 — 테마 토글 자리에 들어간다 */
export function PaletteLegend({ palette }: { palette: ProjectPalette }) {
  return (
    <div className="flex items-center gap-3 border border-line px-2.5 py-1.5">
      <Label>{palette.label}</Label>
      <Swatches palette={palette} />
    </div>
  );
}
