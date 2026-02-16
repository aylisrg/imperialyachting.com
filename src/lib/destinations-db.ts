import { createServerSupabase } from "./supabase/server";
import type { Destination, DestinationCategory } from "@/types/common";
import type { DestinationRow } from "./supabase/types";
import { destinations as staticDestinations } from "@/data/destinations";

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
    mapPosition:
      d.map_x != null && d.map_y != null
        ? { x: d.map_x, y: d.map_y }
        : undefined,
  };
}

/**
 * Fetch all destinations from Supabase.
 * Falls back to static data if Supabase returns empty or errors.
 */
export async function fetchAllDestinations(): Promise<Destination[]> {
  try {
    const supabase = await createServerSupabase();

    const { data: destinations, error } = await supabase
      .from("destinations")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[fetchAllDestinations] Supabase query error:", error.message);
      return staticDestinations;
    }

    const rows = destinations as DestinationRow[] | null;

    if (!rows || rows.length === 0) return staticDestinations;

    return rows.map(mapDestination);
  } catch (error) {
    console.error("[fetchAllDestinations] Unexpected error:", error);
    return staticDestinations;
  }
}

/**
 * Fetch a single destination by slug.
 * Falls back to static data if Supabase returns null or errors.
 */
export async function fetchDestinationBySlug(
  slug: string
): Promise<Destination | null> {
  const staticMatch = staticDestinations.find((d) => d.slug === slug) ?? null;
  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`[fetchDestinationBySlug] Supabase query error for "${slug}":`, error.message);
      return staticMatch;
    }

    const row = data as DestinationRow | null;

    if (row) return mapDestination(row);

    return staticMatch;
  } catch (error) {
    console.error(`[fetchDestinationBySlug] Unexpected error for "${slug}":`, error);
    return staticMatch;
  }
}

/**
 * Fetch featured destinations for homepage.
 * Falls back to static featured destinations if Supabase returns empty or errors.
 */
export async function fetchFeaturedDestinations(): Promise<Destination[]> {
  const staticFeatured = staticDestinations.filter((d) => d.featured);
  try {
    const supabase = await createServerSupabase();

    const { data: destinations, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("featured", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[fetchFeaturedDestinations] Supabase query error:", error.message);
      return staticFeatured;
    }

    const rows = destinations as DestinationRow[] | null;

    if (!rows || rows.length === 0) return staticFeatured;

    return rows.map(mapDestination);
  } catch (error) {
    console.error("[fetchFeaturedDestinations] Unexpected error:", error);
    return staticFeatured;
  }
}
