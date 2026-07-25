import { ImageResponse } from "next/og";

export const alt =
  "Ronin Dojo Design — one durable software kernel reshaped into a portfolio of brands";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "edge";

const POSITIONING =
  "A product studio that builds one durable software kernel and reshapes it into a portfolio of brands — so a school, a gym, or a niche business gets a real platform instead of a template.";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#0d0f12",
        color: "#f3f5f7",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
        height: "100%",
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "72px 76px 66px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#3b82f6",
          height: 6,
          left: 76,
          position: "absolute",
          top: 0,
          width: 176,
        }}
      />
      <div
        style={{
          border: "1px solid #2a2f37",
          borderRadius: 999,
          height: 330,
          position: "absolute",
          right: -116,
          top: -126,
          width: 330,
        }}
      />
      <div
        style={{
          border: "1px solid rgba(59, 130, 246, 0.35)",
          borderRadius: 999,
          height: 214,
          position: "absolute",
          right: -58,
          top: -68,
          width: 214,
        }}
      />

      <div
        style={{
          alignItems: "center",
          color: "#9aa3ad",
          display: "flex",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        Product studio
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          letterSpacing: "-0.035em",
          lineHeight: 0.88,
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex", fontSize: 94, fontWeight: 800 }}>Ronin Dojo</div>
        <div style={{ color: "#3b82f6", display: "flex", fontSize: 94, fontWeight: 800 }}>
          Design
        </div>
      </div>

      <div
        style={{
          alignItems: "flex-start",
          borderTop: "1px solid #2a2f37",
          display: "flex",
          paddingTop: 30,
        }}
      >
        <div
          style={{
            color: "#9aa3ad",
            display: "flex",
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 25,
            letterSpacing: "-0.012em",
            lineHeight: 1.42,
            maxWidth: 1010,
          }}
        >
          {POSITIONING}
        </div>
      </div>
    </div>,
    size,
  );
}
