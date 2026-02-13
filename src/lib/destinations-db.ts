import { createServerSupabase } from "./supabase/server";
import type { Destination, DestinationCategory } from "@/types/common";
import type { DestinationRow } from "./supabase/types";

function mapDestination(d: DestinationRow): Destination {
  return {
    slug: d.slug,
    name: d.name,
    description: d.description || "",
    shortDescription: d.short_description || d.description?.slice(0, 120) || "",
    sailingTime: d.sailing_time || "",
    bestFor: d.best_for || [],
    image: d.cover_image || d.image || "",
    coverImage: d.cover_image || d.image || "",
    galleryImages: d.gallery_images || [],
    highlights: d.highlights || [],
    category: (d.category as DestinationCategory) || "destination",
    duration: d.duration || "",
    priceFrom: d.price_from ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    mapLabel: d.map_label || d.name,
    videoUrl: d.video_url || "",
    featured: d.featured ?? false,
    whatIncluded: d.what_included || [],
    itinerary: d.itinerary || [],
  };
}

/**
 * Fetch all destinations from Supabase.
 * Returns only data from the admin panel — no hardcoded fallback.
 */
export async function fetchAllDestinations(): Promise<Destination[]> {
  try {
    const supabase = await createServerSupabase();

    const { data: destinations } = await supabase
      .from("destinations")
      .select("*")
      .order("sort_order", { ascending: true });

    const rows = destinations as DestinationRow[] | null;

    if (!rows || rows.length === 0) return [];

    return rows.map(mapDestination);
  } catch {
    return [];
  }
}

/**
 * Fetch a single destination by slug.
 * Returns only data from the admin panel — no hardcoded fallback.
 */
export async function fetchDestinationBySlug(
  slug: string
): Promise<Destination | null> {
  try {
    const supabase = await createServerSupabase();

    const { data } = await supabase
      .from("destinations")
      .select("*")
      .eq("slug", slug)
      .single();

    const row = data as DestinationRow | null;

    if (row) return mapDestination(row);

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch featured destinations for homepage.
 * Returns only data from the admin panel — no hardcoded fallback.
 */
export async function fetchFeaturedDestinations(): Promise<Destination[]> {
  try {
    const supabase = await createServerSupabase();

    const { data: destinations } = await supabase
      .from("destinations")
      .select("*")
      .eq("featured", true)
      .order("sort_order", { ascending: true });

    const rows = destinations as DestinationRow[] | null;

    if (!rows || rows.length === 0) return [];

    return rows.map(mapDestination);
  } catch {
    return [];
  }
}
