"use client";

import { useSyncExternalStore } from "react";
import { MUSIC_TRACKS, type MusicTrackId } from "./music";

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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sound", "data-shell", "data-music", "data-music-track", "data-music-volume", "data-zoom"] });
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

/** Music preferences are separate from the button sound channel. */
export function useMusic(): boolean {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset.music === "on", () => false);
}
export function useMusicTrack(): MusicTrackId {
  return useSyncExternalStore(subscribe, () => {
    const id = document.documentElement.dataset.musicTrack;
    return MUSIC_TRACKS.find(track => track.id === id)?.id ?? "walk";
  }, () => "walk");
}
export function useMusicVolume(): number {
  return useSyncExternalStore(subscribe, () => {
    const value = Number(document.documentElement.dataset.musicVolume ?? "30");
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 30;
  }, () => 30);
}
export function setMusic(on: boolean) {
  document.documentElement.dataset.music = on ? "on" : "off";
  // 켜짐은 이번 방문에만 — 새로 들어오면 늘 꺼진 채 시작한다 (곡 · 음량은 계속 기억)
  try { sessionStorage.setItem("music", on ? "on" : "off"); } catch {}
}
export function setMusicTrack(track: MusicTrackId) {
  document.documentElement.dataset.musicTrack = track;
  try { localStorage.setItem("music-track", track); } catch {}
}
export function setMusicVolume(value: number) {
  const volume = String(Math.max(0, Math.min(100, Number.isFinite(value) ? value : 30)));
  document.documentElement.dataset.musicVolume = volume;
  try { localStorage.setItem("music-volume", volume); } catch {}
}

/** 크게 보기 — 기기 껍데기를 걷고 두 화면이 브라우저 전체를 채운다 */
export function useZoom(): boolean {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset.zoom === "on", () => false);
}
export function setZoom(on: boolean) {
  document.documentElement.dataset.zoom = on ? "on" : "off";
  try { localStorage.setItem("zoom", on ? "on" : "off"); } catch {}
}
export function toggleZoom() {
  setZoom(document.documentElement.dataset.zoom !== "on");
}
