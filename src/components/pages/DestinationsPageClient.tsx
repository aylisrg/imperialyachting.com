"use client";

import Image from "next/image";
import {
  Clock,
  MapPin,
  Compass,
  Sun,
  Thermometer,
  Anchor,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Destination } from "@/types/common";
import { SITE_CONFIG } from "@/lib/constants";

const gradients = [
  "from-sea-500/30 via-navy-700 to-navy-800",
  "from-gold-500/20 via-navy-700 to-navy-800",
  "from-sea-400/25 via-navy-800 to-navy-900",
  "from-gold-400/15 via-navy-800 to-navy-900",
  "from-sea-600/20 via-navy-700 to-navy-900",
];

const seasons = [
  {
    title: "Peak Season",
    months: "October \u2013 April",
    icon: Sun,
    description:
      "The ideal months for yachting in Dubai. Pleasant temperatures between 22\u201332\u00b0C, calm seas, and clear skies make this the most popular time for charter guests.",
    highlight: "Most popular",
  },
  {
    title: "Summer Season",
    months: "May \u2013 September",
    icon: Thermometer,
    description:
      "Higher temperatures bring exclusive monthly charter deals and quieter waters. Early morning and evening cruises offer comfortable conditions with spectacular sunsets.",
    highlight: "Best deals",
  },
];

export function DestinationsPageClient({ destinations }: { destinations: Destination[] }) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sea-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
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

            <div className="mb-6 animate-hero-1">
              <Compass
                className="w-8 h-8 text-gold-500/60"
                strokeWidth={1.5}
              />
            </div>

            <h1
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-hero-2"
            >
              Discover Dubai by Sea
            </h1>

            <p
              className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-3"
            >
              From iconic landmarks to secluded island escapes, explore
              Dubai&apos;s most spectacular destinations from the deck of a
              luxury yacht.
            </p>

            <div
              className="mt-8 flex items-center gap-2 text-white/40 animate-hero-4"
            >
              <MapPin className="w-4 h-4 text-gold-500/60" />
              <span className="text-sm font-medium tracking-wide uppercase">
                Departing from Dubai Harbour
              </span>
              <span className="ml-2 w-8 h-px bg-gold-500/30" />
            </div>
          </div>
        </Container>
      </section>

      {/* Destinations Grid */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Our Destinations"
            subtitle="Every charter route is carefully curated to showcase the best of Dubai's coastline and waterways."
            align="center"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination, i) => (
              <Reveal key={destination.slug} delay={i * 100}>
                <article
                  className="rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/15 transition-colors duration-500 group"
                >
                  {/* Image or gradient placeholder */}
                  <div
                    className={`relative aspect-[16/10] bg-gradient-to-br ${gradients[i % gradients.length]}`}
                  >
                    {destination.image ? (
                      <Image
                        src={destination.image}
                        alt={destination.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-xl font-bold text-white/15 tracking-wider text-center px-4">
                          {destination.name}
                        </span>
                      </div>
                    )}

                    {/* Sailing time badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/80">
                        <Clock className="w-3 h-3 text-gold-400" />
                        {destination.sailingTime}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-navy-800 p-6">
                    <h3 className="font-heading text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
                      {destination.name}
                    </h3>

                    <p className="mt-3 text-sm text-white/50 leading-relaxed line-clamp-3">
                      {destination.description}
                    </p>

                    {/* Best-for tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {destination.bestFor.map((tag) => (
                        <Badge key={tag} variant="gold">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="mt-5 pt-5 border-t border-white/5">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                        Highlights
                      </p>
                      <ul className="space-y-2">
                        {destination.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-2 text-sm text-white/60"
                          >
                            <CheckCircle2 className="w-4 h-4 text-gold-500/50 flex-shrink-0 mt-0.5" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Seasonal Guide */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="When to Charter"
            subtitle="Dubai offers year-round yachting, with each season bringing its own unique advantages."
            align="center"
          />

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {seasons.map((season, i) => (
              <Reveal
                key={season.title}
                delay={i * 100}
                className="glass-card rounded-xl p-8"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <season.icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      {season.title}
                    </h3>
                    <p className="text-sm text-gold-400">{season.months}</p>
                  </div>
                </div>

                <Badge variant={i === 0 ? "gold" : "sea"} className="mb-4">
                  {season.highlight}
                </Badge>

                <p className="text-sm text-white/50 leading-relaxed">
                  {season.description}
                </p>
              </Reveal>
            ))}
          </div>
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
            <Button variant="secondary" size="lg" href="/contact">
              Plan Your Route
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
