import Link from "next/link";
import { TimeToggle } from "./TimeToggle";
import { SceneFinish } from "./scene/primitives";

/** 상세 페이지(발표·AI 노트·404)의 공용 껍데기 — 벽돌 벽 위에 종이 한 장 */
export function LoftHeader({ backHref, backLabel, right }: { backHref: string; backLabel: string; right?: React.ReactNode }) {
  return (
    <header data-print="hide" className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link href="/" className="caslon text-[18px] italic text-ink sm:text-[20px]">Taehwan Jeong</Link>
        <div className="flex items-center gap-4">
          <Link href={backHref} className="caps text-muted transition-colors hover:text-ink">← {backLabel}</Link>
          {right ?? <TimeToggle className="hidden sm:inline-flex" />}
        </div>
      </div>
    </header>
  );
}

export function LoftPaper({ crumb, title, lead, children }: { crumb: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-wall">
      <div className="brick absolute inset-0" />
      <div className="sunbeam left-[30%] top-[-10%] h-[120%] w-[70%]" />
      <div className="lampglow" />
      <div className="relative z-10 mx-auto w-full max-w-[880px] px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
        <article className="paper relative p-6 sm:p-12">
          <div className="caps text-accent">{crumb}</div>
          <h1 className="myeongjo mt-4 text-[28px] leading-[1.25] text-[#2b2622] sm:text-[40px]">{title}</h1>
          <p className="mt-5 text-[16px] leading-[1.8] text-[#2b2622] [word-break:keep-all]">{lead}</p>
          {children}
        </article>
      </div>
      <SceneFinish />
    </div>
  );
}

export function PaperHead({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="caslon text-[14px] text-accent">{no}</span>
      <h2 className="myeongjo text-[20px] text-[#2b2622] sm:text-[24px]">{children}</h2>
    </div>
  );
}

export function PaperRows({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <dl className="grid gap-y-2 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-4">
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="caps pt-1 text-accent">{r.k}</dt>
          <dd className="text-[14.5px] leading-[1.8] text-[#5c534a] [word-break:keep-all]">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PaperMeta({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 border border-[rgba(43,38,34,0.14)] sm:grid-cols-3">
      {items.map((m) => (
        <div key={m.k} className="border-[rgba(43,38,34,0.14)] p-3 [&:not(:first-child)]:border-l sm:p-4">
          <dt className="caps text-[9px] text-[#8b7f72]">{m.k}</dt>
          <dd className="mt-1.5 text-[14px] text-[#2b2622]">{m.v}</dd>
        </div>
      ))}
    </dl>
  );
}
