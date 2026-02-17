"use client";

import { useState } from "react";
import Link from "next/link";
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
  lowestPrice: { amount: number; unit: string } | null;
}

interface FleetPreviewProps {
  yachts: FleetYacht[];
}

function YachtCard({ yacht, index, priority }: { yacht: FleetYacht; index: number; priority?: boolean }) {
  const [imageError, setImageError] = useState(false);

  const whatsappUrl = `https://wa.me/971528355939?text=${encodeURIComponent(`Hello, I found your yacht ${yacht.name} at imperialyachting.com`)}`;

  return (
    <Reveal delay={index * 150}>
      <article className="group bg-navy-800 rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-colors duration-500">
        {/* Image — clickable to yacht detail */}
        <Link href={`/fleet/${yacht.slug}`} className="relative aspect-[4/3] bg-gradient-to-br from-gold-500/20 via-gold-400/10 to-navy-700 overflow-hidden block">
          {!imageError ? (
            <Image
              src={yacht.heroImage}
              alt={`${yacht.name} — Imperial Yachting`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1200px) calc(50vw - 24px), 33vw"
              priority={priority}
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
        </Link>

        {/* Content */}
        <div className="p-6">
          <Link href={`/fleet/${yacht.slug}`} className="hover:underline decoration-gold-500/40">
            <h3 className="font-heading text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
              {yacht.name}
            </h3>
          </Link>
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
                  {yacht.lowestPrice.amount.toLocaleString("en-US")}
                  <span className="text-sm font-normal text-white/50">
                    {yacht.lowestPrice.unit}
                  </span>
                </p>
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
              <YachtCard key={yacht.slug} yacht={yacht} index={i} priority={i < 2} />
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
