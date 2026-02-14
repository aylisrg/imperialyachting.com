"use client";

import { Navigation, Clock, Anchor, DollarSign } from "lucide-react";
import type { Destination } from "@/types/common";

interface RouteCalculatorProps {
  item: Destination | null;
}

export function RouteCalculator({ item }: RouteCalculatorProps) {
  if (!item) return null;

  const stats = [
    {
      icon: <Navigation className="w-4 h-4 text-gold-400" />,
      label: "Distance",
      value: item.distanceNM ? `${item.distanceNM} NM` : "—",
    },
    {
      icon: <Clock className="w-4 h-4 text-gold-400" />,
      label: "Cruising Time",
      value: item.cruisingTimeMinutes
        ? item.cruisingTimeMinutes >= 60
          ? `${Math.floor(item.cruisingTimeMinutes / 60)}h ${item.cruisingTimeMinutes % 60}m`
          : `${item.cruisingTimeMinutes} min`
        : "—",
    },
    {
      icon: <Anchor className="w-4 h-4 text-gold-400" />,
      label: "Recommended Start",
      value: item.recommendedStartTime ?? item.startTime ?? "Flexible",
    },
    {
      icon: <DollarSign className="w-4 h-4 text-gold-400" />,
      label: "From",
      value: item.priceFrom
        ? `AED ${item.priceFrom.toLocaleString("en-US")}`
        : "Contact us",
    },
  ];

  return (
    <div className="glass-card rounded-xl p-4 w-full sm:w-64">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
        <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
          Route Details
        </span>
      </div>

      <div className="space-y-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-navy-800/80 flex items-center justify-center flex-shrink-0">
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-sm font-medium text-white/80">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {item.statistic && (
        <div className="mt-3 pt-2 border-t border-white/5">
          <p className="text-[11px] text-gold-400/70 italic">{item.statistic}</p>
        </div>
      )}
    </div>
  );
}
