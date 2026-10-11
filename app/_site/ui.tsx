import Link from "next/link";
import { cn } from "../_ui/cn";
import type { Project } from "../_data/projects";

/** 두 자리 번호 — 01, 02 … */
export function no2(i: number) {
  return String(i + 1).padStart(2, "0");
}

/** 오른쪽 화살표 — 링크 카드의 끝 */
export function Arrow({ className, external }: { className?: string; external?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("h-4 w-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {external ? <path d="M5 11 11 5M6 5h5v5" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
    </svg>
  );
}

/** 작은 꼬리표 — 태그·스택 */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-[12.5px] leading-5 text-ink-2", className)}>{children}</span>;
}

export function Pills({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((t) => (
        <li key={t}>
          <Pill>{t}</Pill>
        </li>
      ))}
    </ul>
  );
}

/** 버튼 모양 링크 — 외부 링크면 새 탭 */
export function ButtonLink({ href, children, primary, className }: { href: string; children: React.ReactNode; primary?: boolean; className?: string }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[14px] font-medium transition-colors",
        primary ? "bg-ink text-paper hover:bg-ink-2" : "border border-line-2 text-ink hover:bg-hover",
        className,
      )}
    >
      {children}
      {external && <Arrow external className="h-3.5 w-3.5" />}
    </a>
  );
}

/** 섹션 제목 — 본문 h2 */
export function SectionTitle({ id, children, count }: { id: string; children: React.ReactNode; count?: number }) {
  return (
    <h2 id={id} className="mb-6 flex items-baseline gap-2.5 text-[22px] font-bold tracking-[-0.01em]">
      {children}
      {count !== undefined && <span className="font-mono text-[13px] font-normal text-mute">{count}</span>}
    </h2>
  );
}

/** 상세 문서의 소제목 */
export function DocHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-14 mb-4 text-[19px] font-bold tracking-[-0.01em]">{children}</h2>;
}

/** 본문 문단 */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[16px] leading-[1.85] text-ink-2", className)}>{children}</p>;
}

/** 라벨 — 값 목록. 좁으면 위아래, 넓으면 두 칸 */
export function DefList({ rows, className }: { rows: { k: string; v: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3 sm:grid-cols-[4.5rem_minmax(0,1fr)]", className)}>
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="text-[13px] font-medium text-mute sm:pt-[3px]">{r.k}</dt>
          <dd className="-mt-2 text-[15px] leading-[1.8] text-ink-2 sm:mt-0">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 프로젝트 표식 — 그 프로젝트의 실제 바탕·글자색으로 칠한 첫 글자, 아래엔 브랜드색 띠 */
export function ProjectMark({ project, size = "md" }: { project: Project; size?: "md" | "lg" }) {
  const sw = Object.fromEntries(project.palette.swatches.map((s) => [s.name, s.value]));
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line font-bold",
        size === "lg" ? "h-16 w-16 text-[26px]" : "h-12 w-12 text-[19px]",
      )}
      style={{ background: sw.bg, color: sw.fg }}
    >
      {Array.from(project.name)[0]}
      <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: sw.brand }} />
    </span>
  );
}

/** 상세 문서 위쪽 막대 — 홈으로 · 게임기 버전으로 */
export function DocBar({ back, backLabel, play }: { back: string; backLabel: string; play: string }) {
  return (
    <div className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-14 max-w-[46rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href={back} className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[14px] text-ink-2 transition-colors hover:text-ink">
          <Arrow className="h-3.5 w-3.5 rotate-180" />
          {backLabel}
        </Link>
        <Link href={play} className="rounded-md px-2 py-1 text-[13px] text-mute transition-colors hover:text-ink">
          게임기 버전으로 보기
        </Link>
      </div>
    </div>
  );
}

/** 상세 문서 머리 — 표식(선택) · 작은 머리글 · 제목 · 리드 */
export function DocHeader({ kicker, title, lead, mark, children }: { kicker: string; title: string; lead?: string; mark?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="pt-12 sm:pt-16">
      {mark && <div className="mb-6">{mark}</div>}
      <p className="font-mono text-[13px] text-mute">{kicker}</p>
      <h1 className="mt-2 text-[30px] leading-[1.3] font-bold tracking-[-0.02em] sm:text-[36px]">{title}</h1>
      {lead && <p className="mt-5 text-[18px] leading-[1.75] text-ink-2">{lead}</p>}
      {children}
    </header>
  );
}

/** 문서 끝 — 이전 · 다음 항목 */
export function PrevNext({ prev, next }: { prev?: { href: string; title: string }; next?: { href: string; title: string } }) {
  return (
    <nav aria-label="이전 · 다음" className="mt-20 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="group rounded-xl border border-line p-4 transition-colors hover:bg-hover">
          <span className="text-[12.5px] text-mute">이전</span>
          <span className="mt-1 block text-[15px] font-medium leading-[1.5]">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link href={next.href} className="group rounded-xl border border-line p-4 text-right transition-colors hover:bg-hover">
          <span className="text-[12.5px] text-mute">다음</span>
          <span className="mt-1 block text-[15px] font-medium leading-[1.5]">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}

/** 상세 문서 공통 틀 */
export function DocShell({ bar, children }: { bar: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <a href="#doc" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        본문으로 건너뛰기
      </a>
      {bar}
      <main id="doc" className="mx-auto max-w-[46rem] px-5 pb-24 sm:px-8">
        {children}
      </main>
    </>
  );
}
