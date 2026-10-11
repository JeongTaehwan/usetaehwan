import { ME_COLORS, ME_DRUM1, ME_DRUM2, ME_KIT1, ME_KIT2 } from "./me-sprites";

/** 한 줄의 같은 색 연속 구간을 사각형 하나로 */
function Frame({ grid, className }: { grid: string[]; className: string }) {
  const rects: React.ReactNode[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = ME_COLORS[ch];
      if (ch !== "." && fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={fill} />);
      x = end;
    }
  });
  return <g className={className}>{rects}</g>;
}

/**
 * 내 캐릭터 — 유니폼 차림으로 공을 튀기다가, 드럼을 친다. 몇 초마다 번갈아 보인다.
 * 동작 줄이기 설정이면 유니폼 첫 프레임에 멈춘다.
 */
export function Me({ className, title = "정태환의 픽셀 캐릭터 — 빨간 유니폼으로 공을 튀기고, 드럼을 친다" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" shapeRendering="crispEdges" className={["me", className].filter(Boolean).join(" ")} role="img" aria-label={title}>
      <g className="me-pose me-pose-kit">
        <Frame grid={ME_KIT1} className="me-f me-f1" />
        <Frame grid={ME_KIT2} className="me-f me-f2" />
      </g>
      <g className="me-pose me-pose-drum">
        <Frame grid={ME_DRUM1} className="me-f me-f1" />
        <Frame grid={ME_DRUM2} className="me-f me-f2" />
      </g>
    </svg>
  );
}
