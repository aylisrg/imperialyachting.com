"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ship,
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Eye,
  Loader2,
} from "lucide-react";
import { AdminHeader } from "./components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { Yacht } from "@/lib/supabase/types";

export default function AdminDashboard() {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [imageCounts, setImageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYachts();
  }, []);

  async function loadYachts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("yachts")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      const yachtData = data as Yacht[];
      setYachts(yachtData);
      // Load image counts
      const counts: Record<string, number> = {};
      for (const yacht of yachtData) {
        const { count } = await supabase
          .from("yacht_images")
          .select("*", { count: "exact", head: true })
          .eq("yacht_id", yacht.id);
        counts[yacht.id] = count || 0;
      }
      setImageCounts(counts);
    }
    setLoading(false);
  }

  async function deleteYacht(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all photos and data.`)) {
      return;
    }

    const supabase = createClient();

    // Delete storage files first
    const { data: images } = await supabase
      .from("yacht_images")
      .select("storage_path")
      .eq("yacht_id", id);

    if (images && images.length > 0) {
      const paths = (images as { storage_path: string }[]).map((img) => img.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from("yacht-photos").remove(paths);
      }
    }

    // Delete yacht (cascades to images, specs, pricing, etc.)
    await supabase.from("yachts").delete().eq("id", id);
    loadYachts();
  }

  return (
    <>
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">
              Fleet Management
            </h1>
            <p className="mt-1 text-white/50">
              Manage your yachts, photos, and content.
            </p>
          </div>
          <Link
            href="/admin/yachts/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Yacht
          </Link>
        </div>

        {/* Yacht List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : yachts.length === 0 ? (
          <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
            <Ship className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white/50">
              No yachts yet
            </h2>
            <p className="mt-2 text-white/30 max-w-md mx-auto">
              Add your first yacht to get started. You can manage photos,
              specifications, pricing, and more.
            </p>
            <Link
              href="/admin/yachts/new"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Yacht
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {yachts.map((yacht) => (
              <div
                key={yacht.id}
                className="flex items-center gap-6 p-6 bg-navy-800 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Yacht info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-lg font-bold text-white truncate">
                      {yacht.name}
                    </h3>
                    {yacht.featured && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gold-500/10 text-gold-400 rounded-full border border-gold-500/20">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-white/40 truncate">
                    {yacht.builder} &middot; {yacht.length_ft}ft &middot;{" "}
                    {yacht.capacity} guests &middot; {yacht.location}
                  </p>
                </div>

                {/* Image count */}
                <div className="flex items-center gap-1.5 text-sm text-white/40">
                  <ImageIcon className="w-4 h-4" />
                  {imageCounts[yacht.id] || 0} photos
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/fleet/${yacht.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    title="View on site"
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                  <Link
                    href={`/admin/yachts/${yacht.id}`}
                    className="p-2 rounded-lg text-white/40 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => deleteYacht(yacht.id, yacht.name)}
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
