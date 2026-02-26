import { ImageResponse } from "next/og";
import { fetchYachtBySlug } from "@/lib/yachts-db";

export const runtime = "edge";
export const alt = "Imperial Yachting — Luxury Yacht Charter Dubai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const yacht = await fetchYachtBySlug(slug);

  if (!yacht) {
    // Fallback branded image
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
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800, color: "white" }}>
            Imperial Yachting
          </div>
        </div>
      ),
      size,
    );
  }

  const heroImage = yacht.heroImage || yacht.images[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Background: yacht hero image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Gradient overlay — dark at bottom for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(6,14,26,0.97) 0%, rgba(6,14,26,0.65) 45%, rgba(6,14,26,0.15) 100%)",
          }}
        />

        {/* Top-left brand badge */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "60px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 20px",
            borderRadius: "50px",
            border: "1px solid rgba(201,168,76,0.30)",
            background: "rgba(6,14,26,0.70)",
            backdropFilter: "blur(8px)",
            fontSize: "13px",
            fontWeight: 600,
            color: "#C9A84C",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          IMPERIAL YACHTING
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 60px 48px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Yacht name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              lineHeight: "1.0",
              marginBottom: "10px",
              letterSpacing: "-1px",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {yacht.name}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.70)",
              fontWeight: 400,
              marginBottom: "24px",
            }}
          >
            {yacht.tagline}
          </div>

          {/* Specs row */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              `${yacht.length.feet}ft ${yacht.builder}`,
              `Up to ${yacht.capacity} guests`,
              "Dubai Harbour",
              "All-inclusive",
            ].map((spec, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 16px",
                  borderRadius: "50px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.07)",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.60)",
                  fontWeight: 500,
                  backdropFilter: "blur(4px)",
                }}
              >
                {spec}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gold line */}
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
      </div>
    ),
    size,
  );
}
