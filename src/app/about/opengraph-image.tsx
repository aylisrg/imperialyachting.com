import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "About Imperial Yachting — Dubai Yacht Charter Company";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060E1A 0%, #0B1628 55%, #0E1E37 100%)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: "80px",
            width: "56px",
            height: "3px",
            background: "#C9A84C",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#C9A84C",
              letterSpacing: "6px",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            IMPERIAL YACHTING
          </div>

          <div
            style={{
              fontSize: "82px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
              lineHeight: "1.0",
              marginBottom: "22px",
            }}
          >
            About Us
          </div>

          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.50)",
              fontWeight: 400,
              marginBottom: "36px",
              maxWidth: "800px",
              lineHeight: "1.4",
            }}
          >
            Dubai-based yacht charter &amp; management company at Dubai Harbour
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            {["Est. 2023", "Dubai Harbour", "Fleet Owner", "Not a Broker"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 500,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #C9A84C 70%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "80px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.20)",
            letterSpacing: "1px",
          }}
        >
          imperialyachting.com/about
        </div>
      </div>
    ),
    size,
  );
}
