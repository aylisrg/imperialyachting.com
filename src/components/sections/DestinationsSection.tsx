"use client";

import { useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { DubaiSchematicMap } from "@/components/map/DubaiSchematicMap";
import { TimeFilter } from "@/components/map/TimeFilter";
import { ViewToggle } from "@/components/map/ViewToggle";
import { RouteCalculator } from "@/components/map/RouteCalculator";
import { CatalogGrid } from "@/components/destinations/CatalogGrid";
import { RouteDrawer } from "@/components/destinations/RouteDrawer";
import { useAdventuresState } from "@/hooks/useAdventuresState";
import { mergeWithAdventures } from "@/lib/adventures";
import type { Destination } from "@/types/common";

interface DestinationsSectionProps {
  destinations: Destination[];
}

export function DestinationsSection({ destinations }: DestinationsSectionProps) {
  // Merge server destinations with static adventures data
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
    <section className="py-24 sm:py-32 bg-navy-900 overflow-hidden">
      <Container>
        {/* Section header */}
        <SectionHeading
          title="Adventures & Map"
          subtitle="From iconic landmarks to exclusive sunrise experiences — discover Dubai's coastline through our curated adventures."
          align="center"
        />

        {/* Controls bar */}
        <Reveal>
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
        </Reveal>

        {/* Content area */}
        <Reveal>
          <div className="relative min-h-[400px]">
            {/* Map View */}
            <div
              className={`view-panel ${
                state.view === "map" ? "view-panel-active" : "view-panel-hidden"
              }`}
            >
              <div className="relative">
                {/* Map */}
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

                {/* Route Calculator — positioned bottom-right on desktop */}
                {selectedItem && (
                  <div className="mt-4 sm:absolute sm:bottom-4 sm:right-4 sm:mt-0">
                    <RouteCalculator item={selectedItem} />
                  </div>
                )}
              </div>
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
        </Reveal>

        {/* View all CTA */}
        <div className="mt-14 text-center">
          <Button variant="secondary" size="lg" href="/destinations">
            Explore All Adventures
          </Button>
        </div>
      </Container>

      {/* Route Drawer — outside Container for full-width slide */}
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
    </section>
  );
}
