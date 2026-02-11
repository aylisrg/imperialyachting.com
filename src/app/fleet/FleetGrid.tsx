"use client";

import { FleetCard } from "@/components/gallery/FleetCard";

interface FleetYachtCard {
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
}

interface FleetGridProps {
  yachts: FleetYachtCard[];
}

export function FleetGrid({ yachts }: FleetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {yachts.map((yacht, i) => (
        <FleetCard
          key={yacht.slug}
          {...yacht}
          delay={i * 200}
        />
      ))}
    </div>
  );
}
