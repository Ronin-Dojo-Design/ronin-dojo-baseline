import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Mammoth Build";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const positioning =
  "Most metal-building companies hand off a kit and vanish. Mammoth stays in the whole project — design, fabrication, sequenced delivery, and construction — with proof at every step.";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#0e0f11",
        color: "#f4f5f6",
        display: "flex",
        fontFamily: '"Saira", "Bahnschrift", "Arial Narrow", system-ui, sans-serif',
        height: "100%",
        overflow: "hidden",
        padding: "48px",
        position: "relative",
        width: "100%",
      }}
    >
      {/*
       * Palette copied from app/globals.css:
       * --bg #0e0f11, --surface-elevated #1f2226, --border #2a2e33,
       * --primary #ff6a1a, --text-primary #f4f5f6, --text-muted #9ba1a8.
       */}
      <div
        style={{
          background: "#ff6a1a",
          height: "10px",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          border: "1px solid #2a2e33",
          bottom: "48px",
          display: "flex",
          left: "48px",
          position: "absolute",
          right: "48px",
          top: "48px",
        }}
      />
      <div
        style={{
          background: "#1f2226",
          bottom: "-180px",
          display: "flex",
          height: "480px",
          position: "absolute",
          right: "-80px",
          transform: "rotate(-18deg)",
          width: "220px",
        }}
      />
      <div
        style={{
          background: "#2a2e33",
          bottom: "-180px",
          display: "flex",
          height: "480px",
          position: "absolute",
          right: "174px",
          transform: "rotate(-18deg)",
          width: "10px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px 58px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: "#9ba1a8",
            display: "flex",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              background: "#ff6a1a",
              display: "flex",
              height: "4px",
              marginRight: "18px",
              width: "64px",
            }}
          />
          Pre-Engineered Metal Buildings
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "990px",
          }}
        >
          <div
            style={{
              alignItems: "baseline",
              display: "flex",
              fontSize: "94px",
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1,
            }}
          >
            <span>Mammoth</span>
            <span style={{ color: "#ff6a1a", marginLeft: "24px" }}>Build</span>
          </div>
          <div
            style={{
              background: "#ff6a1a",
              display: "flex",
              height: "6px",
              marginTop: "28px",
              width: "148px",
            }}
          />
          <p
            style={{
              color: "#f4f5f6",
              fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
              fontSize: "31px",
              fontWeight: 500,
              lineHeight: 1.35,
              margin: "28px 0 0",
              maxWidth: "950px",
            }}
          >
            {positioning}
          </p>
        </div>
      </div>
    </div>,
    size,
  );
}
