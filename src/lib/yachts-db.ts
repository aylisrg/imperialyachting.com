import { createServerSupabase } from "./supabase/server";
import type { Yacht } from "@/types/yacht";
import { yachts as staticYachts } from "@/data/yachts";

/**
 * Fetch all yachts from Supabase with images and pricing.
 * Falls back to static data if Supabase returns empty or errors.
 */
export async function fetchAllYachts(): Promise<Yacht[]> {
  try {
    const supabase = await createServerSupabase();

    const { data: yachts, error } = await supabase
      .from("yachts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[fetchAllYachts] Supabase query error:", error.message);
      return staticYachts;
    }

    if (!yachts || yachts.length === 0) return staticYachts;

    return Promise.all(
      yachts.map((y) => mapYachtFromDB(supabase, y, false))
    );
  } catch (error) {
    console.error("[fetchAllYachts] Unexpected error:", error);
    return staticYachts;
  }
}

/**
 * Fetch featured yachts from Supabase.
 * Falls back to static featured yachts if Supabase returns empty or errors.
 */
export async function fetchFeaturedYachts(): Promise<Yacht[]> {
  const staticFeatured = staticYachts.filter((y) => y.featured);
  try {
    const supabase = await createServerSupabase();

    const { data: yachts, error } = await supabase
      .from("yachts")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[fetchFeaturedYachts] Supabase query error:", error.message);
      return staticFeatured;
    }

    if (!yachts || yachts.length === 0) return staticFeatured;

    return Promise.all(
      yachts.map((y) => mapYachtFromDB(supabase, y, false))
    );
  } catch (error) {
    console.error("[fetchFeaturedYachts] Unexpected error:", error);
    return staticFeatured;
  }
}

/**
 * Fetch a single yacht with all relations (specs, amenities, pricing, included).
 * Falls back to static data if Supabase returns null or errors.
 */
export async function fetchYachtBySlug(slug: string): Promise<Yacht | null> {
  const staticMatch = staticYachts.find((y) => y.slug === slug) ?? null;
  try {
    const supabase = await createServerSupabase();

    const { data: yacht, error } = await supabase
      .from("yachts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`[fetchYachtBySlug] Supabase query error for "${slug}":`, error.message);
      return staticMatch;
    }

    if (!yacht) return staticMatch;

    return mapYachtFromDB(supabase, yacht, true);
  } catch (error) {
    console.error(`[fetchYachtBySlug] Unexpected error for "${slug}":`, error);
    return staticMatch;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapYachtFromDB(supabase: any, dbYacht: any, full: boolean): Promise<Yacht> {
  // Fetch images and pricing in parallel (always needed for cards + detail)
  const queries: Promise<{ data: any[] | null }>[] = [
    supabase
      .from("yacht_images")
      .select("*")
      .eq("yacht_id", dbYacht.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("yacht_pricing")
      .select("*")
      .eq("yacht_id", dbYacht.id)
      .order("sort_order", { ascending: true }),
  ];

  // Only fetch specs/amenities/included for detail pages
  if (full) {
    queries.push(
      supabase
        .from("yacht_specs")
        .select("*")
        .eq("yacht_id", dbYacht.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("yacht_amenities")
        .select("*")
        .eq("yacht_id", dbYacht.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("yacht_included")
        .select("*")
        .eq("yacht_id", dbYacht.id)
        .order("sort_order", { ascending: true })
    );
  }

  const results = await Promise.all(queries);
  const images = results[0].data ?? [];
  const pricing = results[1].data ?? [];
  const specs = full ? (results[2].data ?? []) : [];
  const amenities = full ? (results[3].data ?? []) : [];
  const included = full ? (results[4].data ?? []) : [];

  const heroImage =
    images.find((img: any) => img.category === "hero")?.url ??
    images[0]?.url ??
    `/media/yachts/${dbYacht.slug}/hero.jpg`;

  const imageUrls: string[] = images.map((img: any) => img.url);

  return {
    slug: dbYacht.slug,
    name: dbYacht.name,
    tagline: dbYacht.tagline || "",
    description: dbYacht.description || "",
    builder: dbYacht.builder || "",
    year: dbYacht.year || 2020,
    refit: dbYacht.refit ?? undefined,
    length: {
      feet: dbYacht.length_ft || 0,
      meters: dbYacht.length_m || 0,
    },
    capacity: dbYacht.capacity || 0,
    cabins: dbYacht.cabins ?? undefined,
    location: dbYacht.location || "",
    heroImage,
    images: imageUrls.length > 0 ? imageUrls : [heroImage],
    specs: specs.map((s: any) => ({ label: s.label, value: s.value })),
    amenities: amenities.map((a: any) => ({
      icon: a.icon || "anchor",
      label: a.label,
    })),
    pricing: pricing.map((p: any) => ({
      season: p.season,
      period: p.period,
      hourly: p.hourly ?? null,
      daily: p.daily,
      weekly: p.weekly,
      monthly: p.monthly,
      hourlyB2B: p.hourly_b2b ?? undefined,
      dailyB2B: p.daily_b2b ?? undefined,
      weeklyB2B: p.weekly_b2b ?? undefined,
      monthlyB2B: p.monthly_b2b ?? undefined,
    })),
    included: included.map((i: any) => i.item),
    featured: dbYacht.featured,
    youtubeShorts: dbYacht.youtube_shorts || [],
    youtubeVideo: dbYacht.youtube_video || "",
    showVideos: dbYacht.show_videos ?? false,
  };
}
