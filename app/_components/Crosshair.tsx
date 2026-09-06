"use client";

import { useEffect, useRef } from "react";

/**
 * CAD 커서 — 화면을 가로지르는 가는 십자선과 좌표 판독.
 * React state 없이 rAF 한 번에 transform만 갱신한다. 마우스(pointer: fine)에서만 켜지고,
 * html.no-crosshair면 CSS가 통째로 숨긴다. 좌표는 8px 격자 한 칸을 1 단위로 센다.
 */
export function Crosshair() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const h = el.querySelector<HTMLElement>("[data-h]");
    const v = el.querySelector<HTMLElement>("[data-v]");
    const tag = el.querySelector<HTMLElement>("[data-tag]");
    if (!h || !v || !tag) return;

    let x = 0;
    let y = 0;
    let raf = 0;

    const paint = () => {
      raf = 0;
      h.style.transform = `translateY(${y}px)`;
      v.style.transform = `translateX(${x}px)`;
      // 오른쪽·아래 여백이 부족하면 라벨을 커서 반대편으로
      const flipX = x > window.innerWidth - 140;
      const flipY = y > window.innerHeight - 40;
      tag.style.transform = `translate(${x + (flipX ? -12 : 12)}px, ${y + (flipY ? -12 : 12)}px) translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`;
      tag.textContent = `X ${Math.round(x / 8)}  Y ${Math.round((y + window.scrollY) / 8)}`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      el.dataset.on = "1";
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      delete el.dataset.on;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="crosshair">
      <span data-h className="crosshair-h" />
      <span data-v className="crosshair-v" />
      <span data-tag className="crosshair-tag" />
    </div>
  );
}
