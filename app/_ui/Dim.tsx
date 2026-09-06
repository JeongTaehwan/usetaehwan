import { cn } from "./cn";

/** 치수선 — 양끝 화살촉 사이에 값을 적는다. 숫자를 '측정된 것'으로 보이게 하는 장치 */
export function Dim({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("dim", className)} aria-hidden>
      <span className="text-center">{children}</span>
    </div>
  );
}
