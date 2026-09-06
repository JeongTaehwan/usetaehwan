import { cn } from "./cn";

/** 도면 주기(註記) 서체 — 모노 · 대문자 · 넓은 자간 */
export function Label({
  as: Tag = "span",
  className,
  children,
  mark = false,
}: {
  as?: "span" | "div" | "p" | "dt" | "dd" | "h2" | "h3";
  className?: string;
  children: React.ReactNode;
  /** 적색 마킹 색 */
  mark?: boolean;
}) {
  return <Tag className={cn("label", mark && "text-mark", className)}>{children}</Tag>;
}
