"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container, cn } from "@usetaehwan/ui";
import { ThemeToggle } from "../ThemeToggle";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "system", label: "Design System" },
  { id: "contact", label: "Contact" },
];

function Wordmark() {
  return (
    <a href="#top" className="text-lg text-fg">
      <span className="font-serif">useTaehwan</span>
      <span className="font-mono text-brand">()</span>
    </a>
  );
}

function NavLink({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full px-3 py-1 font-mono text-sm transition-colors hover:text-fg",
        active ? "bg-brand-subtle text-brand hover:text-brand" : "text-fg-body"
      )}
    >
      {label}
    </a>
  );
}

/** 현재 뷰포트 중앙에 걸린 섹션 id를 추적하는 스크롤 스파이. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 화면에 걸친 섹션 중 가장 위(문서 순서 앞)를 활성으로.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // 뷰포트 상단 45% / 하단 50%를 잘라 '중앙 밴드'에 든 섹션만 반응.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const IDS = LINKS.map((l) => l.id);

export function Nav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(IDS);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md"
    >
      <Container size="lg">
        <div className="flex h-16 items-center justify-between gap-4">
          <Wordmark />

          {/* 데스크톱 링크 */}
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.id} {...l} active={active === l.id} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* 모바일 메뉴 토글 */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="메뉴 열기"
              aria-expanded={open}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
            >
              <span className="font-mono text-base leading-none">{open ? "✕" : "≡"}</span>
            </button>
          </div>
        </div>

        {/* 모바일 드로어 */}
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-1 overflow-hidden pb-4 md:hidden"
          >
            {LINKS.map((l) => (
              <NavLink
                key={l.id}
                {...l}
                active={active === l.id}
                onClick={() => setOpen(false)}
              />
            ))}
          </motion.nav>
        )}
      </Container>
    </motion.header>
  );
}
