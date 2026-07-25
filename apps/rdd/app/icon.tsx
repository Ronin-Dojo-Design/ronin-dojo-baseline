import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";
export const runtime = "edge";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0d0f12",
        border: "1px solid #2a2f37",
        borderRadius: 6,
        color: "#3b82f6",
        display: "flex",
        fontFamily: '"Arial Narrow", Arial, sans-serif',
        fontSize: 22,
        fontWeight: 800,
        height: "100%",
        justifyContent: "center",
        lineHeight: 1,
        position: "relative",
        width: "100%",
      }}
    >
      R
      <div
        style={{
          background: "#3b82f6",
          bottom: 3,
          height: 2,
          left: 8,
          position: "absolute",
          width: 16,
        }}
      />
    </div>,
    size,
  );
}
