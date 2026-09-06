import { ImageResponse } from "next/og";

/** 링크 미리보기 — Evening 로비. globals.css의 .dark 토큰 값을 그대로 쓴다 (ImageResponse는 한글 폰트가 없어 영문만). */
export const alt = "Taehwan Jeong — Frontend engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#2c2520", color: "#f3ead9", fontFamily: "Georgia, serif", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "linear-gradient(180deg, #7a5236, #5a3b27)" }} />
        {[720, 900, 1080].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, top: 90, width: 120, height: 400, borderRadius: "60px 60px 0 0", background: "linear-gradient(180deg, #1e2a44 0%, #4a3d55 55%, #c97e4e 100%)", border: "8px solid #3f2a1c", display: "flex" }} />
        ))}
        <div style={{ position: "absolute", left: 80, top: 150, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, lineHeight: 1, letterSpacing: -3 }}>Good evening.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#cdbfa9", fontFamily: "Helvetica, Arial, sans-serif" }}>Taehwan Jeong · Frontend engineer · Seoul</div>
        </div>
        <div style={{ position: "absolute", left: 80, bottom: 190, width: 300, height: 44, background: "linear-gradient(180deg,#d2ac6e,#a8864a)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, letterSpacing: 5, color: "#2b2622", fontFamily: "Georgia, serif" }}>
          TAEHWAN JEONG · FRONTEND
        </div>
      </div>
    ),
    { ...size }
  );
}
