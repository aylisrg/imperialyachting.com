"use client";

import { useRef, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Destination } from "@/types/common";

interface MapTooltipProps {
  item: Destination | null;
  markerPosition: { x: number; y: number } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const categoryLabels: Record<string, string> = {
  destination: "Destination",
  experience: "Experience",
  activity: "Activity",
};

export function MapTooltip({ item, markerPosition, containerRef }: MapTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!markerPosition || !containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const svg = container.querySelector("svg");
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    // Convert SVG coordinates to screen coordinates
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;

    const screenX = svgRect.left - containerRect.left + markerPosition.x * scaleX;
    const screenY = svgRect.top - containerRect.top + markerPosition.y * scaleY;

    const tooltip = tooltipRef.current;
    const tooltipWidth = tooltip.offsetWidth || 240;

    // Position above the marker, centered
    let left = screenX - tooltipWidth / 2;
    const top = screenY - 32;

    // Clamp to container bounds
    left = Math.max(8, Math.min(left, containerRect.width - tooltipWidth - 8));

    setPosition({ left, top });
  }, [markerPosition, containerRef]);

  const isVisible = item !== null && markerPosition !== null;

  return (
    <div
      ref={tooltipRef}
      className={`map-tooltip absolute z-30 w-60 ${isVisible ? "visible" : ""}`}
      style={{ left: position.left, top: position.top }}
    >
      <div className="glass-card rounded-xl p-4 shadow-2xl">
        {item && (
          <>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-heading text-sm font-bold text-white leading-tight">
                {item.name}
              </h4>
              <Badge variant="gold" className="text-[10px] flex-shrink-0">
                {categoryLabels[item.category] ?? item.category}
              </Badge>
            </div>

            <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-3">
              {item.shortDescription}
            </p>

            <div className="flex items-center justify-between text-xs">
              {item.sailingTime && (
                <span className="inline-flex items-center gap-1 text-white/40">
                  <Clock className="w-3 h-3 text-gold-400" />
                  {item.sailingTime}
                </span>
              )}
              {item.priceFrom && (
                <span className="text-gold-400 font-medium">
                  from {item.priceFrom.toLocaleString("en-US")} AED
                </span>
              )}
            </div>

            {item.specialLabel && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-gold-400/80 font-medium uppercase tracking-wider">
                  {item.specialLabel}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      {/* Tooltip arrow */}
      <div className="flex justify-center -mt-px">
        <div className="w-3 h-3 bg-[rgba(18,31,61,0.6)] rotate-45 border-r border-b border-[rgba(201,168,76,0.1)]" />
      </div>
    </div>
  );
}
