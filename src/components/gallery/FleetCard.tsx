"use client";

import { useState } from "react";
import Image from "next/image";
import { Ruler, Users, Calendar, Wrench, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

interface FleetCardProps {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  builder: string;
  year: number;
  refit?: number;
  lengthFeet: number;
  lengthMeters: number;
  capacity: number;
  lowestPrice: number | null;
  heroImage: string;
  images: string[];
  delay: number;
}

export function FleetCard({
  slug,
  name,
  tagline,
  description,
  builder,
  year,
  refit,
  lengthFeet,
  lengthMeters,
  capacity,
  lowestPrice,
  heroImage,
  images,
  delay,
}: FleetCardProps) {
  const [heroError, setHeroError] = useState(false);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const displayImage =
    hoveredImageIndex !== null ? images[hoveredImageIndex] : heroImage;

  return (
    <Reveal delay={delay}>
      <article className="group bg-navy-800 rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-all duration-500 flex flex-col h-full">
        {/* Image Area */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {!heroError ? (
            <Image
              src={displayImage}
              alt={`${name} — Imperial Yachting`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setHeroError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 via-gold-400/10 to-navy-700 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-white/15 mx-auto mb-2" />
                <span className="font-heading text-2xl font-bold text-white/20 tracking-wider">
                  {name}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />

          {/* Mini image dots for preview */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-navy-950/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setHoveredImageIndex(idx)}
                  onMouseLeave={() => setHoveredImageIndex(null)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    (hoveredImageIndex === null && idx === 0) ||
                    hoveredImageIndex === idx
                      ? "bg-gold-500 scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Preview photo ${idx + 1}`}
                />
              ))}
              {images.length > 5 && (
                <span className="text-[10px] text-white/50 ml-1">
                  +{images.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Photo count badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-navy-950/50 backdrop-blur-sm text-white/70 text-xs">
            <ImageIcon className="w-3 h-3" />
            {images.length}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col flex-1">
          <h2 className="font-heading text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">
            {name}
          </h2>
          <p className="mt-1 text-sm text-gold-400/80 font-medium">{tagline}</p>
          <p className="mt-3 text-sm text-white/50 leading-relaxed line-clamp-3">
            {description}
          </p>

          {/* Specs grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Ruler className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
              <span>
                {lengthFeet}ft / {lengthMeters}m
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Users className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
              <span>{capacity} guests</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Wrench className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
              <span>{builder}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Calendar className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
              <span>
                {year}
                {refit ? ` / ${refit}` : ""}
              </span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="mt-auto pt-6 flex items-end justify-between gap-4 border-t border-white/5">
            {lowestPrice ? (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  From
                </p>
                <p className="font-heading text-xl font-bold text-white">
                  AED {lowestPrice.toLocaleString("en-US")}
                  <span className="text-sm font-normal text-white/50">/day</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-white/40">Contact for pricing</p>
              </div>
            )}
            <Button variant="primary" size="sm" href={`/fleet/${slug}`}>
              View Details
            </Button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
