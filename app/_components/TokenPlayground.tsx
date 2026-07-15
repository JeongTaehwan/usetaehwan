"use client";

import { useState, type CSSProperties } from "react";
import { Badge, Button, Card, Heading, Input, Text, cn } from "@/design-system";

/* ── 브랜드 프리셋 (저채도 웜 뉴트럴 계열) ── */
const BRAND_PRESETS = [
  { name: "Brick", value: "#A55E45" },
  { name: "Olive", value: "#6E7B53" },
  { name: "Slate", value: "#5B6B7B" },
  { name: "Plum", value: "#7E5568" },
  { name: "Rust", value: "#B5623A" },
];

/* ── 라운드 프리셋 (--radius-* 토큰을 통째로 교체) ── */
const RADIUS_PRESETS = {
  sharp: { label: "Sharp", sm: "2px", md: "4px", lg: "8px" },
  default: { label: "Default", sm: "6px", md: "10px", lg: "16px" },
  round: { label: "Round", sm: "10px", md: "16px", lg: "24px" },
} as const;

type RadiusKey = keyof typeof RADIUS_PRESETS;

const DEFAULT_BRAND = "#A55E45";

/** 배경색 밝기로 그 위에 올릴 글자색(on-brand)을 고른다 — 대비 유지용. */
function readableOn(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return "#FDFBF7";
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  // 지각 밝기(간이 luma). 밝으면 어두운 글자, 어두우면 크림 글자.
  return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? "#201D19" : "#FDFBF7";
}

export function TokenPlayground() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [radius, setRadius] = useState<RadiusKey>("default");

  const r = RADIUS_PRESETS[radius];

  // 프리뷰 루트에 토큰만 덮어쓴다. 하위 컴포넌트는 var(--color-*)/var(--radius-*)를
  // 참조하므로, 여기서 변수 값만 바꾸면 그 자리에서 전부 따라 바뀐다.
  const previewStyle = {
    "--color-brand": brand,
    "--color-brand-hover": `color-mix(in oklab, ${brand} 82%, #000)`,
    "--color-brand-subtle": `color-mix(in oklab, ${brand} 18%, var(--color-bg))`,
    "--color-on-brand": readableOn(brand),
    "--radius-sm": r.sm,
    "--radius-md": r.md,
    "--radius-lg": r.lg,
  } as CSSProperties;

  const isDefault = brand === DEFAULT_BRAND && radius === "default";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── 컨트롤 ── */}
      <div className="flex flex-col gap-6">
        <div>
          <Text as="div" variant="muted" className="mb-2 font-mono">
            --color-brand
          </Text>
          <div className="flex flex-wrap items-center gap-2">
            {BRAND_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setBrand(p.value)}
                aria-label={`브랜드 색 ${p.name}`}
                aria-pressed={brand === p.value}
                className={cn(
                  "h-8 w-8 rounded-full border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  brand === p.value ? "border-fg" : "border-border"
                )}
                style={{ backgroundColor: p.value }}
              />
            ))}
            <label className="ml-1 inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-border px-3 text-sm text-fg-body transition-colors hover:bg-surface">
              <input
                type="color"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                aria-label="브랜드 색 직접 선택"
              />
              <span className="font-mono">{brand.toUpperCase()}</span>
            </label>
          </div>
        </div>

        <div>
          <Text as="div" variant="muted" className="mb-2 font-mono">
            --radius-*
          </Text>
          <div className="inline-flex rounded-md border border-border p-1">
            {(Object.keys(RADIUS_PRESETS) as RadiusKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRadius(key)}
                aria-pressed={radius === key}
                className={cn(
                  "rounded-sm px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  radius === key
                    ? "bg-brand text-on-brand"
                    : "text-fg-body hover:text-fg"
                )}
              >
                {RADIUS_PRESETS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBrand(DEFAULT_BRAND);
              setRadius("default");
            }}
            disabled={isDefault}
          >
            ↺ Reset
          </Button>
          <Text as="span" variant="small" className="font-mono">
            토큰 하나만 바꿔도 오른쪽 전체가 반응합니다
          </Text>
        </div>
      </div>

      {/* ── 라이브 프리뷰 (토큰 오버라이드 적용) ── */}
      <div style={previewStyle}>
        <Card className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} className="text-2xl">
              useTaehwan()/ui
            </Heading>
            <span
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: brand }}
              aria-hidden
            />
          </div>

          <Text variant="body">
            토큰 기반 컴포넌트. 아래 버튼·뱃지·입력은 모두 같은 변수를 참조합니다.
          </Text>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">brand</Badge>
            <Badge variant="neutral">neutral</Badge>
          </div>

          <Input placeholder="you@example.com" aria-label="데모 입력" />
        </Card>
      </div>
    </div>
  );
}
