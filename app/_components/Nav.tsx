"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container, cn } from "@usetaehwan/ui";
import { ThemeToggle } from "../ThemeToggle";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "background", label: "Background" },
  { id: "projects", label: "Projects" },
  { id: "system", label: "Design System" },
  { id: "ai", label: "AI" },
  { id: "contact", label: "Contact" },
];

const BLOG_URL = "https://taepuwan.tistory.com/";

/**
 * 티스토리 블로그로 나가는 외부 링크. 섹션 앵커가 아니므로 LINKS(스크롤 스파이)와
 * 분리해 헤더 우측 유틸리티 영역에 둔다. 좁은 화면에서는 텍스트를 접고 아이콘만 남긴다.
 */
function BlogLink({ className }: { className?: string }) {
  return (
    <a
      href={BLOG_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="블로그 (새 탭에서 열림)"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-mono text-sm text-fg-body transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        className
      )}
    >
      {/* 펜(글쓰기) 아이콘 — 옆 햄버거(≡)와 헷갈리지 않게 라인 아이콘 대신 사용 */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      <span className="hidden sm:inline">Blog</span>
    </a>
  );
}

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

          <div className="flex items-center gap-1 sm:gap-2">
            <BlogLink />
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
