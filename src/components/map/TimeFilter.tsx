"use client";

import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import type { TimeOfDay } from "@/types/common";
import { cn } from "@/lib/utils";

interface TimeFilterProps {
  activeFilter: TimeOfDay | null;
  onFilterChange: (time: TimeOfDay | null) => void;
}

const filters: { value: TimeOfDay | null; label: string; icon: React.ReactNode }[] = [
  { value: null, label: "All", icon: null },
  { value: "sunrise", label: "Sunrise", icon: <Sunrise className="w-3.5 h-3.5" /> },
  { value: "morning", label: "Morning", icon: <Sun className="w-3.5 h-3.5" /> },
  { value: "afternoon", label: "Afternoon", icon: <Sun className="w-3.5 h-3.5" /> },
  { value: "sunset", label: "Sunset", icon: <Sunset className="w-3.5 h-3.5" /> },
  { value: "evening", label: "Evening", icon: <Moon className="w-3.5 h-3.5" /> },
];

export function TimeFilter({ activeFilter, onFilterChange }: TimeFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {filters.map((filter) => {
        const isActive = filter.value === activeFilter;
        return (
          <button
            key={filter.value ?? "all"}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-300",
              isActive
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                : "bg-navy-800/60 text-white/40 border border-white/5 hover:text-white/60 hover:border-white/10"
            )}
          >
            {filter.icon}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
