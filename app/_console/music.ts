"use client";

/** Small original scores; no recorded audio or game soundtrack assets. */
export const MUSIC_TRACKS = [
  { id: "walk", label: "산책길", description: "가벼운 멜로디 · 밝고 느긋하게" },
  { id: "desk", label: "작업실", description: "반복되는 아르페지오 · 차분하게" },
  { id: "night", label: "밤하늘", description: "낮은 템포 · 부드럽고 잔잔하게" },
] as const;
export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];
export type MusicStatus = "off" | "waiting" | "playing" | "paused" | "unavailable";

type Score = { bpm: number; melody: number[]; roots: number[]; thirds: number[]; tone: OscillatorType };
const SCORES: Record<MusicTrackId, Score> = {
  walk: {
    bpm: 96, tone: "triangle",
    melody: [72,0,76,79, 81,79,76,0, 74,76,79,0, 76,74,72,0, 69,72,76,0, 79,76,74,72, 71,74,79,0, 76,74,72,0],
    roots: [48,55,53,55], thirds: [4,4,4,4],
  },
  desk: {
    bpm: 80, tone: "sine",
    melody: [64,0,67,0, 71,0,74,71, 69,0,67,0, 64,0,62,0, 60,0,64,67, 69,0,67,64, 62,0,67,0, 64,0,0,0],
    roots: [45,53,48,55], thirds: [3,4,4,4],
  },
  night: {
    bpm: 64, tone: "sine",
    melody: [69,0,0,76, 74,0,72,0, 67,0,0,72, 71,0,67,0, 65,0,0,72, 69,0,67,0, 64,0,67,0, 69,0,0,0],
    roots: [45,48,53,52], thirds: [3,4,4,3],
  },
};

let context: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
let nextTime = 0;
let step = 0;
let activeTrack: MusicTrackId | null = null;
let status: MusicStatus = "off";
let disposed = false;
let unlocked = false;
const voices = new Set<OscillatorNode>();
const listeners = new Set<() => void>();

export function subscribeMusicStatus(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getMusicStatus() { return status; }
export function getServerMusicStatus(): MusicStatus { return "off"; }
function report(next: MusicStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach(listener => listener());
}
function preference() {
  const data = document.documentElement.dataset;
  const track = MUSIC_TRACKS.find(track => track.id === data.musicTrack)?.id ?? "walk";
  const parsed = Number(data.musicVolume ?? "30");
  return {
    on: data.music === "on",
    track,
    volume: Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) / 100 : 0.3,
  };
}
function stop() {
  clearInterval(timer);
  timer = undefined;
  activeTrack = null;
  for (const voice of voices) {
    try { voice.stop(); } catch { /* Already ended. */ }
    voice.disconnect();
  }
  voices.clear();
}

function note(midi: number, start: number, duration: number, amplitude: number, type: OscillatorType) {
  if (!context || !filter || !midi) return;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(amplitude, start + 0.014);
  envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(envelope).connect(filter);
  voices.add(oscillator);
  oscillator.onended = () => {
    voices.delete(oscillator);
    oscillator.disconnect();
    envelope.disconnect();
  };
  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

function schedule() {
  if (!context || !activeTrack || context.state !== "running") return;
  const score = SCORES[activeTrack];
  const eighth = 30 / score.bpm;
  // Rebase after a stalled browser task; never emit a burst of overdue notes.
  if (nextTime < context.currentTime) nextTime = context.currentTime + 0.025;
  while (nextTime < context.currentTime + 0.15) {
    const index = step % score.melody.length;
    const root = score.roots[Math.floor(index / 8) % score.roots.length];
    note(score.melody[index], nextTime, eighth * 1.5, 0.18, score.tone);
    if (index % 4 === 0) note(root, nextTime, eighth * 3.6, 0.15, "triangle");
    const third = score.thirds[Math.floor(index / 8) % score.thirds.length];
    const interval = [0, third, 7, 12][index % 4];
    note(root + 12 + interval, nextTime, eighth * 0.8, 0.045, "sine");
    nextTime += eighth;
    step += 1;
  }
}

async function sync(gesture = false) {
  if (disposed) return;
  const prefs = preference();
  if (!prefs.on) {
    stop();
    if (context?.state === "running") void context.suspend().catch(() => {});
    report("off");
    return;
  }
  if (document.hidden) {
    stop();
    if (context?.state === "running") void context.suspend().catch(() => {});
    report("paused");
    return;
  }
  if (!context) {
    if (!gesture) { report("waiting"); return; }
    try {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = prefs.volume * 0.65;
      filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2200;
      filter.connect(master).connect(context.destination);
    } catch { report("unavailable"); return; }
  }
  if (gesture) unlocked = true;
  const currentContext = context;
  if (currentContext.state !== "running") {
    if (!unlocked) { report("waiting"); return; }
    try { await currentContext.resume(); }
    catch { report("waiting"); return; }
  }
  // A resume promise may resolve after an off/track/visibility change or unmount.
  if (disposed || context !== currentContext) return;
  const latest = preference();
  if (!latest.on || document.hidden) { void sync(); return; }
  if (currentContext.state !== "running") { report("waiting"); return; }
  master!.gain.setTargetAtTime(latest.volume * 0.65, currentContext.currentTime, 0.06);
  if (activeTrack !== latest.track || !timer) {
    stop();
    activeTrack = latest.track;
    step = 0;
    nextTime = currentContext.currentTime + 0.04;
    schedule();
    timer = setInterval(schedule, 50);
  }
  report("playing");
}

/** Root-layout lifetime: client route changes leave this audio engine running. */
export function mountMusic() {
  disposed = false;
  const onGesture = (event: Event) => {
    if (event.isTrusted) void sync(true);
  };
  const onVisibility = () => { void sync(); };
  const onPageHide = () => {
    stop();
    if (context?.state === "running") void context.suspend().catch(() => {});
    report(preference().on ? "paused" : "off");
  };
  const observer = new MutationObserver(() => { void sync(); });
  observer.observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-music", "data-music-track", "data-music-volume"],
  });
  // click handles toggles after React commits the requested preference.
  window.addEventListener("pointerdown", onGesture);
  window.addEventListener("click", onGesture);
  window.addEventListener("keydown", onGesture);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onVisibility);
  void sync();
  return () => {
    disposed = true;
    observer.disconnect();
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("click", onGesture);
    window.removeEventListener("keydown", onGesture);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onVisibility);
    stop();
    const oldContext = context;
    context = null; master = null; filter = null; unlocked = false;
    if (oldContext) void oldContext.close().catch(() => {});
    report("off");
  };
}
