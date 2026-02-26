import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Imperial Yachting — Social Media & Videos";
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
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Social channel icons row */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "32px", position: "relative" }}>
          {/* YouTube icon */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "16px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(239,68,68,0.9)">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>

          {/* Instagram icon */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "16px",
              background: "rgba(236,72,153,0.12)",
              border: "1px solid rgba(236,72,153,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="rgba(236,72,153,0.9)">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
              lineHeight: "1.0",
              marginBottom: "18px",
            }}
          >
            Follow Our Journey
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.48)",
              fontWeight: 400,
              marginBottom: "32px",
            }}
          >
            Yacht tours, charters &amp; Dubai coastline adventures
          </div>

          {/* Channel tags */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.25)",
                background: "rgba(239,68,68,0.08)",
                fontSize: "15px",
                color: "rgba(239,68,68,0.85)",
                fontWeight: 500,
              }}
            >
              @imperial_wave
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(236,72,153,0.25)",
                background: "rgba(236,72,153,0.08)",
                fontSize: "15px",
                color: "rgba(236,72,153,0.85)",
                fontWeight: 500,
              }}
            >
              @dubai.yachts.rental
            </div>
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
            top: "56px",
            left: "80px",
            width: "56px",
            height: "3px",
            background: "#C9A84C",
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
          imperialyachting.com/blog
        </div>
      </div>
    ),
    size,
  );
}
