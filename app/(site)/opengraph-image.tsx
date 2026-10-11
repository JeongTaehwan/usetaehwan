import { ImageResponse } from "next/og";

export const alt = "Taehwan Jeong — Frontend engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** v5 공유 이미지 — 종이색 바탕에 이름과 한 줄 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "88px 96px", background: "#fbfaf7", color: "#1b1c1e", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", fontSize: 26, color: "#6c6f76", letterSpacing: 1 }}>useTaehwan()</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3 }}>Taehwan Jeong</div>
        <div style={{ marginTop: 18, fontSize: 34, color: "#46484d" }}>Frontend engineer · Seoul</div>
        <div style={{ marginTop: 36, fontSize: 26, lineHeight: 1.5, color: "#6c6f76", maxWidth: 900 }}>
          Commerce frontend for 3 years 10 months — payments, settlement, coupons, and the boundaries with external systems.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#46484d" }}>
        <div style={{ width: 40, height: 6, background: "#9a4f37" }} />
        usetaehwan.page
      </div>
    </div>,
    size,
  );
}
