"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS } from "../../_data/projects";
import { WORLDS, isWorldSlug, type WorldSlug } from "../worlds/scenes";
import { BrassPlate, RoomCaption, SceneFinish } from "../scene/primitives";
import { cn } from "../../_ui/cn";
import { SceneFit } from "../Ambient";

/** 문짝 — 원근으로 안쪽에 열려 있고, hover면 더 열린다 */
function DoorLeaf({ open }: { open: boolean }) {
  return (
    <div
      className="absolute left-0 top-0 h-full w-1/2 origin-left border-r-2 border-black/30 shadow-[8px_0_24px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[var(--ease-soft)] [background:linear-gradient(90deg,var(--color-wood-2),var(--color-wood-3))]"
      style={{ transform: `perspective(900px) rotateY(${open ? -62 : -26}deg)` }}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-45 mix-blend-multiply [background-image:var(--tex-wood)] [background-size:400px_400px]" />
      <div className="absolute inset-x-[12%] top-[6%] h-[40%] border-2 border-black/25" />
      <div className="absolute inset-x-[12%] top-[52%] h-[40%] border-2 border-black/25" />
      <div className="absolute right-3 top-1/2 h-8 w-3 -translate-y-1/2 rounded-[6px] bg-gradient-to-b from-brass to-brass-2 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

function Door({ slug, hot, onHover, onEnter }: { slug: WorldSlug; hot: boolean; onHover: (s: WorldSlug | null) => void; onEnter: (s: WorldSlug, rect: DOMRect) => void }) {
  const p = PROJECTS.find((x) => x.slug === slug)!;
  const w = WORLDS[slug];
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <a
      ref={ref}
      href={`/projects/${slug}`}
      onMouseEnter={() => onHover(slug)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(slug)}
      onBlur={() => onHover(null)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        onEnter(slug, ref.current!.getBoundingClientRect());
      }}
      className={cn("group relative block w-full transition-transform duration-500", hot && "-translate-y-1")}
      aria-label={`${p.name} — ${w.placeKo}로 들어가기`}
    >
      <div className="relative aspect-[340/460] w-full">
        {/* 문틀 */}
        <div className="absolute -inset-x-4 -top-4 bottom-0 rounded-t-[4px] bg-gradient-to-b from-wood-2 to-wood-3 shadow-[0_30px_40px_-24px_rgba(0,0,0,0.6)]" />
        <div className="absolute -inset-x-2 -top-2 bottom-0 rounded-t-[3px] bg-wood-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        {/* 문 너머 */}
        <SceneFit className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.55)]">
          <w.Scene compact />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent to-30%" />
          <div className={cn("absolute inset-0 bg-black/25 transition-opacity duration-500", hot && "opacity-0")} />
        </SceneFit>
        <DoorLeaf open={hot} />
        <BrassPlate className="absolute -top-[52px] left-1/2 w-[70%] max-w-[240px] -translate-x-1/2 text-[11px]">
          {w.letter} · {w.place}
        </BrassPlate>
        {/* 바닥 빛 */}
        <div
          className={cn("pointer-events-none absolute -left-[18%] top-full h-[150px] w-[136%] transition-opacity duration-500 [clip-path:polygon(13%_0,87%_0,100%_100%,0_100%)]", hot ? "opacity-100" : "opacity-60")}
          style={{ background: "linear-gradient(180deg, rgba(255,240,210,0.35) 0%, rgba(255,240,210,0) 100%)" }}
          aria-hidden
        />
      </div>
      {/* 설명 */}
      <div className="relative mt-6 flex flex-col gap-1.5">
        <div className={cn("caslon text-[22px] transition-colors", hot ? "text-accent" : "text-ink")}>{p.name}</div>
        <div className="text-[13px] leading-[1.6] text-ink-2 [word-break:keep-all]">{p.summary.split(". ")[0]}.</div>
        <div className="caps text-[10px] text-muted">
          {p.tags.join(" · ")}
          <span className={cn("ml-2 text-accent transition-opacity", hot ? "opacity-100" : "opacity-0")}>· Enter →</span>
        </div>
      </div>
    </a>
  );
}

const ORDER: WorldSlug[] = ["usetaehwan-ui", "gak", "orbit"];

/**
 * 복도 — 세 개의 문. hover면 문이 더 열리고, 누르면 문 너머로 '걸어 들어가는' 전환 뒤 상세로 이동한다.
 * reduced-motion이면 전환 없이 바로 이동.
 */
export function Corridor() {
  const router = useRouter();
  const [hot, setHot] = useState<WorldSlug | null>(null);
  const [entering, setEntering] = useState<{ slug: WorldSlug; rect: DOMRect } | null>(null);

  useEffect(() => {
    ORDER.forEach((s) => router.prefetch(`/projects/${s}`));
  }, [router]);

  const enter = (slug: WorldSlug, rect: DOMRect) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(`/projects/${slug}`);
      return;
    }
    setEntering({ slug, rect });
    window.setTimeout(() => router.push(`/projects/${slug}`), 820);
  };

  return (
    <section id="projects" className="relative isolate overflow-hidden bg-wall pb-[15%] pt-24 sm:pt-28 lg:min-h-[100svh] lg:pb-[12%]">
      <div className="brick absolute inset-0" />
      <div className="floor absolute inset-x-0 bottom-0 h-[16%]" />
      {/* 천장 등 */}
      <div className="pointer-events-none absolute inset-x-0 top-16 hidden justify-around px-[10%] lg:flex" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative h-[70px] w-[90px]">
            <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_0%,rgba(255,225,170,0.3),rgba(255,225,170,0)_70%)] dark:[background:radial-gradient(circle_at_50%_0%,rgba(255,225,170,0.75),rgba(255,225,170,0)_70%)]" />
            <div className="absolute left-1/2 top-0 h-[18px] w-4 -translate-x-1/2 rounded-b-[8px] bg-brass" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-16 flex flex-wrap items-baseline gap-x-5 gap-y-2 sm:mb-20">
          <h2 className="caslon text-[26px] text-ink">Projects</h2>
          <span className="caps text-muted">Three doors · each opens into its own world</span>
        </div>
        <div className="grid grid-cols-1 gap-x-[60px] gap-y-24 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-[4.2%]">
          {ORDER.map((s) => (
            <div key={s} className="mx-auto w-full max-w-[340px] pt-14">
              <Door slug={s} hot={hot === s} onHover={setHot} onEnter={enter} />
            </div>
          ))}
        </div>
      </div>
      <RoomCaption name="Projects" note={hot ? `Door ${WORLDS[hot].letter} · ${WORLDS[hot].place}` : "Corridor · pick a door"} />
      <SceneFinish />

      {/* 걸어 들어가기 */}
      <AnimatePresence>
        {entering && isWorldSlug(entering.slug) && (
          <motion.div
            key="enter"
            className="fixed inset-0 z-[60] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="absolute overflow-hidden"
              initial={{ left: entering.rect.left, top: entering.rect.top, width: entering.rect.width, height: entering.rect.height, borderRadius: 4 }}
              animate={{ left: 0, top: 0, width: "100vw", height: "100vh", borderRadius: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <SceneFit className="absolute inset-0">
                {(() => { const S = WORLDS[entering.slug].Scene; return <S />; })()}
              </SceneFit>
              <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_55%_at_50%_50%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.75)_100%)]" />
            </motion.div>
            <motion.div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="caps text-[10px] text-white/70">Entering · Detail {WORLDS[entering.slug].letter}</span>
              <span className="caslon text-[40px] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">{PROJECTS.find((p) => p.slug === entering.slug)?.name}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
