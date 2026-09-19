"use client";

import { useSyncExternalStore } from "react";

/**
 * 게임기 설정 — 소리 on/off 와 기기 색. 진실은 html 의 data-sound / data-shell 속성이고
 * localStorage 는 다음 방문용 저장소다. 첫 페인트 전 적용은 layout 의 인라인 스크립트가 맡는다.
 */

export const SHELLS = [
  { id: "black", label: "블랙" },
  { id: "white", label: "화이트" },
  { id: "red", label: "레드" },
  { id: "blue", label: "블루" },
  { id: "turf", label: "민트" },
] as const;
export type ShellId = (typeof SHELLS)[number]["id"];

type Listener = () => void;
const listeners = new Set<Listener>();
let observer: MutationObserver | null = null;

function subscribe(cb: Listener) {
  listeners.add(cb);
  if (!observer) {
    observer = new MutationObserver(() => listeners.forEach((l) => l()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sound", "data-shell"] });
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

export function useSound(): boolean {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset.sound === "on", () => false);
}

export function useShell(): ShellId {
  return useSyncExternalStore(subscribe, () => (document.documentElement.dataset.shell as ShellId) || "black", () => "black");
}

export function soundOn(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.sound === "on";
}

export function setSound(on: boolean) {
  document.documentElement.dataset.sound = on ? "on" : "off";
  try {
    localStorage.setItem("sound", on ? "on" : "off");
  } catch {}
}

/** SELECT — 다음 색으로 */
export function nextShell() {
  const cur = document.documentElement.dataset.shell;
  const i = SHELLS.findIndex((s) => s.id === cur);
  setShell(SHELLS[(i + 1) % SHELLS.length].id);
}

export function setShell(id: ShellId) {
  document.documentElement.dataset.shell = id;
  try {
    localStorage.setItem("shell", id);
  } catch {}
}
