import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Label } from "../_ui/Label";

/**
 * 상세 페이지 공용 상단 띠 — 워드마크 · 상위 시트로 돌아가기 · 테마.
 * 홈의 표제란 대신 얇은 헤더를 쓴다(상세는 한 장짜리 도면이라 목록이 필요 없다).
 */
export function SubpageHeader({
  backHref,
  backLabel,
  sheetNo,
  right,
}: {
  backHref: string;
  backLabel: string;
  sheetNo: string;
  /** 우측 유틸리티 — 기본은 Paper/Blueprint 토글. 프로젝트 상세는 팔레트 범례를 넣는다 */
  right?: React.ReactNode;
}) {
  return (
    <header data-print="hide" className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-1 text-ink">
          <span className="display text-base tracking-tight">useTaehwan</span>
          <span className="font-mono text-mark">()</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3 transition-colors hover:text-mark"
          >
            ← Sheet {sheetNo} · {backLabel}
          </Link>
          {right ?? <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}

/** 상세 페이지 본문 프레임 — 한 장짜리 도면. 상단 주기 · 제목 · 리드 */
export function DetailSheet({
  crumb,
  sheet,
  title,
  lead,
  children,
}: {
  crumb: string;
  /** 상단 띠 가운데 — 예: "Sheet 04 · Detail B" */
  sheet: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
      <article className="sheet">
        <div aria-hidden className="zones zones-x hidden md:flex">
          {["A", "B", "C", "D"].map((z) => (
            <span key={z}>{z}</span>
          ))}
        </div>
        <div aria-hidden className="zones zones-y hidden md:flex">
          {["1", "2", "3", "4", "5", "6"].map((z) => (
            <span key={z}>{z}</span>
          ))}
        </div>
        {/* 커버와 같은 상단 띠 */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-6 py-3 sm:px-12">
          <Label>Drawing no. UT-2026-01</Label>
          <Label className="hidden sm:block">{sheet}</Label>
          <Label className="hidden md:block">Scale 1:1</Label>
          <Label>Rev 2.0</Label>
        </div>
        <div className="p-6 sm:p-12">
          <Label mark>{crumb}</Label>
          <h1 className="display mt-4 text-3xl sm:text-5xl">{title}</h1>
          <p className="prose-draft mt-6 text-ink">{lead}</p>
          {children}
        </div>
      </article>
    </div>
  );
}

/** 상세 페이지의 메타 표 — Role / Period 같은 짧은 항목 */
export function MetaTable({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-3">
      {items.map((m) => (
        <div key={m.k} className="p-3 sm:p-4">
          <Label as="dt">{m.k}</Label>
          <dd className="mt-1.5 font-mono text-sm text-ink">{m.v}</dd>
        </div>
      ))}
    </dl>
  );
}
