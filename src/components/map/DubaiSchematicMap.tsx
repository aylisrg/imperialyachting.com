"use client";

import { useRef, useState, useCallback } from "react";
import { MapMarker } from "@/components/map/MapMarker";
import { RouteLine, type RouteLineHandle } from "@/components/map/RouteLine";
import { YachtIcon } from "@/components/map/YachtIcon";
import { MapTooltip } from "@/components/map/MapTooltip";
import { MAP_POSITIONS } from "@/data/destinations";
import type { Destination, MapPosition } from "@/types/common";

interface DubaiSchematicMapProps {
  items: Destination[];
  selectedSlug: string | null;
  hoveredSlug: string | null;
  highlightedSlugs: string[];
  hasActiveFilter: boolean;
  onMarkerClick: (slug: string) => void;
  onMarkerHover: (slug: string | null) => void;
}

const HOME_POSITION = MAP_POSITIONS.dubaiHarbour;

export function DubaiSchematicMap({
  items,
  selectedSlug,
  hoveredSlug,
  highlightedSlugs,
  hasActiveFilter,
  onMarkerClick,
  onMarkerHover,
}: DubaiSchematicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<RouteLineHandle>(null);
  const [yachtActive, setYachtActive] = useState(false);
  const [routeKey, setRouteKey] = useState(0);

  const selectedItem = items.find((i) => i.slug === selectedSlug) ?? null;
  const hoveredItem = items.find((i) => i.slug === hoveredSlug) ?? null;

  const handleMarkerClick = useCallback(
    (slug: string) => {
      setRouteKey((k) => k + 1);
      setYachtActive(true);
      onMarkerClick(slug);
    },
    [onMarkerClick]
  );

  const hoveredPosition =
    hoveredItem?.mapPosition ?? null;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Water gradient */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#060E1A" />
            <stop offset="100%" stopColor="#0A1628" />
          </linearGradient>

          {/* Land gradient */}
          <linearGradient id="landGrad" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#121F3D" />
            <stop offset="100%" stopColor="#0F1A33" />
          </linearGradient>

          {/* Coastline glow */}
          <linearGradient id="coastGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2A7B9B" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#2A7B9B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2A7B9B" stopOpacity="0.08" />
          </linearGradient>

          {/* Gold glow filter for active markers */}
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#C9A84C" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Water texture pattern */}
          <pattern id="waterTexture" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="0.5" fill="#2A7B9B" opacity="0.08" />
          </pattern>

          {/* Grid pattern for depth effect */}
          <pattern id="depthGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#2A7B9B"
              strokeWidth="0.3"
              opacity="0.04"
            />
          </pattern>
        </defs>

        {/* ===== Layer 1: Water background ===== */}
        <rect width="1000" height="600" fill="url(#waterGrad)" />
        <rect width="1000" height="600" fill="url(#waterTexture)" className="water-shimmer" />
        <rect width="1000" height="600" fill="url(#depthGrid)" />

        {/* ===== Layer 2: Land masses ===== */}

        {/* Main coastline (mainland Dubai — diagonal from lower-left to upper-right) */}
        <path
          d="M 880 0 L 750 0 C 720 50 700 90 680 130
             C 660 170 640 200 600 240
             C 570 270 540 290 510 310
             C 480 330 460 345 440 360
             C 420 375 400 390 390 405
             C 380 420 375 430 372 445
             C 370 460 370 475 380 500
             C 390 530 410 560 430 580
             L 430 600 L 1000 600 L 1000 0 Z"
          fill="url(#landGrad)"
        />

        {/* Coastline stroke */}
        <path
          d="M 750 0 C 720 50 700 90 680 130
             C 660 170 640 200 600 240
             C 570 270 540 290 510 310
             C 480 330 460 345 440 360
             C 420 375 400 390 390 405
             C 380 420 375 430 372 445
             C 370 460 370 475 380 500
             C 390 530 410 560 430 580"
          fill="none"
          stroke="url(#coastGrad)"
          strokeWidth="2"
        />

        {/* Subtle coastline inner glow */}
        <path
          d="M 750 0 C 720 50 700 90 680 130
             C 660 170 640 200 600 240
             C 570 270 540 290 510 310
             C 480 330 460 345 440 360
             C 420 375 400 390 390 405
             C 380 420 375 430 372 445
             C 370 460 370 475 380 500
             C 390 530 410 560 430 580"
          fill="none"
          stroke="#2A7B9B"
          strokeWidth="6"
          opacity="0.04"
        />

        {/* ===== Palm Jumeirah (schematic) ===== */}
        <g opacity="0.7">
          {/* Palm trunk (main axis going into the sea) */}
          <path
            d="M 310 290 L 240 200 L 230 190"
            fill="none"
            stroke="#2A7B9B"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* Crescent (outer breakwater) */}
          <path
            d="M 200 180 C 210 160 240 150 270 160 C 300 170 310 190 300 210"
            fill="none"
            stroke="url(#coastGrad)"
            strokeWidth="1.5"
          />
          {/* Island body */}
          <ellipse cx="250" cy="210" rx="45" ry="30" fill="url(#landGrad)" opacity="0.5" />
          {/* Fronds — simplified lines */}
          <path d="M 250 230 L 225 185" fill="none" stroke="#2A7B9B" strokeWidth="0.5" opacity="0.15" />
          <path d="M 250 230 L 240 183" fill="none" stroke="#2A7B9B" strokeWidth="0.5" opacity="0.15" />
          <path d="M 250 230 L 255 182" fill="none" stroke="#2A7B9B" strokeWidth="0.5" opacity="0.15" />
          <path d="M 250 230 L 265 185" fill="none" stroke="#2A7B9B" strokeWidth="0.5" opacity="0.15" />
          <path d="M 250 230 L 275 190" fill="none" stroke="#2A7B9B" strokeWidth="0.5" opacity="0.15" />
          {/* Label */}
          <text x="250" y="250" textAnchor="middle" className="fill-white/10 text-[8px]" style={{ fontFamily: "var(--font-heading)" }}>
            PALM JUMEIRAH
          </text>
        </g>

        {/* ===== Bluewaters Island / Ain Dubai ===== */}
        <g opacity="0.6">
          <circle cx="290" cy="340" r="15" fill="url(#landGrad)" opacity="0.5" />
          <circle cx="290" cy="340" r="15" fill="none" stroke="url(#coastGrad)" strokeWidth="1" />
          {/* Ferris wheel hint */}
          <circle cx="290" cy="335" r="6" fill="none" stroke="#2A7B9B" strokeWidth="0.5" opacity="0.2" />
          <line x1="290" y1="329" x2="290" y2="341" stroke="#2A7B9B" strokeWidth="0.3" opacity="0.2" />
        </g>

        {/* ===== World Islands (cluster of small shapes) ===== */}
        <g opacity="0.5">
          {worldIslandDots.map((dot, i) => (
            <ellipse
              key={i}
              cx={dot.x}
              cy={dot.y}
              rx={dot.r}
              ry={dot.r * 0.7}
              fill="url(#landGrad)"
              opacity={0.3 + (i % 3) * 0.1}
              transform={`rotate(${dot.angle} ${dot.x} ${dot.y})`}
            />
          ))}
          <text x="560" y="148" textAnchor="middle" className="fill-white/10 text-[8px]" style={{ fontFamily: "var(--font-heading)" }}>
            THE WORLD ISLANDS
          </text>
        </g>

        {/* ===== Moon Island (near World Islands) ===== */}
        <g opacity="0.5">
          <ellipse cx="630" cy="150" rx="12" ry="8" fill="url(#landGrad)" opacity="0.4" />
          <ellipse cx="630" cy="150" rx="12" ry="8" fill="none" stroke="url(#coastGrad)" strokeWidth="0.8" />
        </g>

        {/* ===== Dubai Marina canal hint ===== */}
        <g opacity="0.4">
          <path
            d="M 400 370 C 395 380 390 395 400 410 C 405 415 415 415 420 408"
            fill="none"
            stroke="#2A7B9B"
            strokeWidth="0.8"
            opacity="0.2"
          />
        </g>

        {/* ===== Jumeirah Bay inlet ===== */}
        <g opacity="0.4">
          <path
            d="M 500 260 C 490 270 485 280 490 295 C 495 300 505 300 510 290"
            fill="none"
            stroke="url(#coastGrad)"
            strokeWidth="1"
          />
        </g>

        {/* ===== Compass rose (decorative) ===== */}
        <g transform="translate(90, 520)" opacity="0.15">
          <circle cx="0" cy="0" r="25" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="20" fill="none" stroke="#C9A84C" strokeWidth="0.3" />
          <line x1="0" y1="-22" x2="0" y2="22" stroke="#C9A84C" strokeWidth="0.5" />
          <line x1="-22" y1="0" x2="22" y2="0" stroke="#C9A84C" strokeWidth="0.5" />
          <text x="0" y="-27" textAnchor="middle" className="fill-gold-400 text-[7px] font-bold">N</text>
          <polygon points="0,-18 -3,-10 3,-10" fill="#C9A84C" opacity="0.6" />
        </g>

        {/* ===== Scale bar (decorative) ===== */}
        <g transform="translate(60, 570)" opacity="0.15">
          <line x1="0" y1="0" x2="80" y2="0" stroke="#C9A84C" strokeWidth="0.5" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#C9A84C" strokeWidth="0.5" />
          <line x1="80" y1="-3" x2="80" y2="3" stroke="#C9A84C" strokeWidth="0.5" />
          <text x="40" y="10" textAnchor="middle" className="fill-white/30 text-[7px]">~5 NM</text>
        </g>

        {/* ===== Layer 3: Route line ===== */}
        {selectedItem?.mapPosition && (
          <RouteLine
            key={routeKey}
            ref={routeLineRef}
            from={HOME_POSITION}
            to={selectedItem.mapPosition}
            isAnimating={true}
          />
        )}

        {/* ===== Layer 4: Yacht animation ===== */}
        <YachtIcon
          pathElement={routeLineRef.current?.getPathElement() ?? null}
          isActive={yachtActive && selectedItem !== null}
          onComplete={() => setYachtActive(false)}
        />

        {/* ===== Layer 5: Location markers ===== */}

        {/* Home base marker (always visible) */}
        <MapMarker
          position={HOME_POSITION}
          label="Dubai Harbour"
          category="destination"
          isActive={false}
          isHighlighted={false}
          isDimmed={false}
          isHome={true}
          onHover={() => {}}
          onClick={() => {}}
        />

        {/* Adventure/destination markers */}
        {items.map((item) => {
          if (!item.mapPosition) return null;
          const isActive = item.slug === selectedSlug;
          const isHighlighted =
            !hasActiveFilter || highlightedSlugs.includes(item.slug);
          const isDimmed = hasActiveFilter && !highlightedSlugs.includes(item.slug);

          return (
            <MapMarker
              key={item.slug}
              position={item.mapPosition}
              label={item.mapLabel}
              category={item.category}
              isActive={isActive}
              isHighlighted={isActive || (isHighlighted && !isActive)}
              isDimmed={isDimmed}
              onHover={(entering) =>
                onMarkerHover(entering ? item.slug : null)
              }
              onClick={() => handleMarkerClick(item.slug)}
            />
          );
        })}
      </svg>

      {/* HTML tooltip overlay */}
      <MapTooltip
        item={hoveredItem}
        markerPosition={hoveredPosition}
        containerRef={containerRef}
      />
    </div>
  );
}

// World Islands — cluster of small ellipses
const worldIslandDots = [
  { x: 535, y: 100, r: 4, angle: 15 },
  { x: 545, y: 108, r: 3, angle: -10 },
  { x: 555, y: 95, r: 5, angle: 20 },
  { x: 548, y: 118, r: 3.5, angle: 5 },
  { x: 560, y: 108, r: 4.5, angle: -15 },
  { x: 570, y: 100, r: 3, angle: 30 },
  { x: 565, y: 118, r: 4, angle: -5 },
  { x: 575, y: 112, r: 3.5, angle: 10 },
  { x: 540, y: 125, r: 3, angle: -20 },
  { x: 552, y: 130, r: 4, angle: 25 },
  { x: 565, y: 128, r: 3.5, angle: -10 },
  { x: 578, y: 125, r: 3, angle: 15 },
  { x: 555, y: 140, r: 3.5, angle: 5 },
  { x: 568, y: 138, r: 3, angle: -25 },
  { x: 530, y: 112, r: 3.5, angle: 10 },
  { x: 582, y: 108, r: 2.5, angle: -5 },
  { x: 542, y: 90, r: 3, angle: 20 },
  { x: 570, y: 88, r: 2.5, angle: -10 },
];
