import { cn } from "./cn";

/** 검수 도장 */
export function Stamp({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("stamp", className)}>{children}</span>;
}
