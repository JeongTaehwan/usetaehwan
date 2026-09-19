"use client";
let context: AudioContext | undefined;
export function playSfx(kind: "move" | "confirm" | "cancel") {
  try {
    context ??= new AudioContext();
    void context.resume();
    const now = context.currentTime;
    const tones = kind === "move" ? [660] : kind === "confirm" ? [660, 990] : [440, 280];
    tones.forEach((frequency, i) => {
      const osc = context!.createOscillator();
      const gain = context!.createGain();
      const start = now + i * 0.065;
      osc.type = "square";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.025, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
      osc.connect(gain).connect(context!.destination);
      osc.start(start); osc.stop(start + 0.065);
    });
  } catch { /* 오디오를 사용할 수 없어도 조작은 계속된다. */ }
}
