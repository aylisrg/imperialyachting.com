"use client";

import { useRef, useEffect } from "react";

interface YachtIconProps {
  pathElement: SVGPathElement | null;
  isActive: boolean;
  onComplete?: () => void;
}

export function YachtIcon({ pathElement, isActive, onComplete }: YachtIconProps) {
  const yachtRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !pathElement || !yachtRef.current) return;

    const totalLength = pathElement.getTotalLength();
    const duration = 2200;
    let startTime = 0;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const progress = 1 - Math.pow(1 - rawProgress, 3);
      const currentLength = progress * totalLength;

      const point = pathElement!.getPointAtLength(currentLength);
      const nextPoint = pathElement!.getPointAtLength(
        Math.min(currentLength + 2, totalLength)
      );

      const angle =
        Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) *
        (180 / Math.PI);

      yachtRef.current?.setAttribute(
        "transform",
        `translate(${point.x}, ${point.y}) rotate(${angle})`
      );

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, pathElement, onComplete]);

  if (!isActive) return null;

  return (
    <g ref={yachtRef}>
      {/* Simple yacht silhouette — hull + mast + sail */}
      <g transform="translate(-12, -6) scale(0.5)">
        {/* Hull */}
        <path
          d="M4 18 L8 22 L40 22 L44 18 Z"
          fill="#C9A84C"
          opacity={0.9}
        />
        {/* Cabin */}
        <rect x="14" y="14" width="16" height="4" rx="1" fill="#C9A84C" opacity={0.7} />
        {/* Mast */}
        <line x1="24" y1="4" x2="24" y2="14" stroke="#C9A84C" strokeWidth="1.5" />
        {/* Sail */}
        <path
          d="M25 5 L36 13 L25 13 Z"
          fill="#C9A84C"
          opacity={0.5}
        />
      </g>
      {/* Wake effect */}
      <line
        x1="-14"
        y1="2"
        x2="-28"
        y2="2"
        stroke="#C9A84C"
        strokeWidth="0.8"
        opacity={0.2}
        strokeDasharray="3 3"
      />
    </g>
  );
}
