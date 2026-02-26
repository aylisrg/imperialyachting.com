import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Our Fleet — Luxury Yachts for Charter in Dubai | Imperial Yachting";
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
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,182,208,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)",
          }}
        />

        {/* Gold accent line */}
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

        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: "56px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "50px",
            border: "1px solid rgba(52,182,208,0.3)",
            background: "rgba(52,182,208,0.08)",
            fontSize: "13px",
            fontWeight: 600,
            color: "rgba(52,182,208,0.9)",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Fleet Owner — Not a Broker
        </div>

        {/* Content */}
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
              marginBottom: "20px",
            }}
          >
            Our Fleet
          </div>

          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.50)",
              fontWeight: 400,
              marginBottom: "36px",
            }}
          >
            Premium motor yachts for charter at Dubai Harbour
          </div>

          {/* Yacht models row */}
          <div style={{ display: "flex", gap: "16px" }}>
            {["Van Dutch 40", "Monte Carlo 65", "Evo Yachts", "Dubai Harbour"].map((item) => (
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

        {/* Bottom line */}
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
          imperialyachting.com/fleet
        </div>
      </div>
    ),
    size,
  );
}
