import "./worlds.css";

/** 1440×900 고정 캔버스 장면들. 부모 `.scene-fit`이 컨테이너 크기에 맞춰 스케일한다. */

export function StadiumScene({ compact = false }: { compact?: boolean }) {
  const tiers = [0, 1, 2, 3, 4, 5];
  const heads: [number, number, number][] = [[-20, -40, 150], [110, -70, 130], [230, -30, 160], [400, -60, 140], [560, -80, 120], [700, -50, 150], [860, -70, 130], [1000, -40, 160], [1160, -70, 140], [1300, -50, 150], [1400, -30, 120]];
  return (
    <div className="scene st" aria-hidden>
      <div className="st-tower" style={{ left: 90 }} /><div className="st-light" style={{ left: 60 }} />
      <div className="st-tower" style={{ left: 1344 }} /><div className="st-light" style={{ left: 1314 }} />
      <div className="st-tiers">
        {tiers.map((k) => (
          <div key={k} className="st-tier" style={{ left: 160 + k * 18, right: 160 + k * 18, top: 200 + k * 26, ["--dot" as string]: 0.3 - k * 0.03, ["--dotsz" as string]: `${5 + k}px` }} />
        ))}
      </div>
      {!compact && (
        <div className="st-board">
          <div className="flex items-baseline justify-between"><span className="caslon text-[22px] text-[#c8ff1e]">각(Gak)</span><span className="caps text-[9px] text-[#7c8a9e]">Detail B · The stadium</span></div>
          <div className="flex gap-[22px]"><span className="caps text-[9px] text-[#eaf0f8]">Screens 3 / 5</span><span className="caps text-[9px] text-[#eaf0f8]">Acceptance 109</span><span className="caps text-[9px] text-[#eaf0f8]">Backend tests 289</span></div>
        </div>
      )}
      <div className="st-pitch-wrap">
        <div className="st-pitch">
          <div className="st-line" style={{ left: 0, right: 0, top: "50%", height: 4, marginTop: -2 }} />
          <div className="st-circle" />
          <div className="st-line" style={{ left: "50%", top: "50%", width: 14, height: 14, margin: "-7px 0 0 -7px", borderRadius: "50%", background: "rgba(255,255,255,0.8)" }} />
          <div className="st-box" style={{ left: 640, top: 0, width: 960, height: 180, borderTop: "none" }} />
          <div className="st-box" style={{ left: 900, top: 0, width: 440, height: 70, borderTop: "none" }} />
          <div className="st-box" style={{ left: 640, bottom: 0, width: 960, height: 180, borderBottom: "none" }} />
          <div className="st-box" style={{ left: 900, bottom: 0, width: 440, height: 70, borderBottom: "none" }} />
        </div>
      </div>
      <div className="st-goal" />
      <div className="st-haze" />
      <div className="st-crowd">
        {heads.map(([x, b, s], i) => (
          <div key={i} className="st-head" style={{ left: x, bottom: b, width: s, height: s * 1.15 }} />
        ))}
      </div>
      <div className="st-crowd-fade" />
      <div className="st-rail" />
    </div>
  );
}

export function ObservatoryScene() {
  const ribs = [-64, -48, -32, -16, 0, 16, 32, 48, 64];
  const seams = [60, 144, 228, 312, 396, 480, 564, 648, 732, 816];
  const leds = ["#5cc9d6", "#5cc9d6", "#3e8aa0", "#f4d9a6", "#5cc9d6", "#2b4c7e", "#5cc9d6"];
  const wall = (side: "l" | "r") => (
    <div className={`ob-wall ob-wall-${side}`}>
      {ribs.map((a) => <div key={a} className="ob-rib" style={{ transform: `rotate(${a}deg)` }} />)}
      {seams.map((y) => <div key={y} className="ob-seam" style={{ top: y }} />)}
    </div>
  );
  return (
    <div className="scene ob" aria-hidden>
      <div className="ob-sky">
        <div className="ob-stars" /><div className="ob-nebula" />
        <div className="ob-planet" /><div className="ob-bands" /><div className="ob-land" />
        <div className="ob-ring" /><div className="ob-ring2" /><div className="ob-moon" /><div className="ob-meteor" />
      </div>
      {wall("l")}{wall("r")}
      <div className="ob-edge" style={{ left: 386, background: "linear-gradient(90deg,#2a3142,#3a4358)" }} />
      <div className="ob-edge" style={{ left: 1040, background: "linear-gradient(270deg,#2a3142,#3a4358)" }} />
      <div className="ob-lamp" />
      <div className="ob-scope"><div className="ob-tube" /><div className="ob-band" style={{ top: 120 }} /><div className="ob-band" style={{ top: 340 }} /></div>
      <div className="ob-fork" /><div className="ob-pier" /><div className="ob-base" />
      <div className="ob-rail" />
      {Array.from({ length: 12 }, (_, i) => <div key={i} className="ob-post" style={{ left: 60 + i * 120 }} />)}
      <div className="ob-deck" />
      <div className="ob-console">
        <div className="flex gap-[10px]">{leds.map((c, i) => <div key={i} className="ob-led" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />)}</div>
        <span className="caps text-[9px] text-[#6a7488]">Dome slit open · tracking planet</span>
        <div className="ml-auto h-[6px] w-[120px] overflow-hidden rounded-[3px] bg-[#151a28]"><div className="h-full w-[68%] bg-[#5cc9d6]" /></div>
      </div>
    </div>
  );
}

export function ArchiveScene() {
  const dust: [number, number, number][] = [[600, 160, 2], [640, 240, 1.5], [700, 120, 2], [760, 300, 1.5], [820, 200, 2], [690, 380, 1.5], [860, 140, 1.5], [730, 470, 2], [650, 520, 1.5], [790, 560, 1.5]];
  return (
    <div className="scene ar" aria-hidden>
      <div className="ar-endwall" /><div className="ar-skylight" />
      <div className="plate absolute left-[610px] top-[96px] h-[42px] w-[220px]"><span className="caslon text-[10px] uppercase tracking-[0.24em] text-[#2b2622]">Archive · Aisle A</span></div>
      <div className="ar-beam" />
      {dust.map(([x, y, s], i) => <div key={i} className="ar-dust" style={{ left: x, top: y, width: s, height: s }} />)}
      <div className="ar-shelf ar-shelf-l"><div className="ar-labels" /><div className="ar-plaster" /><div className="ar-shade-l" /></div>
      <div className="ar-shelf ar-shelf-r"><div className="ar-labels" /><div className="ar-plaster" /><div className="ar-shade-r" /></div>
      <div className="ar-floor"><div className="ar-runner" /></div>
      <div className="ar-rail" style={{ left: 226 }} /><div className="ar-rail" style={{ left: 282 }} />
      {Array.from({ length: 10 }, (_, k) => <div key={k} className="ar-rung" style={{ left: 228 - k * 9, top: 250 + k * 44 }} />)}
      <div className="ar-sign"><span className="caps text-[9px]">Aisle A · Tokens → Themes</span></div>
      <div className="ar-desk" /><div className="ar-desk-edge" /><div className="ar-desk-line" />
      <div className="ar-box" style={{ left: 120, width: 170, height: 120, background: "linear-gradient(180deg,#c9b79b,#a98f6e)" }}><div className="ar-box-label" style={{ left: 24, top: 30, width: 110, height: 34 }}>Tokens · v0.2</div></div>
      <div className="ar-box" style={{ left: 300, width: 150, height: 100, background: "linear-gradient(180deg,#b8a283,#98805f)" }}><div className="ar-box-label" style={{ left: 20, top: 26, width: 100, height: 30 }}>Components</div></div>
      <div className="ar-lamp-stem" /><div className="ar-lamp-shade" /><div className="ar-lamp-glow" /><div className="ar-lamp-foot" />
    </div>
  );
}

export const WORLDS = {
  gak: { letter: "B", place: "The stadium", placeKo: "경기장", Scene: StadiumScene },
  orbit: { letter: "C", place: "The observatory", placeKo: "천문대", Scene: ObservatoryScene },
  "usetaehwan-ui": { letter: "A", place: "The archive", placeKo: "보관소", Scene: ArchiveScene },
} as const;

export type WorldSlug = keyof typeof WORLDS;
export function isWorldSlug(s: string): s is WorldSlug { return s in WORLDS; }
