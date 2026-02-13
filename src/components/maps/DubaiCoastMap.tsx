"use client";

import { useState, useMemo } from "react";
import { MapPin, ChevronRight } from "lucide-react";
import type { Destination, DestinationCategory } from "@/types/common";

interface DubaiCoastMapProps {
  destinations: Destination[];
  highlightSlug?: string;
  compact?: boolean;
  onMarkerClick?: (slug: string) => void;
}

// Dubai coast bounding box for coordinate → percent mapping
const LAT_MIN = 25.05;
const LAT_MAX = 25.26;
const LNG_MIN = 55.08;
const LNG_MAX = 55.22;

function toPercent(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100,
  };
}

const categoryColors: Record<string, string> = {
  destination: "bg-gold-500",
  experience: "bg-sea-400",
  activity: "bg-sea-500",
};

export function DubaiCoastMap({
  destinations,
  highlightSlug,
  compact = false,
  onMarkerClick,
}: DubaiCoastMapProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const markers = useMemo(
    () =>
      destinations
        .filter((d) => d.latitude && d.longitude)
        .map((d) => ({
          ...d,
          pos: toPercent(d.latitude!, d.longitude!),
        })),
    [destinations]
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/5 ${
        compact ? "aspect-[16/9]" : "aspect-[21/9] sm:aspect-[21/9]"
      }`}
      role="img"
      aria-label="Interactive map of Dubai yacht destinations"
    >
      {/* Ocean background */}
      <div className="absolute inset-0 bg-navy-800">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-700/50 via-navy-800 to-navy-900/90" />

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* SVG coastline illustration */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 430"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Dubai coastline */}
        <path
          d="M 0 350 Q 100 340 200 330 Q 300 310 380 320 Q 420 325 440 310 Q 460 295 480 300 Q 520 310 560 305 Q 620 290 680 300 Q 740 310 800 305 Q 860 300 920 310 Q 960 315 1000 320"
          stroke="rgba(201,168,76,0.12)"
          strokeWidth="2"
          fill="rgba(201,168,76,0.02)"
        />

        {/* Palm Jumeirah shape (simplified fronds) */}
        <g transform="translate(410, 200)" opacity="0.15">
          {/* Trunk */}
          <path
            d="M 0 40 L 0 -10"
            stroke="rgba(201,168,76,0.5)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Crescent */}
          <path
            d="M -45 -15 Q -40 -45 0 -50 Q 40 -45 45 -15"
            stroke="rgba(201,168,76,0.4)"
            strokeWidth="3"
            fill="none"
          />
          {/* Fronds */}
          <path d="M 0 0 L -20 -30" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />
          <path d="M 0 0 L -10 -35" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />
          <path d="M 0 0 L 0 -38" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />
          <path d="M 0 0 L 10 -35" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />
          <path d="M 0 0 L 20 -30" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />
        </g>

        {/* World Islands cluster (dot pattern) */}
        <g transform="translate(550, 100)" opacity="0.12">
          {[
            [0, 0], [8, -12], [-10, -8], [15, 5], [-5, 12],
            [20, -5], [-15, 3], [5, -18], [12, 12], [-8, -15],
            [25, 0], [-20, -2], [10, -25], [0, 20], [-12, 15],
            [18, -18], [-18, 10], [8, 25], [-25, 5], [22, 8],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="rgba(201,168,76,0.5)"
            />
          ))}
        </g>

        {/* Ain Dubai / Bluewaters Island */}
        <g transform="translate(320, 270)" opacity="0.15">
          <circle cx="0" cy="0" r="12" stroke="rgba(201,168,76,0.4)" strokeWidth="2" fill="none" />
          <circle cx="0" cy="0" r="3" fill="rgba(201,168,76,0.3)" />
        </g>

        {/* Marina channel lines */}
        <path
          d="M 340 310 Q 350 290 360 300 Q 370 310 380 295"
          stroke="rgba(42,123,155,0.15)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Decorative label */}
      <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 flex items-center gap-2 text-white/20">
        <MapPin className="w-3.5 h-3.5" />
        <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase">
          Arabian Gulf · Dubai Coast
        </span>
      </div>

      {/* Markers */}
      {markers.map((marker) => {
        const isHighlighted = highlightSlug === marker.slug;
        const isHovered = hoveredSlug === marker.slug;
        const showLabel = isHighlighted || isHovered;
        const color = categoryColors[marker.category] || "bg-gold-500";

        return (
          <div
            key={marker.slug}
            className="absolute z-10"
            style={{
              left: `${Math.min(Math.max(marker.pos.x, 5), 95)}%`,
              top: `${Math.min(Math.max(marker.pos.y, 5), 90)}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Marker dot */}
            <button
              onClick={() => onMarkerClick?.(marker.slug)}
              onMouseEnter={() => setHoveredSlug(marker.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              className={`
                relative rounded-full transition-all duration-300 cursor-pointer
                ${isHighlighted ? `w-4 h-4 ${color} map-marker-active` : `w-3 h-3 ${color} map-marker`}
                ${isHovered && !isHighlighted ? "scale-150" : ""}
              `}
              aria-label={`View ${marker.name}`}
            >
              {/* Ring for highlighted/active marker */}
              {(isHighlighted || isHovered) && (
                <span
                  className={`absolute inset-0 rounded-full ${color} opacity-30 animate-ping`}
                  style={{ animationDuration: "1.5s" }}
                />
              )}
            </button>

            {/* Tooltip */}
            {showLabel && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 whitespace-nowrap pointer-events-none"
              >
                <div className="bg-navy-950/90 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 shadow-xl">
                  <p className="text-xs font-heading font-semibold text-white">
                    {marker.mapLabel || marker.name}
                  </p>
                  {marker.sailingTime && (
                    <p className="text-[10px] text-gold-400/80 mt-0.5">
                      {marker.sailingTime}
                    </p>
                  )}
                  {onMarkerClick && (
                    <p className="text-[10px] text-white/40 mt-1 flex items-center gap-0.5">
                      Click to explore <ChevronRight className="w-2.5 h-2.5" />
                    </p>
                  )}
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-navy-950/90" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
