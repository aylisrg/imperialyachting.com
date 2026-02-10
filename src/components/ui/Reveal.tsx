"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay }: RevealProps) {
  const { ref, isVisible } = useScrollAnimation({ rootMargin: "-50px" });

  return (
    <div
      ref={ref}
      className={cn("reveal", isVisible && "visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
