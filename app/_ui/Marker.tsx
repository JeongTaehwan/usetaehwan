import { cn } from "./cn";

/** 상세도 마커 — 도면의 ⓐ ⓑ 원형 라벨 */
export function Marker({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-line font-mono font-medium text-ink",
        size === "sm" && "h-6 w-6 text-[11px]",
        size === "md" && "h-9 w-9 text-sm",
        size === "lg" && "h-14 w-14 text-xl",
        className
      )}
    >
      {children}
    </span>
  );
}
