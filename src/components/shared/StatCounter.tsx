"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: string;
  label: string;
  className?: string;
}

function parseValue(value: string): { num: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: value };

  return {
    prefix: match[1],
    num: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatNumber(n: number, hasDecimals: boolean): string {
  if (hasDecimals) {
    return n.toFixed(1);
  }
  return Math.round(n).toLocaleString("en-US");
}

export function StatCounter({ value, label, className }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayNum, setDisplayNum] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { num, prefix, suffix } = parseValue(value);
  const hasDecimals = value.includes(".");

  const animate = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const duration = 2000;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for a smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(eased * num);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [hasAnimated, num]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <div className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient">
        {prefix}
        {formatNumber(displayNum, hasDecimals)}
        {suffix}
      </div>
      <p className="mt-2 text-sm text-white/60 font-body tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}
