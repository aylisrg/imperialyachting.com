"use client";

import { useState } from "react";
import Image from "next/image";
import { Ruler, Users, MapPin, ImageIcon } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

interface FleetYacht {
  slug: string;
  name: string;
  tagline: string;
  lengthFeet: number;
  lengthMeters: number;
  capacity: number;
  location: string;
  heroImage: string;
  lowestPrice: number | null;
}

interface FleetPreviewProps {
  yachts: FleetYacht[];
}

function YachtCard({ yacht, index }: { yacht: FleetYacht; index: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Reveal delay={index * 150}>
      <article className="group bg-navy-800 rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-colors duration-500">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gold-500/20 via-gold-400/10 to-navy-700 overflow-hidden">
          {!imageError ? (
            <Image
              src={yacht.heroImage}
              alt={`${yacht.name} — Imperial Yachting`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-white/15 mx-auto mb-2" />
                <span className="font-heading text-xl font-bold text-white/20 tracking-wider">
                  {yacht.name}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/20 transition-colors duration-500" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-heading text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
            {yacht.name}
          </h3>
          <p className="mt-1 text-sm text-gold-400/80 font-medium">
            {yacht.tagline}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-gold-500/60" />
              {yacht.lengthFeet}ft / {yacht.lengthMeters}m
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-500/60" />
              {yacht.capacity} guests
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-500/60" />
              {yacht.location.replace(", Berth BD2", "")}
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            {yacht.lowestPrice && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  From
                </p>
                <p className="font-heading text-lg font-bold text-white">
                  AED{" "}
                  {yacht.lowestPrice.toLocaleString("en-US")}
                  <span className="text-sm font-normal text-white/50">
                    /day
                  </span>
                </p>
              </div>
            )}
            <Button variant="ghost" size="sm" href={`/fleet/${yacht.slug}`}>
              View Details
            </Button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function FleetPreview({ yachts }: FleetPreviewProps) {
  return (
    <section className="py-24 sm:py-32 bg-navy-950">
      <Container>
        <SectionHeading
          title="Our Fleet"
          subtitle="Premium motor yachts, owned and maintained to the highest standards. Each vessel offers a unique charter experience on Dubai's waters."
          align="center"
        />

        {yachts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {yachts.map((yacht, i) => (
              <YachtCard key={yacht.slug} yacht={yacht} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">
            <p>Fleet coming soon. Check back for our premium yacht offerings.</p>
          </div>
        )}

        <div className="mt-14 text-center">
          <Button variant="secondary" size="lg" href="/fleet">
            View Full Fleet
          </Button>
        </div>
      </Container>
    </section>
  );
}
