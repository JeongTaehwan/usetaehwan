import { cn } from "../../_ui/cn";

/** 아치창 — 유리(하늘) + 창살 + 창턱. 바깥 스카이라인은 살짝 흐려 원경처럼 */
export function ArchWindow({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("relative", className)} style={style}>
      <div className="glass absolute inset-0 overflow-hidden rounded-t-full">
        <Skyline className="absolute inset-x-0 bottom-0 h-[22%] blur-[1.6px]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-[rgba(40,30,25,0.55)]" />
        <div className="absolute inset-y-0 left-1/2 w-[10px] -translate-x-1/2 bg-wood-3 shadow-[2px_0_3px_rgba(0,0,0,0.25)]" />
        <div className="absolute inset-x-0 top-[45%] h-[10px] bg-wood-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)]" />
      </div>
      <div className="wood-dark absolute -bottom-1 -left-4 -right-4 h-4 rounded-sm shadow-[0_10px_16px_-8px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

/** 창밖 스카이라인 실루엣 */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 190 120" preserveAspectRatio="none" fill="rgba(40,30,25,0.55)" aria-hidden>
      <rect x="0" y="70" width="28" height="50" /><rect x="30" y="40" width="22" height="80" /><rect x="56" y="58" width="34" height="62" />
      <rect x="94" y="22" width="18" height="98" /><rect x="116" y="50" width="30" height="70" /><rect x="150" y="34" width="24" height="86" />
      <rect x="178" y="64" width="12" height="56" /><rect x="101" y="12" width="4" height="12" />
    </svg>
  );
}

/** 화분 */
export function Plant({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={cn("drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]", className)} style={style} viewBox="0 0 120 150" fill="none" aria-hidden>
      <path d="M60 96 C40 80 20 70 14 40 C40 44 56 66 60 96Z" fill="var(--color-sage)" />
      <path d="M60 96 C80 78 96 66 108 36 C82 40 66 64 60 96Z" fill="var(--color-sage)" opacity="0.85" />
      <path d="M60 100 C58 70 52 50 60 14 C70 50 64 72 60 100Z" fill="var(--color-sage)" opacity="0.95" />
      <path d="M58 98 C44 88 30 86 22 64 C42 66 52 80 58 98Z" fill="var(--color-sage)" opacity="0.7" />
      <path d="M62 98 C76 88 90 86 98 64 C78 66 68 80 62 98Z" fill="var(--color-sage)" opacity="0.7" />
      <path d="M60 96 C56 78 60 60 78 48 C72 66 66 80 60 96Z" fill="#5F6E4E" opacity="0.6" />
      <rect x="30" y="98" width="60" height="14" rx="3" fill="#C99B75" />
      <path d="M34 112 L86 112 L80 148 L40 148 Z" fill="#B98A5E" />
      <path d="M34 112 L86 112 L84 124 L36 124 Z" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

/** 놋쇠 명패 */
export function BrassPlate({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("plate h-[42px]", className)}>
      <span className="caslon whitespace-nowrap text-[12px] uppercase tracking-[0.24em] text-[#2b2622] [text-shadow:0_1px_0_rgba(255,255,255,0.3)]">{children}</span>
    </div>
  );
}

/** 스탠드 램프 — Evening에만 켜진다 */
export function FloorLamp({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={cn("lamp", className)} style={style} viewBox="0 0 90 360" fill="none" aria-hidden>
      <path d="M10 0 L80 0 L70 90 L20 90 Z" fill="#E9D8B6" opacity="0.95" />
      <rect x="43" y="90" width="4" height="240" fill="var(--color-brass)" />
      <ellipse cx="45" cy="334" rx="30" ry="6" fill="var(--color-brass)" />
    </svg>
  );
}

/** 접촉 그림자 */
export function ContactShadow({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn("pointer-events-none absolute rounded-full bg-black/45 blur-md", className)} style={style} />;
}

/** 장면 마감: 그레이딩 → 비네트 → 그레인 */
export function SceneFinish() {
  return (
    <>
      <div aria-hidden className="grade" />
      <div aria-hidden className="vignette" />
      <div aria-hidden className="grain" />
    </>
  );
}

/** 방 제목 캡션 (바닥 왼쪽 아래) */
export function RoomCaption({ name, note }: { name: string; note: string }) {
  return (
    <div className="absolute bottom-6 left-5 z-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 sm:left-8 lg:left-14">
      <span className="caslon text-[20px] text-[#fbf6ec] sm:text-[22px]">{name}</span>
      <span className="caps text-[10px] text-[#fbf6ec]/80">{note}</span>
    </div>
  );
}

/** 방 안 소제목 */
export function RoomLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("caps text-brass", className)}>{children}</div>;
}
