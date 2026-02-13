"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  MapPin,
  Sparkles,
  Tag,
  Sun,
  Thermometer,
  Anchor,
  LayoutGrid,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { DubaiCoastMap } from "@/components/maps/DubaiCoastMap";
import type { Destination, DestinationCategory } from "@/types/common";
import { SITE_CONFIG } from "@/lib/constants";

type FilterTab = "all" | DestinationCategory;

const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { id: "destination", label: "Destinations", icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: "experience", label: "Experiences", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "activity", label: "Activities", icon: <Tag className="w-3.5 h-3.5" /> },
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

export function DestinationsPageClient({
  destinations,
}: {
  destinations: Destination[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? destinations
        : destinations.filter((d) => d.category === activeTab),
    [destinations, activeTab]
  );

  const mapDestinations = useMemo(
    () => destinations.filter((d) => d.latitude && d.longitude),
    [destinations]
  );

  const handleMarkerClick = useCallback(
    (slug: string) => {
      router.push(`/destinations/${slug}`);
    },
    [router]
  );

  // Compute which tabs actually have destinations
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: destinations.length };
    for (const d of destinations) {
      counts[d.category] = (counts[d.category] || 0) + 1;
    }
    return counts;
  }, [destinations]);

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

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-hero-2">
              Dubai&apos;s Finest Yacht Experiences
            </h1>

            <p className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-3">
              From iconic coastal destinations to curated on-water
              experiences — discover everything you can do aboard a luxury
              yacht in Dubai.
            </p>

            <div className="mt-8 flex items-center gap-2 text-white/40 animate-hero-4">
              <MapPin className="w-4 h-4 text-gold-500/60" />
              <span className="text-sm font-medium tracking-wide uppercase">
                Departing from Dubai Harbour
              </span>
              <span className="ml-2 w-8 h-px bg-gold-500/30" />
            </div>
          </div>
        </Container>
      </section>

      {/* Interactive Map */}
      {mapDestinations.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading
              title="Explore Our Routes"
              subtitle="Click any destination on the map to learn more about the experience."
              align="center"
            />
            <Reveal>
              <DubaiCoastMap
                destinations={mapDestinations}
                onMarkerClick={handleMarkerClick}
              />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Category Filters + Destination Cards Grid */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Our Destinations & Experiences"
            subtitle="Every charter route is carefully curated to showcase the best of Dubai's coastline and waterways."
            align="center"
          />

          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-navy-800 border border-white/5">
              {tabs.map((tab) => {
                const count = tabCounts[tab.id] || 0;
                if (tab.id !== "all" && count === 0) return null;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 shadow-lg shadow-gold-500/20"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? "bg-navy-950/20 text-navy-950"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((destination, i) => (
              <Reveal key={destination.slug} delay={i * 80}>
                <DestinationCard destination={destination} index={i} />
              </Reveal>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-lg">
                No {activeTab === "all" ? "" : activeTab + " "}destinations
                available yet.
              </p>
              <p className="text-white/25 text-sm mt-2">
                Check back soon for new experiences.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Seasonal Guide */}
      <section className="py-24 sm:py-32 bg-navy-900">
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
