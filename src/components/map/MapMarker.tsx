"use client";

import type { MapPosition, DestinationCategory } from "@/types/common";

interface MapMarkerProps {
  position: MapPosition;
  label: string;
  category: DestinationCategory;
  isActive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isHome?: boolean;
  onHover: (entering: boolean) => void;
  onClick: () => void;
}

export function MapMarker({
  position,
  label,
  category,
  isActive,
  isHighlighted,
  isDimmed,
  isHome,
  onHover,
  onClick,
}: MapMarkerProps) {
  const baseOpacity = isDimmed ? 0.25 : 1;

  const markerColor = isHome
    ? "#C9A84C"
    : isActive
      ? "#C9A84C"
      : isHighlighted
        ? "#D4B96A"
        : "#ffffff";

  const markerOpacity = isHome ? 1 : baseOpacity;

  // Category-specific icon paths (tiny, centered at 0,0)
  const iconPath = getCategoryIcon(category, isHome);

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      className="cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      role="button"
      aria-label={label}
    >
      {/* Outer glow ring for active/highlighted */}
      {(isActive || isHighlighted) && !isDimmed && (
        <circle
          r={isActive ? 20 : 16}
          fill="none"
          stroke="#C9A84C"
          strokeWidth={1}
          opacity={isActive ? 0.4 : 0.2}
          className={isActive ? "map-marker-active" : "map-marker-highlighted"}
        />
      )}

      {/* Pulse ring */}
      {!isDimmed && (
        <circle
          r={isHome ? 14 : 12}
          fill="none"
          stroke={markerColor}
          strokeWidth={0.5}
          opacity={0.3}
          className="map-marker"
        />
      )}

      {/* Main marker circle */}
      <circle
        r={isHome ? 10 : 7}
        fill={isHome ? "#C9A84C" : isActive ? "#C9A84C" : "#121F3D"}
        stroke={markerColor}
        strokeWidth={isHome ? 2 : 1.5}
        opacity={markerOpacity}
        className="transition-all duration-300"
      />

      {/* Category icon */}
      <g
        transform="translate(-5, -5) scale(0.42)"
        fill={isHome || isActive ? "#0A1628" : markerColor}
        opacity={markerOpacity}
      >
        <path d={iconPath} />
      </g>

      {/* Label */}
      <text
        y={isHome ? 22 : 18}
        textAnchor="middle"
        className="fill-white/60 text-[10px] font-medium"
        style={{ fontFamily: "var(--font-heading)" }}
        opacity={isDimmed ? 0.2 : 0.7}
      >
        {label}
      </text>
    </g>
  );
}

function getCategoryIcon(category: DestinationCategory, isHome?: boolean): string {
  if (isHome) {
    // Anchor icon
    return "M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V11H8l-4 7h3v4h10v-4h3l-4-7h-3V7.8c1.2-.4 2-1.5 2-2.8a3 3 0 0 0-3-3z";
  }
  switch (category) {
    case "experience":
      // Compass icon
      return "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm3.5 6.5l-2 5-5 2 2-5 5-2z";
    case "activity":
      // Zap/lightning icon
      return "M13 2L3 14h9l-1 8 10-12h-9l1-8z";
    default:
      // MapPin icon
      return "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z";
  }
}
