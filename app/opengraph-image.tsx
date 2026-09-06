import { ImageResponse } from "next/og";

/**
 * 링크 공유 미리보기(OG) 이미지 — 청사진(blueprint) 버전.
 * globals.css 다크 토큰과 같은 값: paper #0f2a5e · ink #f4f7ff · mark #ffc857.
 * ImageResponse는 별도 폰트 파일 없이는 한글을 못 그리므로 영문만 쓴다.
 */
export const alt = "useTaehwan() — A frontend engineer, drafted.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#0f2a5e";
const INK = "#f4f7ff";
const INK_3 = "#8ea0cc";
const MARK = "#ffc857";
const LINE = "rgba(232,238,255,0.5)";
const MONO = "ui-monospace, Menlo, monospace";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 40,
          background: PAPER,
          backgroundImage:
            "linear-gradient(to right, rgba(232,238,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,238,255,0.14) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: INK,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: `2px solid ${LINE}`,
            padding: "36px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: 3,
              color: INK_3,
              textTransform: "uppercase",
            }}
          >
            <span>Drawing no. UT-2026-01</span>
            <span>Sheet 00 · Cover</span>
            <span>Scale 1:1 · Seoul</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", letterSpacing: -4, lineHeight: 0.95 }}>
            <div style={{ display: "flex", fontSize: 108, fontWeight: 700 }}>Frontend engineer,</div>
            <div style={{ display: "flex", fontSize: 108, fontWeight: 700, color: MARK }}>drafted.</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: `2px solid ${LINE}`,
              paddingTop: 24,
            }}
          >
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
              <span>useTaehwan</span>
              <span style={{ fontFamily: MONO, color: MARK, fontWeight: 400 }}>()</span>
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: MONO,
                fontSize: 20,
                letterSpacing: 3,
                color: INK_3,
                textTransform: "uppercase",
              }}
            >
              commerce frontend · measured AI workflow · rev 2.0
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
