"use client";
import { useEffect, useState } from "react";
import { cn } from "../_ui/cn";

export const SECTIONS = [
  { id: "about", label: "소개" },
  { id: "experience", label: "경력" },
  { id: "projects", label: "프로젝트" },
  { id: "ai", label: "AI 노트" },
  { id: "talks", label: "발표" },
  { id: "contact", label: "연락" },
] as const;

/** 지금 읽고 있는 섹션 — 화면 위 30% 선을 지난 마지막 섹션. 바닥에 닿으면 마지막 섹션. */
function useActiveSection() {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    // 섹션 여섯 개의 위치만 읽으므로 스크롤마다 바로 계산해도 가볍다
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = "";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = SECTIONS[SECTIONS.length - 1].id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return active;
}

/** 넓은 화면 — 왼쪽 고정 열의 세로 목차 */
export function SideNav() {
  const active = useActiveSection();
  return (
    <nav aria-label="목차" className="mt-12 hidden lg:block">
      <ul className="flex flex-col">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className="group flex items-center gap-3 py-2 text-[14px] text-mute transition-colors hover:text-ink aria-[current]:font-medium aria-[current]:text-ink"
            >
              <span className="h-px w-8 bg-line-2 transition-colors group-hover:bg-ink group-aria-[current]:bg-ink" aria-hidden />
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** 좁은 화면 — 위에 붙는 가로 목차 */
export function TopNav() {
  const active = useActiveSection();
  return (
    <nav aria-label="목차" className="sticky top-0 z-20 -mx-5 border-b border-line bg-paper/85 px-5 backdrop-blur supports-[backdrop-filter]:bg-paper/70 sm:-mx-8 sm:px-8 lg:hidden">
      <ul className="-mx-2 flex h-14 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className={cn(
                "block rounded-full px-3 py-1.5 text-[14px] text-mute transition-colors hover:text-ink",
                "aria-[current]:bg-hover aria-[current]:font-medium aria-[current]:text-ink",
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** 게임기 버전(v4)의 장면 해시로 들어와도 같은 내용의 섹션으로 */
const LEGACY: Record<string, string> = {
  menu: "about",
  dex: "projects",
  trainer: "about",
  map: "experience",
  notes: "ai",
  caster: "talks",
  link: "contact",
};
export function LegacyHash() {
  useEffect(() => {
    const redirect = () => {
      const h = location.hash.slice(1);
      if (h === "settings") location.replace("/play#settings");
      else if (LEGACY[h]) {
        history.replaceState(null, "", "#" + LEGACY[h]);
        document.getElementById(LEGACY[h])?.scrollIntoView({ behavior: "instant" });
      }
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, []);
  return null;
}

/** 긴 문단 — 세 줄까지 보이고 펼친다 */
export function Clamp({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <p className={cn("text-[15px] leading-[1.8] text-ink-2", !open && "line-clamp-3")}>{children}</p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="mt-1.5 -ml-1 rounded px-1 text-[13.5px] font-medium text-accent transition-colors hover:text-ink"
      >
        {open ? "접기" : "더 읽기"}
      </button>
    </div>
  );
}
