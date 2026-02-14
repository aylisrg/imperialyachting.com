"use client";

import { Map, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "map" | "catalog";
  onViewChange: (view: "map" | "catalog") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-navy-800/60 border border-white/5 p-1">
      <button
        onClick={() => onViewChange("map")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300",
          view === "map"
            ? "bg-gold-500/15 text-gold-400"
            : "text-white/40 hover:text-white/60"
        )}
      >
        <Map className="w-3.5 h-3.5" />
        Map
      </button>
      <button
        onClick={() => onViewChange("catalog")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300",
          view === "catalog"
            ? "bg-gold-500/15 text-gold-400"
            : "text-white/40 hover:text-white/60"
        )}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Catalog
      </button>
    </div>
  );
}
