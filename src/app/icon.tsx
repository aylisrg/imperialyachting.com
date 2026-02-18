import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "14px",
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-1px",
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
