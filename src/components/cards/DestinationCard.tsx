"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Timer, Sparkles, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Destination } from "@/types/common";

const gradients = [
  "from-sea-500/30 via-navy-700 to-navy-800",
  "from-gold-500/20 via-navy-700 to-navy-800",
  "from-sea-400/25 via-navy-800 to-navy-900",
  "from-gold-400/15 via-navy-800 to-navy-900",
  "from-sea-600/20 via-navy-700 to-navy-900",
];

const categoryConfig: Record<
  string,
  { label: string; color: "gold" | "sea" }
> = {
  destination: { label: "Destination", color: "gold" },
  experience: { label: "Experience", color: "sea" },
  activity: { label: "Activity", color: "sea" },
};

interface DestinationCardProps {
  destination: Destination;
  index?: number;
}

export function DestinationCard({ destination, index = 0 }: DestinationCardProps) {
  const cat = categoryConfig[destination.category] || categoryConfig.destination;

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="block rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/15 transition-all duration-500 group"
    >
      {/* Image */}
      <div
        className={`relative aspect-[16/10] bg-gradient-to-br ${gradients[index % gradients.length]}`}
      >
        {destination.coverImage ? (
          <Image
            src={destination.coverImage}
            alt={destination.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-xl font-bold text-white/15 tracking-wider text-center px-4">
              {destination.name}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/80 to-transparent" />

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
              cat.color === "gold"
                ? "bg-gold-500/20 text-gold-300"
                : "bg-sea-500/20 text-sea-400"
            }`}
          >
            {destination.category === "experience" ? (
              <Sparkles className="w-3 h-3" />
            ) : destination.category === "activity" ? (
              <Tag className="w-3 h-3" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            {cat.label}
          </span>
        </div>

        {/* Sailing time badge — top right */}
        {destination.sailingTime && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/80">
              <Clock className="w-3 h-3 text-gold-400" />
              {destination.sailingTime}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {destination.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/90 px-2.5 py-1 text-[10px] font-bold text-navy-950 uppercase tracking-wider">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-navy-800 p-6">
        <h3 className="font-heading text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
          {destination.name}
        </h3>

        <p className="mt-2.5 text-sm text-white/50 leading-relaxed line-clamp-2">
          {destination.shortDescription || destination.description}
        </p>

        {/* Duration + Price row */}
        {(destination.duration || destination.priceFrom) && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            {destination.duration && (
              <span className="inline-flex items-center gap-1.5 text-white/40">
                <Timer className="w-3.5 h-3.5 text-gold-500/60" />
                {destination.duration}
              </span>
            )}
            {destination.priceFrom && (
              <span className="inline-flex items-center gap-1 text-gold-400/80 font-medium">
                From AED {destination.priceFrom.toLocaleString("en-US")}
              </span>
            )}
          </div>
        )}

        {/* Best-for tags */}
        {destination.bestFor.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {destination.bestFor.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="gold">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
