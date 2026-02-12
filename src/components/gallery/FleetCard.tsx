"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Ruler, Users, Calendar, Wrench, ImageIcon } from "lucide-react";
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
  lowestPrice: { amount: number; unit: string } | null;
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

  const whatsappUrl = `https://wa.me/971528355939?text=${encodeURIComponent(`Hello, I found your yacht ${name} at imperialyachting.com`)}`;

  return (
    <Reveal delay={delay}>
      <article className="group bg-navy-800 rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-all duration-500 flex flex-col h-full">
        {/* Image Area — clickable to yacht detail */}
        <Link href={`/fleet/${slug}`} className="relative aspect-[4/3] overflow-hidden block">
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
                  onClick={(e) => e.preventDefault()}
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
        </Link>

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col flex-1">
          <Link href={`/fleet/${slug}`} className="hover:underline decoration-gold-500/40">
            <h2 className="font-heading text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">
              {name}
            </h2>
          </Link>
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
                  AED {lowestPrice.amount.toLocaleString("en-US")}
                  <span className="text-sm font-normal text-white/50">{lowestPrice.unit}</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-white/40">Contact for pricing</p>
              </div>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Book
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
