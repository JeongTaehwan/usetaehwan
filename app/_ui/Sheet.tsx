import { Reveal, Rule } from "./Reveal";
import { Label } from "./Label";
import { cn } from "./cn";

export const SHEET_TOTAL = 6;

/**
 * 도면 한 장(sheet) = 홈의 섹션 하나.
 * 상단 헤더 띠: 시트 번호(크게) · 제목(대문자 디스플레이) · 우측 메타. 아래 본문.
 */
export function Sheet({
  id,
  no,
  title,
  meta,
  children,
  className,
}: {
  id: string;
  no: number;
  title: string;
  /** 헤더 우측 주기 — 예: "SCALE 1:1 · 2022–2026" */
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const n = String(no).padStart(2, "0");
  return (
    <section id={id} className={cn("scroll-mt-16 py-16 sm:py-24", className)}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <header className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <div className="flex items-baseline gap-2">
              <Label>Sheet</Label>
              <span className="figure-no text-4xl sm:text-5xl">{n}</span>
              <Label>/ {String(SHEET_TOTAL).padStart(2, "0")}</Label>
            </div>
            <h2 className="display text-3xl uppercase sm:text-5xl">{title}</h2>
            {meta && <Label className="ml-auto hidden sm:block">{meta}</Label>}
          </header>
          <Rule className="mt-4" />
        </Reveal>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}

/** 시트 안의 소제목 — "1. OVERVIEW" 같은 번호 주기 */
export function SubHead({
  no,
  children,
  className,
}: {
  no?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      {no && <span className="figure-no text-sm text-mark">{no}</span>}
      <h3 className="display text-xl uppercase tracking-tight sm:text-2xl">{children}</h3>
    </div>
  );
}

/** 문제 → 파악 → 해결 같은 3단 기록을 라벨 붙은 행으로 */
export function Rows({
  rows,
  className,
}: {
  rows: { k: string; v: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-y-2 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-4", className)}>
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <Label as="dt" mark className="sm:pt-1.5">
            {r.k}
          </Label>
          <dd className="prose-draft">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
