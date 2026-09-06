import { ImageResponse } from "next/og";

/**
 * 링크 공유 미리보기(OG) 이미지. 디자인 시스템 토큰 값을 그대로 씀 —
 * bg #FDFBF7 · fg #201D19 · brand #A55E45 · border #E6E1D6.
 * ImageResponse는 별도 폰트 파일을 주지 않으면 한글을 못 그리므로 영문만 쓴다.
 */
export const alt = "useTaehwan() — A frontend engineer, documented.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FDFBF7",
          color: "#201D19",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 26,
            color: "#8A8577",
          }}
        >
          <span>// frontend engineer, Seoul</span>
          <span>usetaehwan.page</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 1.05, letterSpacing: -2 }}>
            A frontend engineer,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontStyle: "italic",
              color: "#A55E45",
            }}
          >
            documented.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px solid #E6E1D6",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 40 }}>
            <span>useTaehwan</span>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace", color: "#A55E45" }}>()</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 24,
              color: "#8A8577",
            }}
          >
            design system · measured AI workflow · commerce frontend
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
