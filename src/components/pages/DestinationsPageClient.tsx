"use client";

import { useMemo } from "react";
import { MapPin, Anchor, Navigation } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DestinationCard } from "@/components/cards/DestinationCard";
import type { Destination } from "@/types/common";
import { SITE_CONFIG, DEPARTURE_POINT_SLUG } from "@/lib/constants";

export function DestinationsPageClient({
  destinations,
}: {
  destinations: Destination[];
}) {
  const browsable = useMemo(
    () => destinations.filter((d) => d.slug !== DEPARTURE_POINT_SLUG),
    [destinations]
  );

  const mapDestinations = useMemo(
    () => browsable.filter((d) => d.latitude && d.longitude),
    [browsable]
  );

  // Build a Google Maps embed URL showing all destinations
  const mapsEmbedUrl = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || mapDestinations.length === 0) return null;
    return `https://www.google.com/maps/embed/v1/view?key=${key}&center=25.12,55.14&zoom=12&maptype=satellite`;
  }, [mapDestinations]);

  // Fallback: link to Google Maps
  const mapsLinkUrl = useMemo(() => {
    if (mapDestinations.length === 0) return null;
    return "https://www.google.com/maps/@25.12,55.14,12z";
  }, [mapDestinations]);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="origin-left mb-8 animate-hero-line">
              <div className="gold-line" />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-hero-1">
              Dubai&apos;s Finest Yacht Destinations
            </h1>

            <p className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-2">
              Discover the most spectacular coastal destinations you can explore
              aboard a luxury yacht from Dubai Harbour.
            </p>

            <div className="mt-8 flex items-center gap-2 text-white/40 animate-hero-3">
              <MapPin className="w-4 h-4 text-gold-500/60" />
              <span className="text-sm font-medium tracking-wide uppercase">
                Departing from Dubai Harbour
              </span>
              <span className="ml-2 w-8 h-px bg-gold-500/30" />
            </div>
          </div>
        </Container>
      </section>

      {/* Google Maps */}
      {(mapsEmbedUrl || mapsLinkUrl) && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading
              title="Explore the Coast"
              subtitle="All yacht charters depart from Dubai Harbour. Explore our destinations along the Arabian Gulf coastline."
              align="center"
            />
            <Reveal>
              {mapsEmbedUrl ? (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-white/5">
                  <iframe
                    src={mapsEmbedUrl}
                    title="Dubai yacht destinations map"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : mapsLinkUrl ? (
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-white/5 hover:border-gold-500/15 bg-navy-800 p-8 sm:p-12 text-center transition-all duration-300 group"
                >
                  <Navigation className="w-10 h-10 text-gold-500/60 mx-auto mb-4 group-hover:text-gold-400 transition-colors" />
                  <p className="font-heading text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
                    View destinations on Google Maps
                  </p>
                  <p className="mt-2 text-sm text-white/40">
                    Dubai Harbour &middot; Palm Jumeirah &middot; Dubai Marina &middot; World Islands &middot; Ain Dubai
                  </p>
                </a>
              ) : null}
            </Reveal>
          </Container>
        </section>
      )}

      {/* Departure Point Banner + Destination Cards Grid */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Our Destinations"
            subtitle="Every charter route is carefully curated to showcase the best of Dubai's coastline and waterways."
            align="center"
          />

          {/* Departure point banner */}
          <Reveal>
            <div className="mb-12 flex items-center gap-4 rounded-xl bg-navy-800/60 border border-white/5 px-6 py-4 max-w-2xl mx-auto">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Anchor className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                All charters depart from{" "}
                <span className="text-white/80 font-medium">Dubai Harbour</span>{" "}
                — our home base between Palm Jumeirah and Bluewaters Island.
              </p>
            </div>
          </Reveal>

          {/* Cards Grid */}
          {browsable.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {browsable.map((destination, i) => (
                <Reveal key={destination.slug} delay={i * 80}>
                  <DestinationCard destination={destination} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-lg">
                No destinations available yet.
              </p>
              <p className="text-white/25 text-sm mt-2">
                Check back soon for new experiences.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sea-500/[0.03] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="gold-line mx-auto mb-8" />
          <Anchor
            className="w-8 h-8 text-gold-500/40 mx-auto mb-6"
            strokeWidth={1.5}
          />

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">
            Ready to Explore Dubai&apos;s Coastline?
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Our crew will tailor the perfect route for your charter experience.
            Whether it&apos;s a sunset cruise or a full-day island adventure,
            we&apos;ll make it unforgettable.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/fleet">
              View Our Fleet
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Plan Your Route
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
