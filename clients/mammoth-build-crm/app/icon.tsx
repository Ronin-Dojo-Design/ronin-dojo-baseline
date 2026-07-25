import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0e0f11",
        border: "2px solid #ff6a1a",
        color: "#ff6a1a",
        display: "flex",
        fontFamily: '"Arial Narrow", Arial, sans-serif',
        fontSize: "22px",
        fontWeight: 900,
        height: "100%",
        justifyContent: "center",
        lineHeight: 1,
        width: "100%",
      }}
    >
      M
    </div>,
    size,
  );
}
