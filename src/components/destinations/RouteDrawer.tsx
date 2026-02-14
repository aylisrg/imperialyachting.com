"use client";

import { useEffect } from "react";
import {
  X,
  Clock,
  Navigation,
  CheckCircle,
  Anchor,
  DollarSign,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/constants";
import type { Destination } from "@/types/common";
import type { DrawerTab } from "@/hooks/useAdventuresState";
import { cn } from "@/lib/utils";

interface RouteDrawerProps {
  item: Destination | null;
  isOpen: boolean;
  activeTab: DrawerTab;
  onClose: () => void;
  onTabChange: (tab: DrawerTab) => void;
}

const tabs: { value: DrawerTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "route", label: "Route" },
  { value: "expect", label: "Itinerary" },
  { value: "price", label: "Price" },
];

const categoryLabels: Record<string, string> = {
  destination: "Destination",
  experience: "Experience",
  activity: "Activity",
};

export function RouteDrawer({
  item,
  isOpen,
  activeTab,
  onClose,
  onTabChange,
}: RouteDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "route-drawer fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] lg:w-[560px] bg-navy-900 border-l border-white/5 shadow-2xl overflow-y-auto",
          isOpen && "open"
        )}
      >
        {item && (
          <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-navy-900/95 backdrop-blur-sm border-b border-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Badge
                    variant={item.category === "experience" ? "gold" : item.category === "activity" ? "sea" : "white"}
                    className="mb-2"
                  >
                    {categoryLabels[item.category] ?? item.category}
                  </Badge>
                  <h2 className="font-heading text-xl font-bold text-white truncate">
                    {item.name}
                  </h2>
                  {item.area && (
                    <p className="text-sm text-white/40 mt-1">{item.area}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-300",
                      tab.value === activeTab
                        ? "bg-gold-500/15 text-gold-400"
                        : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-5">
              {activeTab === "overview" && (
                <OverviewTab item={item} />
              )}
              {activeTab === "route" && (
                <RouteTab item={item} />
              )}
              {activeTab === "expect" && (
                <ItineraryTab item={item} />
              )}
              {activeTab === "price" && (
                <PriceTab item={item} />
              )}
            </div>

            {/* Footer CTA */}
            <div className="sticky bottom-0 bg-navy-900/95 backdrop-blur-sm border-t border-white/5 p-5">
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  href={SITE_CONFIG.whatsapp}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  href={`/destinations/${item.slug}`}
                >
                  Full Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ===== Tab Panels ===== */

function OverviewTab({ item }: { item: Destination }) {
  return (
    <div className="space-y-6">
      {/* Special label */}
      {item.specialLabel && (
        <div className="inline-flex items-center gap-2 rounded-lg bg-gold-500/10 border border-gold-500/15 px-4 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
          <span className="text-sm text-gold-400 font-medium">{item.specialLabel}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-white/60 leading-relaxed">
        {item.description}
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {item.duration && (
          <StatBox icon={<Clock className="w-4 h-4 text-gold-400" />} label="Duration" value={item.duration} />
        )}
        {item.sailingTime && (
          <StatBox icon={<Navigation className="w-4 h-4 text-gold-400" />} label="Sailing" value={item.sailingTime} />
        )}
        {item.distanceNM !== undefined && item.distanceNM > 0 && (
          <StatBox icon={<Anchor className="w-4 h-4 text-gold-400" />} label="Distance" value={`${item.distanceNM} NM`} />
        )}
        {item.startTime && (
          <StatBox icon={<Clock className="w-4 h-4 text-gold-400" />} label="Start Time" value={item.startTime} />
        )}
      </div>

      {/* Highlights */}
      {item.highlights.length > 0 && (
        <div>
          <h4 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
            Highlights
          </h4>
          <div className="grid gap-2">
            {item.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-gold-500/60 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best for tags */}
      {item.bestFor.length > 0 && (
        <div>
          <h4 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
            Best For
          </h4>
          <div className="flex flex-wrap gap-2">
            {item.bestFor.map((tag) => (
              <Badge key={tag} variant="gold">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RouteTab({ item }: { item: Destination }) {
  return (
    <div className="space-y-6">
      {/* Route info */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-gold-500" />
          <span className="text-sm font-medium text-white/70">Dubai Harbour</span>
          <div className="flex-1 border-t border-dashed border-gold-500/30 mx-2" />
          <span className="text-sm font-medium text-white/70">{item.mapLabel}</span>
          <div className="w-3 h-3 rounded-full border-2 border-gold-500 bg-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Distance</p>
            <p className="font-heading text-lg font-bold text-white mt-1">
              {item.distanceNM ?? "—"} <span className="text-xs text-white/40">NM</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Cruising</p>
            <p className="font-heading text-lg font-bold text-white mt-1">
              {item.cruisingTimeMinutes
                ? item.cruisingTimeMinutes >= 60
                  ? `${Math.floor(item.cruisingTimeMinutes / 60)}h ${item.cruisingTimeMinutes % 60}m`
                  : `${item.cruisingTimeMinutes}m`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Start</p>
            <p className="font-heading text-lg font-bold text-white mt-1">
              {item.recommendedStartTime ?? "Flex"}
            </p>
          </div>
        </div>
      </div>

      {/* Map area info */}
      {item.area && (
        <div className="rounded-xl bg-navy-800/50 border border-white/5 p-4">
          <h4 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-2">
            Area
          </h4>
          <p className="text-sm text-white/60">{item.area}</p>
        </div>
      )}

      {item.sailingTime && (
        <div className="flex items-center gap-3 text-sm text-white/50">
          <Navigation className="w-4 h-4 text-gold-500/60" />
          <span>{item.sailingTime}</span>
        </div>
      )}
    </div>
  );
}

function ItineraryTab({ item }: { item: Destination }) {
  return (
    <div className="space-y-6">
      {item.itinerary.length > 0 ? (
        <div className="itinerary-line">
          {item.itinerary.map((step, i) => (
            <div key={i} className="relative pb-6 last:pb-0">
              {/* Step number circle */}
              <div className="absolute left-[-25px] w-8 h-8 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-gold-400">{i + 1}</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/40">Itinerary details available on request.</p>
        </div>
      )}

      {/* What's included */}
      {item.whatIncluded.length > 0 && (
        <div>
          <h4 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
            What&apos;s Included
          </h4>
          <div className="grid gap-2">
            {item.whatIncluded.map((inc) => (
              <div key={inc} className="flex items-center gap-2.5 rounded-lg bg-navy-800/50 border border-white/5 px-3 py-2">
                <CheckCircle className="w-3.5 h-3.5 text-gold-500/60 flex-shrink-0" />
                <span className="text-sm text-white/60">{inc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceTab({ item }: { item: Destination }) {
  return (
    <div className="space-y-6">
      {/* Price card */}
      <div className="rounded-xl bg-navy-800/60 border border-gold-500/10 p-6 text-center">
        {item.priceFrom ? (
          <>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Starting from</p>
            <p className="font-heading text-4xl font-bold text-white">
              AED {item.priceFrom.toLocaleString("en-US")}
            </p>
            <p className="text-sm text-white/30 mt-2">per charter</p>
          </>
        ) : (
          <>
            <DollarSign className="w-8 h-8 text-gold-500/40 mx-auto mb-3" />
            <p className="font-heading text-lg font-bold text-white mb-1">Custom Pricing</p>
            <p className="text-sm text-white/40">
              Contact our team for a tailored quote based on your yacht and group size.
            </p>
          </>
        )}
      </div>

      {/* Price includes */}
      {item.whatIncluded.length > 0 && (
        <div>
          <h4 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
            Price Includes
          </h4>
          <div className="space-y-2">
            {item.whatIncluded.map((inc) => (
              <div key={inc} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-gold-500/60 flex-shrink-0" />
                <span className="text-sm text-white/60">{inc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistic */}
      {item.statistic && (
        <div className="rounded-xl bg-gold-500/5 border border-gold-500/10 p-4 text-center">
          <p className="text-sm text-gold-400 italic">{item.statistic}</p>
        </div>
      )}

      {/* CTA */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          href={SITE_CONFIG.whatsapp}
          className="w-full justify-center"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Get a Quote on WhatsApp
        </Button>
        <p className="text-xs text-white/30 text-center">
          Response within 30 minutes during business hours
        </p>
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-navy-800/50 border border-white/5 p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-white/70">{value}</p>
    </div>
  );
}
