import { CHIBI_BLINK, CHIBI_BOB, CHIBI_COLORS, CHIBI_IDLE } from "./chibi-sprites";

/** 한 줄의 같은 색 연속 구간을 사각형 하나로 */
function Frame({ grid, className }: { grid: string[]; className: string }) {
  const rects: React.ReactNode[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = CHIBI_COLORS[ch];
      if (ch !== "." && fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={fill} />);
      x = end;
    }
  });
  return <g className={className}>{rects}</g>;
}

/**
 * 2등신 캐릭터 — 도트 격자로 그려서 어떤 크기로 키워도 픽셀이 뭉개지지 않는다.
 * 숨쉬기(몸이 1px 오르내림)와 가끔 눈 깜빡임. 동작 줄이기 설정이면 기본 프레임에 멈춘다.
 */
export function Chibi({ className, title = "빨간 홈 유니폼을 입은 정태환의 2등신 픽셀 캐릭터" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 41" shapeRendering="crispEdges" className={["chibi", className].filter(Boolean).join(" ")} role="img" aria-label={title}>
      <Frame grid={CHIBI_IDLE} className="chibi-f chibi-idle" />
      <Frame grid={CHIBI_BOB} className="chibi-f chibi-bob" />
      <Frame grid={CHIBI_BLINK} className="chibi-f chibi-blink" />
    </svg>
  );
}
