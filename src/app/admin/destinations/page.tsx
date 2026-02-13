"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { DestinationRow } from "@/lib/supabase/types";

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<DestinationRow[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Find the destination to get image storage path
    const dest = destinations.find((d) => d.id === id);
    if (dest?.image && dest.image.includes("destination-photos")) {
      // Extract storage path from URL
      const match = dest.image.match(/destination-photos\/(.+)$/);
      if (match) {
        await supabase.storage.from("destination-photos").remove([match[1]]);
      }
    }

    await supabase.from("destinations").delete().eq("id", id);
    loadDestinations();
  }

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
              Destinations
            </h1>
            <p className="mt-1 text-white/50">
              Manage charter destinations and their images.
            </p>
          </div>
          <Link
            href="/admin/destinations/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Destination
          </Link>
        </div>

        {/* Destinations List */}
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
              Add your first destination to get started. You can manage images,
              descriptions, and more.
            </p>
            <Link
              href="/admin/destinations/new"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Destination
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="flex items-center gap-6 p-6 bg-navy-800 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Image preview */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-navy-700 flex-shrink-0 flex items-center justify-center">
                  {dest.image ? (
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white/20" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-white truncate">
                      {dest.name}
                    </h3>
                    {dest.featured && (
                      <Star className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                        dest.category === "experience"
                          ? "bg-sea-500/15 text-sea-400"
                          : dest.category === "activity"
                          ? "bg-sea-400/15 text-sea-400"
                          : "bg-gold-500/15 text-gold-400"
                      }`}
                    >
                      {dest.category === "experience" ? (
                        <Sparkles className="w-2.5 h-2.5" />
                      ) : dest.category === "activity" ? (
                        <Tag className="w-2.5 h-2.5" />
                      ) : (
                        <MapPin className="w-2.5 h-2.5" />
                      )}
                      {dest.category || "destination"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/40 truncate">
                    {dest.sailing_time} &middot;{" "}
                    {dest.best_for?.join(", ") || "No tags"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/destinations/${dest.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    title="View on site"
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                  <Link
                    href={`/admin/destinations/${dest.id}`}
                    className="p-2 rounded-lg text-white/40 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => deleteDestination(dest.id, dest.name)}
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
