"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import type { MapPosition } from "@/types/common";

interface RouteLineProps {
  from: MapPosition;
  to: MapPosition;
  isAnimating: boolean;
}

export interface RouteLineHandle {
  getPathElement: () => SVGPathElement | null;
}

export const RouteLine = forwardRef<RouteLineHandle, RouteLineProps>(
  function RouteLine({ from, to, isAnimating }, ref) {
    const pathRef = useRef<SVGPathElement>(null);

    useImperativeHandle(ref, () => ({
      getPathElement: () => pathRef.current,
    }));

    const setRouteLength = useCallback(() => {
      const path = pathRef.current;
      if (!path) return;
      const length = path.getTotalLength();
      path.style.setProperty("--route-length", `${length}`);
    }, []);

    useEffect(() => {
      if (isAnimating) {
        // Small delay to ensure DOM is painted before measuring
        requestAnimationFrame(() => setRouteLength());
      }
    }, [isAnimating, from, to, setRouteLength]);

    // Compute a smooth bezier curve between points
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Control point offset perpendicular to the line — creates a nice arc
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const curvature = Math.min(dist * 0.15, 40);
    const cx = midX + perpX * curvature;
    const cy = midY + perpY * curvature;

    const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;

    return (
      <g>
        {/* Shadow/glow layer */}
        <path
          d={d}
          fill="none"
          stroke="#C9A84C"
          strokeWidth={4}
          opacity={0.08}
          strokeLinecap="round"
        />
        {/* Animated dashed route line */}
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="#C9A84C"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="6 4"
          opacity={0.7}
          className={isAnimating ? "route-line" : ""}
          style={
            !isAnimating
              ? { strokeDashoffset: "0" }
              : undefined
          }
        />
      </g>
    );
  }
);
