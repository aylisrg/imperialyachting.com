import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Imperial Yachting — Luxury Yacht Charter in Dubai";
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
        {/* Decorative orb top-right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Decorative orb bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,182,208,0.05) 0%, transparent 65%)",
          }}
        />

        {/* Gold accent line top-left */}
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

        {/* Main content */}
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
          {/* Eyebrow */}
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
            DUBAI HARBOUR
          </div>

          {/* Title */}
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
            IMPERIAL YACHTING
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.50)",
              fontWeight: 400,
              marginBottom: "36px",
              lineHeight: "1.4",
            }}
          >
            Luxury Yacht Charter &amp; Management in Dubai
          </div>

          {/* Rating pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 28px",
              borderRadius: "50px",
              border: "1px solid rgba(201,168,76,0.25)",
              background: "rgba(201,168,76,0.07)",
            }}
          >
            <span
              style={{
                color: "#C9A84C",
                fontSize: "18px",
                letterSpacing: "3px",
              }}
            >
              ★★★★★
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              5.0 · Dubai Harbour Yacht Club
            </span>
          </div>
        </div>

        {/* Bottom gold gradient line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #C9A84C 70%, transparent 100%)",
          }}
        />

        {/* URL */}
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
          imperialyachting.com
        </div>
      </div>
    ),
    size,
  );
}
