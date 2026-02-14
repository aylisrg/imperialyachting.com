"use client";

import { MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { AdventureCard } from "@/components/destinations/AdventureCard";
import type { Destination, DestinationCategory } from "@/types/common";
import { cn } from "@/lib/utils";

interface CatalogGridProps {
  items: Destination[];
  activeCategoryFilter: DestinationCategory | null;
  onCategoryChange: (category: DestinationCategory | null) => void;
  onItemClick: (slug: string) => void;
}

const categoryTabs: { value: DestinationCategory | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "destination", label: "Destinations" },
  { value: "experience", label: "Experiences" },
  { value: "activity", label: "Activities" },
];

export function CatalogGrid({
  items,
  activeCategoryFilter,
  onCategoryChange,
  onItemClick,
}: CatalogGridProps) {
  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto no-scrollbar">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value ?? "all"}
            onClick={() => onCategoryChange(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-300",
              tab.value === activeCategoryFilter
                ? "bg-gold-500/15 text-gold-400 border border-gold-500/20"
                : "text-white/40 hover:text-white/60 border border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.slug} delay={i * 80}>
              {item.category === "destination" ? (
                <DestinationCard destination={item} index={i} />
              ) : (
                <AdventureCard
                  adventure={item}
                  index={i}
                  onClick={() => onItemClick(item.slug)}
                />
              )}
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No adventures match your filters.</p>
          <p className="text-white/25 text-sm mt-2">
            Try a different time or category.
          </p>
        </div>
      )}
    </div>
  );
}
