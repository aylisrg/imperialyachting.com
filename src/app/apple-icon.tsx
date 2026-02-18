import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060E1A",
          borderRadius: "40px",
        }}
      >
        <span
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-2px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          IY
        </span>
      </div>
    ),
    { ...size }
  );
}
