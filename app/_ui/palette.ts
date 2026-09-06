"use client";

import { useSyncExternalStore } from "react";

/**
 * html 요소의 클래스(.dark / .theme-*)를 외부 스토어로 구독한다.
 * 테마 토글·팔레트 토글이 같은 진실(html.classList)을 읽고 쓰므로 서로 어긋나지 않는다.
 * useEffect 안에서 setState를 부르지 않아도 되고, 여러 토글이 자동으로 동기화된다.
 */

type Listener = () => void;
const listeners = new Set<Listener>();
let observer: MutationObserver | null = null;

function subscribe(cb: Listener) {
  listeners.add(cb);
  if (!observer && typeof MutationObserver !== "undefined") {
    observer = new MutationObserver(() => listeners.forEach((l) => l()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

function readDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function readPalette(): string | null {
  for (const c of Array.from(document.documentElement.classList)) {
    if (c.startsWith("theme-")) return c.slice("theme-".length);
  }
  return null;
}

/** 서버 스냅샷은 항상 '라이트 · 팔레트 없음' — 마운트 후 실제 값으로 갈아탄다 */
export function useDark(): boolean {
  return useSyncExternalStore(subscribe, readDark, () => false);
}

export function usePalette(): string | null {
  return useSyncExternalStore(subscribe, readPalette, () => null);
}

/** 마운트 여부 — SSR 스냅샷과 실제 값이 다를 수 있는 UI를 마운트 전에 중립으로 두는 용도 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("theme", next ? "dark" : "light");
  } catch {}
}

export function setPalette(slug: string | null) {
  const el = document.documentElement;
  Array.from(el.classList)
    .filter((c) => c.startsWith("theme-"))
    .forEach((c) => el.classList.remove(c));
  if (slug) el.classList.add(`theme-${slug}`);
}
