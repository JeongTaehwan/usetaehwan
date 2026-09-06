"use client";

import { useEffect, useRef } from "react";

/**
 * 커서를 따라 은은하게 움직이는 빛 — Morning엔 햇빛 반점, Evening엔 램프 온기.
 * React 상태 없이 rAF로 transform만 갱신. 마우스(pointer: fine)에서만, reduced-motion이면 끈다.
 */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parent = el.parentElement;
    if (!parent) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      // 천천히 따라간다 — 빛은 커서보다 게으르다
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      tx = e.clientX - r.left - 300;
      ty = e.clientY - r.top - 300;
      el.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { el.style.opacity = "0"; };
    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-700 will-change-transform"
      style={{ background: "radial-gradient(closest-side, var(--sun), var(--sun-0) 70%)", mixBlendMode: "soft-light" }}
    />
  );
}

/** 스크롤에 따라 자식이 천천히 뒤로 밀리는 패럴랙스 (창밖 풍경용). speed 0.2 = 스크롤의 20% */
export function Parallax({ children, speed = 0.18, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      el.style.transform = `translateY(${window.scrollY * speed}px)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [speed]);
  return <div ref={ref} className={className}>{children}</div>;
}

/**
 * 1440×900 고정 장면을 컨테이너에 '커버'로 맞춘다.
 * CSS만으로는 길이(cqw)를 배율(number)로 못 바꾸므로 ResizeObserver로 --s 를 준다.
 */
export function SceneFit({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      el.style.setProperty("--s", String(Math.max(width / 1440, height / 900)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={`scene-fit ${className ?? ""}`} style={{ ["--s" as string]: 0.3 }}>
      {children}
    </div>
  );
}
