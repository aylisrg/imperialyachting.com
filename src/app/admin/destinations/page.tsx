"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Eye,
  Loader2,
  Star,
  Sparkles,
  Tag,
  Map,
  List,
} from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { AdminMapEditor } from "./components/AdminMapEditor";
import { createClient } from "@/lib/supabase/client";
import type { DestinationRow } from "@/lib/supabase/types";

type ViewMode = "list" | "map";

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<DestinationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [savingMap, setSavingMap] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    const supabase = createClient();
    const { data } = await supabase
      .from("destinations")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) {
      setDestinations(data as DestinationRow[]);
    }
    setLoading(false);
  }

  async function deleteDestination(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    const supabase = createClient();

    const dest = destinations.find((d) => d.id === id);
    if (dest?.image && dest.image.includes("destination-photos")) {
      const match = dest.image.match(/destination-photos\/(.+)$/);
      if (match) {
        await supabase.storage.from("destination-photos").remove([match[1]]);
      }
    }

    await supabase.from("destinations").delete().eq("id", id);
    loadDestinations();
  }

  const handleMapSave = useCallback(
    async (
      points: { id: string; name: string; mapLabel: string; x: number; y: number; category: string }[]
    ) => {
      setSavingMap(true);
      const supabase = createClient();

      for (const point of points) {
        await supabase
          .from("destinations")
          .update({ map_x: point.x, map_y: point.y })
          .eq("id", point.id);
      }

      await loadDestinations();
      setSavingMap(false);
    },
    []
  );

  const mapPoints = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    mapLabel: d.map_label || d.name,
    x: d.map_x ?? 500,
    y: d.map_y ?? 300,
    category: d.category || "destination",
  }));

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "experience":
        return {
          bg: "bg-sea-500/15 text-sea-400",
          icon: <Sparkles className="w-2.5 h-2.5" />,
        };
      case "activity":
        return {
          bg: "bg-sea-400/15 text-sea-400",
          icon: <Tag className="w-2.5 h-2.5" />,
        };
      default:
        return {
          bg: "bg-gold-500/15 text-gold-400",
          icon: <MapPin className="w-2.5 h-2.5" />,
        };
    }
  };

  return (
    <>
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/admin"
                className="text-white/40 hover:text-white/60 text-sm"
              >
                Dashboard
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-white/60 text-sm">Destinations</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-white">
              Destinations & Adventures
            </h1>
            <p className="mt-1 text-white/50">
              Manage destinations, experiences, and map positions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-navy-800 border border-white/5">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === "list"
                    ? "bg-gold-500/20 text-gold-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === "map"
                    ? "bg-gold-500/20 text-gold-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>

            <Link
              href="/admin/destinations/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Destination
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
            <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white/50">
              No destinations yet
            </h2>
            <p className="mt-2 text-white/30 max-w-md mx-auto">
              Add your first destination to get started.
            </p>
            <Link
              href="/admin/destinations/new"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Destination
            </Link>
          </div>
        ) : viewMode === "map" ? (
          /* Map View */
          <div className="space-y-6">
            <div className="p-6 bg-navy-800 rounded-2xl border border-white/5">
              <h2 className="font-heading text-lg font-bold text-white mb-4">
                Map Position Editor
              </h2>
              <p className="text-sm text-white/40 mb-6">
                Drag destination markers to reposition them on the schematic map.
                Changes are saved to the database and reflected on the public
                Destinations page.
              </p>
              <AdminMapEditor
                points={mapPoints}
                onSave={handleMapSave}
                saving={savingMap}
              />
            </div>

            {/* Quick reference list */}
            <div className="p-6 bg-navy-800 rounded-2xl border border-white/5">
              <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider mb-4">
                All Destinations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {destinations.map((dest) => {
                  const badge = getCategoryBadge(dest.category);
                  return (
                    <Link
                      key={dest.id}
                      href={`/admin/destinations/${dest.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-navy-900 border border-white/5 hover:border-gold-500/20 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-navy-700 flex-shrink-0">
                        {dest.image ? (
                          <img
                            src={dest.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-3 h-3 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium truncate group-hover:text-gold-400 transition-colors">
                          {dest.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold ${badge.bg} px-1.5 py-0.5 rounded-full`}
                        >
                          {badge.icon}
                          {dest.category || "destination"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* List View - Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {destinations.map((dest) => {
              const badge = getCategoryBadge(dest.category);
              return (
                <div
                  key={dest.id}
                  className="bg-navy-800 rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-navy-700">
                    {dest.image || dest.cover_image ? (
                      <img
                        src={dest.cover_image || dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/10" />
                      </div>
                    )}

                    {/* Badges overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${badge.bg}`}
                      >
                        {badge.icon}
                        {dest.category || "destination"}
                      </span>
                      {dest.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-gold-500/20 text-gold-400 backdrop-blur-sm">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Gallery count */}
                    {dest.gallery_images && dest.gallery_images.length > 0 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-navy-950/70 backdrop-blur-sm text-[10px] text-white/60">
                        <ImageIcon className="w-3 h-3" />
                        {dest.gallery_images.length} photos
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-white truncate">
                      {dest.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/40 line-clamp-2">
                      {dest.short_description || dest.description}
                    </p>

                    {/* Meta */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-white/30">
                      {dest.sailing_time && (
                        <span>{dest.sailing_time}</span>
                      )}
                      {dest.duration && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>{dest.duration}</span>
                        </>
                      )}
                      {dest.price_from && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-gold-400/60">
                            from {dest.price_from.toLocaleString()} AED
                          </span>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {dest.best_for && dest.best_for.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {dest.best_for.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40"
                          >
                            {tag}
                          </span>
                        ))}
                        {dest.best_for.length > 4 && (
                          <span className="px-2 py-0.5 text-[10px] text-white/30">
                            +{dest.best_for.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center border-t border-white/5">
                    <a
                      href={`/destinations/${dest.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                      title="View on site"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <div className="w-px h-8 bg-white/5" />
                    <Link
                      href={`/admin/destinations/${dest.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-white/40 hover:text-gold-400 hover:bg-gold-500/5 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <div className="w-px h-8 bg-white/5" />
                    <button
                      onClick={() => deleteDestination(dest.id, dest.name)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
