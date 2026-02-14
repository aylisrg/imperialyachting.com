"use client";

import Image from "next/image";
import { Clock, Timer, Zap, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Destination } from "@/types/common";

const gradients = [
  "from-sea-500/30 via-navy-700 to-navy-800",
  "from-gold-500/20 via-navy-700 to-navy-800",
  "from-sea-400/25 via-navy-800 to-navy-900",
  "from-gold-400/15 via-navy-800 to-navy-900",
];

interface AdventureCardProps {
  adventure: Destination;
  index?: number;
  onClick: () => void;
}

export function AdventureCard({ adventure, index = 0, onClick }: AdventureCardProps) {
  const isExperience = adventure.category === "experience";
  const isActivity = adventure.category === "activity";

  return (
    <button
      onClick={onClick}
      className="block w-full text-left rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/15 transition-all duration-500 group"
    >
      {/* Image */}
      <div
        className={`relative aspect-[16/10] bg-gradient-to-br ${gradients[index % gradients.length]}`}
      >
        {adventure.coverImage ? (
          <Image
            src={adventure.coverImage}
            alt={adventure.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-xl font-bold text-white/15 tracking-wider text-center px-4">
              {adventure.name}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/80 to-transparent" />

        {/* Special label ribbon */}
        {adventure.specialLabel && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/20 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold text-gold-400 uppercase tracking-wider border border-gold-500/20">
              <Zap className="w-3 h-3" />
              {adventure.specialLabel}
            </span>
          </div>
        )}

        {/* Time badge */}
        {adventure.startTime && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/80">
              <Clock className="w-3 h-3 text-gold-400" />
              {adventure.startTime}
            </span>
          </div>
        )}

        {/* Category indicator */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={isExperience ? "gold" : isActivity ? "sea" : "white"}>
            {isExperience ? "Experience" : isActivity ? "Activity" : "Destination"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="bg-navy-800 p-5">
        <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
          {adventure.name}
        </h3>

        <p className="mt-2 text-sm text-white/50 leading-relaxed line-clamp-2">
          {adventure.shortDescription}
        </p>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          {adventure.duration && (
            <span className="inline-flex items-center gap-1.5 text-white/40">
              <Timer className="w-3.5 h-3.5 text-gold-500/60" />
              {adventure.duration}
            </span>
          )}
          {adventure.area && (
            <span className="text-white/30 text-xs">
              {adventure.area}
            </span>
          )}
        </div>

        {/* Price + CTA row */}
        <div className="mt-3 flex items-end justify-between gap-3">
          {adventure.priceFrom ? (
            <div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider block">
                From
              </span>
              <span className="font-heading text-lg font-bold text-gold-400">
                AED {adventure.priceFrom.toLocaleString("en-US")}
              </span>
            </div>
          ) : (
            <span className="text-sm text-white/30">Contact for pricing</span>
          )}

          <span className="inline-flex items-center gap-1 text-xs text-white/30 group-hover:text-gold-400 transition-colors">
            Details
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Statistic callout */}
        {adventure.statistic && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gold-400/60 italic">
              {adventure.statistic}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}
