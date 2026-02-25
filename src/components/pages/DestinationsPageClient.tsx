"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapPin, Anchor, UtensilsCrossed, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DubaiSchematicMap } from "@/components/map/DubaiSchematicMap";
import { TimeFilter } from "@/components/map/TimeFilter";
import { ViewToggle } from "@/components/map/ViewToggle";
import { RouteCalculator } from "@/components/map/RouteCalculator";
import { CatalogGrid } from "@/components/destinations/CatalogGrid";
import { RouteDrawer } from "@/components/destinations/RouteDrawer";
import { useAdventuresState } from "@/hooks/useAdventuresState";
import { mergeWithAdventures } from "@/lib/adventures";
import type { Destination } from "@/types/common";
import { SITE_CONFIG } from "@/lib/constants";

export function DestinationsPageClient({
  destinations,
}: {
  destinations: Destination[];
}) {
  const allItems = useMemo(
    () => mergeWithAdventures(destinations),
    [destinations]
  );

  const {
    state,
    filteredItems,
    highlightedSlugs,
    selectedItem,
    hasActiveFilter,
    setView,
    selectItem,
    deselectItem,
    hoverItem,
    setTimeFilter,
    setCategoryFilter,
    closeDrawer,
    setDrawerTab,
  } = useAdventuresState(allItems);

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
              Adventures & Destinations
            </h1>

            <p className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-2">
              From iconic landmarks to exclusive sunrise expeditions — discover every
              experience waiting for you on Dubai&apos;s coastline.
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

      {/* Interactive Map */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <SectionHeading
            title="Explore the Coast"
            subtitle="Click any point on the map to see route details, sailing time, and pricing."
            align="center"
          />

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <TimeFilter
              activeFilter={state.activeTimeFilter}
              onFilterChange={setTimeFilter}
            />
            <ViewToggle
              view={state.view}
              onViewChange={setView}
            />
          </div>

          {/* Map / Catalog toggle */}
          <div className="relative min-h-[400px]">
            {/* Map View */}
            <div
              className={`view-panel ${
                state.view === "map" ? "view-panel-active" : "view-panel-hidden"
              }`}
            >
              <Reveal>
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden border border-white/5">
                    <DubaiSchematicMap
                      items={allItems}
                      selectedSlug={state.selectedSlug}
                      hoveredSlug={state.hoveredSlug}
                      highlightedSlugs={highlightedSlugs}
                      hasActiveFilter={hasActiveFilter}
                      onMarkerClick={selectItem}
                      onMarkerHover={hoverItem}
                    />
                  </div>

                  {selectedItem && (
                    <div className="mt-4 sm:absolute sm:bottom-4 sm:right-4 sm:mt-0">
                      <RouteCalculator item={selectedItem} />
                    </div>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Catalog View */}
            <div
              className={`view-panel ${
                state.view === "catalog" ? "view-panel-active" : "view-panel-hidden"
              }`}
            >
              <CatalogGrid
                items={filteredItems}
                activeCategoryFilter={state.activeCategoryFilter}
                onCategoryChange={setCategoryFilter}
                onItemClick={selectItem}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Departure Point Banner + Full Card Grid */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="All Adventures"
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

          {/* Dock & Dine Guide banner */}
          <Reveal>
            <Link
              href="/destinations/dock-and-dine-dubai"
              className="mb-12 flex items-center gap-4 rounded-xl bg-navy-800/60 border border-gold-500/15 hover:border-gold-500/30 px-6 py-4 max-w-2xl mx-auto transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                <UtensilsCrossed className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                  Dock &amp; Dine Guide
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  20 marinas in Dubai where yachts moor for free while dining at
                  waterfront restaurants.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-gold-400 transition-colors flex-shrink-0" />
            </Link>
          </Reveal>

          {/* Full catalog */}
          <CatalogGrid
            items={allItems}
            activeCategoryFilter={null}
            onCategoryChange={() => {}}
            onItemClick={selectItem}
          />
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
            Whether it&apos;s a sunrise dolphin expedition or a full-day island
            adventure, we&apos;ll make it unforgettable.
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

      {/* Route Drawer */}
      <RouteDrawer
        item={selectedItem}
        isOpen={state.drawerOpen}
        activeTab={state.drawerTab}
        onClose={() => {
          closeDrawer();
          deselectItem();
        }}
        onTabChange={setDrawerTab}
      />
    </>
  );
}
