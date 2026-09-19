import { cn } from "../_ui/cn";
import { Pixel, type SpriteName } from "./Pixel";

/** 대화창·패널 — 바깥 굵은 테두리 + 안쪽 가는 선 */
export function PBox({ className, children, as: Tag = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "section" | "article" }) {
  return <Tag className={cn("pbox", className)}>{children}</Tag>;
}

/** 대화창 — 오른쪽 아래에 깜빡이는 ▼ */
export function Dialog({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("pbox dialog relative px-4 py-3.5 @min-[440px]/screen:px-5 @min-[440px]/screen:py-4", className)}>
      {children}
      <span className="dialog-more" aria-hidden>▼</span>
    </div>
  );
}

const TONES = {
  red: "bg-red text-white",
  blue: "bg-blue text-white",
  green: "bg-green text-white",
  gold: "bg-gold text-ink",
  purple: "bg-purple text-white",
  ink: "bg-ink text-lcd",
} as const;
export type Tone = keyof typeof TONES;

/** 장면 머리 — 색 띠 위에 스프라이트와 제목 */
export function SceneHead({ id, sprite, kicker, title, sub, tone = "red", children }: { id?: string; sprite: SpriteName; kicker: string; title: string; sub?: string; tone?: Tone; children?: React.ReactNode }) {
  return (
    <header className={cn("scene-head", TONES[tone])}>
      <div className="sprite-tile shrink-0">
        <Pixel name={sprite} className="h-full w-full" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] tracking-[0.12em] opacity-85">{kicker}</div>
        <h2 id={id} className="mt-1 text-[22px] font-bold leading-tight @min-[440px]/screen:text-[26px]">{title}</h2>
        {sub && <p className="mt-1.5 text-[12px] leading-[1.6] opacity-90 [word-break:keep-all] @min-[440px]/screen:text-[13px]">{sub}</p>}
        {children}
      </div>
    </header>
  );
}

const CHIP_COLORS = ["var(--color-red)", "var(--color-blue)", "var(--color-green)", "var(--color-gold-2)", "var(--color-purple)", "var(--color-teal-dark)"];

/** 타입 칩 — 같은 글자는 늘 같은 색 */
export function TypeChip({ children }: { children: string }) {
  let h = 0;
  for (const ch of children) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span className="type-chip" style={{ background: CHIP_COLORS[h % CHIP_COLORS.length] }}>
      {children}
    </span>
  );
}

/** 칸 막대 — 체력바처럼 칸 단위로 채운다 */
export function SegBar({ value, max, segments = 20, color = "var(--color-green)", label }: { value: number; max: number; segments?: number; color?: string; label: string }) {
  const filled = Math.max(0, Math.min(segments, Math.round((value / Math.max(1, max)) * segments)));
  return (
    <div className="segbar" role="img" aria-label={label}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} style={i < filled ? { background: color } : undefined} />
      ))}
    </div>
  );
}

/** 표 한 줄 — 왼쪽 라벨, 오른쪽 값 */
export function Rows({ rows, className }: { rows: { k: string; v: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid gap-y-2.5 @min-[440px]/screen:grid-cols-[4.5rem_minmax(0,1fr)] @min-[440px]/screen:gap-x-4", className)}>
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="pt-0.5 text-[12px] font-bold text-red">{r.k}</dt>
          <dd className="body-kr">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 작은 머리 — 번호와 제목 */
export function Sub({ children, no }: { children: React.ReactNode; no?: string }) {
  return (
    <h3 className="sub-head">
      {no && <span className="text-red">{no}</span>}
      <span>{children}</span>
    </h3>
  );
}

/** 상세 화면 머리 — 큰 스프라이트와 번호·제목. 색은 호출하는 쪽이 정한다 (프로젝트는 자기 팔레트). */
export function DocHero({
  sprite,
  no,
  title,
  bg,
  fg,
  accent,
  children,
}: {
  sprite: SpriteName;
  no: string;
  title: string;
  bg: string;
  fg: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="doc-hero" style={{ background: bg, color: fg, ["--hero-acc" as string]: accent }}>
      <div className="doc-hero-sprite">
        <Pixel name={sprite} className="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-bold tracking-[0.12em]" style={{ color: accent }}>
          {no}
        </div>
        <h1 className="mt-1.5 text-[24px] font-bold leading-[1.3] [word-break:keep-all] @min-[440px]/screen:text-[30px]">{title}</h1>
        {children}
      </div>
    </header>
  );
}

/** 상세 화면 끝의 되돌아가기 — 전체 이동이라 홈의 :target 장면이 바로 맞는다 */
export function BackRow({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} data-nav className="back-row">
      <span>◀ {label}</span>
      <kbd>B</kbd>
    </a>
  );
}
