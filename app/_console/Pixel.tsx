/**
 * 픽셀 스프라이트 — 문자 격자를 SVG 사각형으로 그린다.
 * 한 줄의 같은 색 연속 구간은 사각형 하나로 합쳐 노드 수를 줄인다. '.'은 투명.
 */

type Sprite = { grid: string[]; colors: Record<string, string> };

const INK = "var(--color-pixel-0)";

export const SPRITES = {
  map: { colors: {k:INK,w:"var(--color-lcd-hi)",g:"var(--color-green)",b:"var(--color-blue)",y:"var(--color-gold)"},
    grid:["................","..kkkkkkkkkkkk..","..kwwwwwgwwwwk..","..kwggggggwwwk..","..kwgwyyygwwwk..","..kwwwywyggwwk..","..kwwwywywgwwk..","..kwyyywyygwwk..","..kwywwwwygwwk..","..kwybbwwywwwk..","..kwybbwwyyywk..","..kwwbbwwwww wk..".replace(" ",""),"..kwwwwwwwwwwk..","..kkkkkkkkkkkk..","................","................"] },
  caster: {colors:{k:INK,b:"var(--color-teal-dark)",w:"var(--color-lcd-hi)",g:"var(--color-teal)"},
    grid:["................","...kkkkkkkkkk...","..kbbbbbbbbbbk..","..kbkkkkkkkkbk..","..kbkwwwwwwkbk..","..kbkwwggwwkbk..","..kbkwggggwkbk..","..kbkwwggwwkbk..","..kbkwggggwkbk..","..kbkkkkkkkkbk..","..kbbbbbbbbbbk..","..kbwwbbbwwbbk..","..kbbbbbbbbbbk..","...kkkkkkkkkk...","................","................"] },

  /** 트레이너 — 모자 쓴 아이, 가방을 멘 개발자 */
  trainer: {
    colors: { k: INK, r: "var(--color-pixel-25)", R: "var(--color-pixel-16)", s: "var(--color-pixel-30)", w: "var(--color-pixel-32)", b: "var(--color-pixel-3)", B: "var(--color-pixel-1)", y: "var(--color-pixel-26)", g: "var(--color-pixel-14)" },
    grid: [
      "................",
      ".....kkkkkk.....",
      "....krrrrRRk....",
      "...krrwwrrRRk...",
      "...kkkkkkkkkkk..",
      "...ksssssssk....",
      "...kskssksk.....",
      "...ksssssssk....",
      "....kssrrsk.....",
      ".....kkkkk......",
      "....kbbbbbbk....",
      "...kkbbwwbbkk...",
      "..ksbbbbbbbbsk..",
      "...kkBBBBBBkk...",
      "....kbbkkbbk....",
      "....kkk..kkk....",
    ],
  },
  /** 도감 기계 — 프로젝트 목록 */
  dex: {
    colors: { k: INK, r: "var(--color-pixel-25)", R: "var(--color-pixel-16)", b: "var(--color-pixel-7)", B: "var(--color-pixel-3)", y: "var(--color-pixel-29)", g: "var(--color-pixel-12)", w: "var(--color-pixel-24)", W: "var(--color-pixel-18)" },
    grid: [
      "................",
      "..kkkkkkkkkkkk..",
      "..krrrrrrrrrRk..",
      "..krkkkkryrgRk..",
      "..krkbbBkrrrRk..",
      "..krkbBBkrrrRk..",
      "..krkkkkrrrrRk..",
      "..krrrrrrrrrRk..",
      "..krkkkkkkkkRk..",
      "..krkwwwwwwkRk..",
      "..krkwWWwwwkRk..",
      "..krkwwwWWwkRk..",
      "..krkkkkkkkkRk..",
      "..krrrrrrrrrRk..",
      "..kkkkkkkkkkkk..",
      "................",
    ],
  },
  /** 지도 핀과 하트 — 오늘어디 */
  pin: {
    colors: { k: INK, c: "var(--color-pixel-coral)", C: "var(--color-pixel-coral-dark)", w: "var(--color-pixel-32)", g: "var(--color-pixel-23)" },
    grid: [
      "................",
      ".....kkkkkk.....",
      "....kcccccck....",
      "...kccwwcwwcck..",
      "...kcwwwwwwwck..",
      "...kcwwwwwwwck..",
      "...kccwwwwwcCk..",
      "...kcccwwwccCk..",
      "....kcccwcCCk...",
      "....kccccCCCk...",
      ".....kcccCCk....",
      "......kccCk.....",
      ".......kCk......",
      "........k.......",
      "......gggg......",
      "................",
    ],
  },
  /** 밥그릇과 젓가락 — 끼니 */
  bowl: {
    colors: { k: INK, w: "var(--color-pixel-32)", W: "var(--color-pixel-23)", s: "var(--color-pixel-23)", o: "var(--color-pixel-19)", p: "var(--color-pixel-persimmon)", P: "var(--color-pixel-persimmon-dark)", y: "var(--color-pixel-29)" },
    grid: [
      "................",
      "....s...s.......",
      ".....s...s...o..",
      "....s...s...o...",
      "...........o....",
      "..kkkkkkkkkokk..",
      ".kwwwwwwwwowwwk.",
      ".kwWwwwWwowWwwk.",
      ".kkkkkkkkkkkkkk.",
      ".kpppppppppppPk.",
      "..kpppyyyypPPk..",
      "..kpppppppPPPk..",
      "...kpppppPPPk...",
      "....kkkkkkkk....",
      ".....kPPPPk.....",
      "......kkkk......",
    ],
  },
  /** 젖병 — 쪽쪽 */
  bottle: {
    colors: { k: INK, p: "var(--color-pixel-peach)", P: "var(--color-pixel-peach-dark)", m: "var(--color-pixel-mint)", w: "var(--color-pixel-32)", g: "var(--color-pixel-23)" },
    grid: [
      ".......kk.......",
      "......kppk......",
      "......kppk......",
      ".....kpppPk.....",
      "....kkkkkkkk....",
      "....kmmmmmmk....",
      "....kkkkkkkk....",
      "....kwwwwwgk....",
      "....kwkkwwgk....",
      "....kwwwwwgk....",
      "....kwkkwwgk....",
      "....kppppppk....",
      "....kppppPPk....",
      "....kpkkpPPk....",
      "....kppppPPk....",
      ".....kkkkkk.....",
    ],
  },
  /** 축구공 — 각(Gak) */
  ball: {
    colors: { k: INK, w: "var(--color-pixel-32)", g: "var(--color-pixel-23)" },
    grid: [
      ".....kkkkkk.....",
      "...kkwwwwwwkk...",
      "..kwwwwkkwwwwk..",
      ".kwwwwkkkkwwwgk.",
      ".kwwwwkkkkwwwgk.",
      "kkwwwwwkkwwwwwgk",
      "kkkwwwwwwwwwwkkk",
      "kkkkwwwwwwwwkkkk",
      "kkkwwwwwwwwwwkkk",
      "kwwwwwkkkwwwwwgk",
      "kwwwwkkkkkwwwwgk",
      ".kwwwkkkkkwwwgk.",
      ".kwwwwkkkwwwggk.",
      "..kgwwwwwwwggk..",
      "...kkggggggkk...",
      ".....kkkkkk.....",
    ],
  },
  /** 행성 — Orbit */
  planet: {
    colors: { k: INK, l: "var(--color-pixel-20)", c: "var(--color-pixel-6)", d: "var(--color-pixel-2)", y: "var(--color-pixel-29)", Y: "var(--color-pixel-19)" },
    grid: [
      "..............y.",
      ".....kkkkkk..yy.",
      "...kkllccccky...",
      "..kllccccccdk...",
      ".klccccccccyYk..",
      ".klcccccccyYdk..",
      "kcccccccyyYcddk.",
      "kccccccyYcccddk.",
      "kcccccyYccccddk.",
      "kccccyYcccccddk.",
      ".kcyyYccccccdk..",
      ".kyYcccccccddk..",
      "yyYkcccccddkk...",
      "yY..kkddddk.....",
      ".....kkkkk......",
      "................",
    ],
  },
  /** 토큰 블록 — useTaehwan()/ui */
  blocks: {
    colors: { k: INK, a: "var(--color-pixel-17)", A: "var(--color-pixel-13)", o: "var(--color-pixel-10)", O: "var(--color-pixel-5)", e: "var(--color-pixel-28)", E: "var(--color-pixel-22)", w: "var(--color-pixel-32)" },
    grid: [
      "................",
      ".....kkkkkk.....",
      ".....kwaaaAk....",
      ".....kaaaaAk....",
      ".....kaaaaAk....",
      ".....kAAAAAk....",
      "..kkkkkkkkkkkk..",
      "..kweeeEkwoooOk.",
      "..keeeeEkooooOk.",
      "..keeeeEkooooOk.",
      "..kEEEEEkOOOOOk.",
      "..kkkkkkkkkkkkk.",
      "................",
      "..kkkkkkkkkkkk..",
      "................",
      "................",
    ],
  },
  /** 기술머신 디스크 — AI 노트 */
  disk: {
    colors: { k: INK, p: "var(--color-pixel-8)", P: "var(--color-pixel-4)", w: "var(--color-pixel-32)", g: "var(--color-pixel-23)" },
    grid: [
      "................",
      "..kkkkkkkkkkkk..",
      "..kpppwwwwppPk..",
      "..kpppwwkwppPk..",
      "..kpppwwkwppPk..",
      "..kpppwwwwppPk..",
      "..kppppppppppk..",
      "..kpgggggggggk..",
      "..kpgwwwwwwwgk..",
      "..kpgggggggggk..",
      "..kpgwwwwwwwgk..",
      "..kpgggggggggk..",
      "..kpgwwwwwgggk..",
      "..kPPPPPPPPPPk..",
      "..kkkkkkkkkkkk..",
      "................",
    ],
  },
  /** 트로피 */
  trophy: {
    colors: { k: INK, y: "var(--color-pixel-29)", Y: "var(--color-pixel-21)", w: "var(--color-pixel-31)", b: "var(--color-pixel-9)" },
    grid: [
      "................",
      "..kkkkkkkkkkkk..",
      ".kkywwyyyyyyYkk.",
      "kykywyyyyyyyYkyk",
      "kyky.yyyyyyyYkyk",
      ".kkywyyyyyyyYkk.",
      "..kywyyyyyyyYk..",
      "...kyyyyyyyYk...",
      "....kkyyyyYkk...",
      "......kyYk......",
      "......kyYk......",
      ".....kyyyYk.....",
      "....kkkkkkkk....",
      "....kbbbbbbk....",
      "....kkkkkkkk....",
      "................",
    ],
  },
  /** 편지 — 통신 */
  letter: {
    colors: { k: INK, w: "var(--color-pixel-32)", h: "var(--color-pixel-27)", r: "var(--color-pixel-25)" },
    grid: [
      "................",
      "................",
      "................",
      ".kkkkkkkkkkkkkk.",
      ".kwkhhhhhhhhkwk.",
      ".kwwkhhhhhhkwwk.",
      ".kwwwkhhhhkwwwk.",
      ".kwwwwkrrkwwwwk.",
      ".kwwwwwrrwwwwwk.",
      ".kwwwwkwwkwwwwk.",
      ".kwwwkwwwwkwwwk.",
      ".kwwkwwwwwwkwwk.",
      ".khkhhhhhhhhkhk.",
      ".kkkkkkkkkkkkkk.",
      "................",
      "................",
    ],
  },
  /** 톱니 — 설정 */
  gear: {
    colors: { k: INK, g: "var(--color-pixel-15)", G: "var(--color-pixel-11)", w: "var(--color-pixel-27)" },
    grid: [
      "................",
      "......kkkk......",
      "..kk..kggk..kk..",
      "..kgkkkggkkkgk..",
      "...kggggggggk...",
      "..kggggkkggggk..",
      "kkkgggkwwkgggkkk",
      "kgggggkwwkgggGGk",
      "kgggggkwwkgggGGk",
      "kkkgggkwwkgGGkkk",
      "..kggggkkgGGGk..",
      "...kgggggGGGk...",
      "..kGkkkGGkkkGk..",
      "..kk..kGGk..kk..",
      "......kkkk......",
      "................",
    ],
  },
} satisfies Record<string, Sprite>;

export type SpriteName = keyof typeof SPRITES;


function pixels(grid: string[], colors: Record<string, string>) {
  const rects: React.ReactNode[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = colors[ch];
      if (ch !== "." && fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={fill} />);
      x = end;
    }
  });
  return rects;
}

/** Three hand-authored poses, animated with CSS so no timer runs in React. */
export function Pixel({ name, className, title, animated = false }: {
  name: SpriteName; className?: string; title?: string; animated?: boolean;
}) {
  const { grid, colors } = SPRITES[name] as Sprite;
  const animate = animated && name === "trainer";
  const blink = [...grid];
  blink[6] = "...kssssssk.....";
  blink[7] = "...kskssksk.....";
  const wave = [...grid];
  wave[9] = ".....kkkkk..ksk.";
  wave[10] = "....kbbbbbbksk..";
  wave[11] = "...kkbbwwbbkk...";
  wave[12] = "..ksbbbbbbbbk...";
  return (
    <svg viewBox={`0 0 ${grid[0].length} ${grid.length}`} shapeRendering="crispEdges"
      className={[className, animate ? "pixel-animated" : ""].filter(Boolean).join(" ")}
      role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {animate ? <>
        <g className="pixel-frame pixel-frame-idle">{pixels(grid, colors)}</g>
        <g className="pixel-frame pixel-frame-blink">{pixels(blink, colors)}</g>
        <g className="pixel-frame pixel-frame-wave">{pixels(wave, colors)}</g>
      </> : pixels(grid, colors)}
    </svg>
  );
}
