import Link from "next/link";
import { cn } from "./cn";

type Variant = "solid" | "outline" | "text";

const base =
  "inline-flex h-10 items-center gap-2 px-4 font-mono text-xs uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mark";

const variants: Record<Variant, string> = {
  solid: "border border-ink bg-ink text-paper hover:bg-mark hover:border-mark hover:text-on-mark",
  outline: "border border-line text-ink hover:border-mark hover:text-mark",
  text: "px-0 text-ink-3 hover:text-mark",
};

/**
 * 도면풍 버튼. href가 내부 경로면 next/link, 외부면 새 탭 a 태그, 없으면 button.
 */
export function Btn({
  href,
  variant = "outline",
  className,
  children,
  external,
  ...rest
}: {
  href?: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const cls = cn(base, variants[variant], className);
  if (href) {
    const isExternal = external ?? /^https?:/.test(href);
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
