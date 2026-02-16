import { createServerSupabase } from "./supabase/server";
import { withRetry } from "./supabase/with-retry";
import type { Yacht } from "@/types/yacht";

/**
 * Fetch all yachts from Supabase with images and pricing.
 * Retries on transient failures. Throws on persistent failure —
 * never silently returns empty (let error boundaries handle it).
 */
export async function fetchAllYachts(): Promise<Yacht[]> {
  const supabase = await createServerSupabase();

  const yachts = await withRetry(
    () =>
      supabase
        .from("yachts")
        .select("*")
        .order("created_at", { ascending: true }),
    { label: "fetchAllYachts" }
  );

  if (!yachts || (yachts as unknown[]).length === 0) return [];

  return Promise.all(
    (yachts as Record<string, unknown>[]).map((y) =>
      mapYachtFromDB(supabase, y, false)
    )
  );
}

/**
 * Fetch featured yachts from Supabase.
 * Retries on transient failures. Throws on persistent failure.
 */
export async function fetchFeaturedYachts(): Promise<Yacht[]> {
  const supabase = await createServerSupabase();

  const yachts = await withRetry(
    () =>
      supabase
        .from("yachts")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: true }),
    { label: "fetchFeaturedYachts" }
  );

  if (!yachts || (yachts as unknown[]).length === 0) return [];

  return Promise.all(
    (yachts as Record<string, unknown>[]).map((y) =>
      mapYachtFromDB(supabase, y, false)
    )
  );
}

/**
 * Fetch a single yacht with all relations (specs, amenities, pricing, included).
 * Retries on transient failures. Throws on persistent failure.
 * Returns null only when the yacht genuinely doesn't exist.
 */
export async function fetchYachtBySlug(
  slug: string
): Promise<Yacht | null> {
  const supabase = await createServerSupabase();

  const yacht = await withRetry(
    () =>
      supabase
        .from("yachts")
        .select("*")
        .eq("slug", slug)
        .single(),
    { label: `fetchYachtBySlug(${slug})` }
  );

  if (!yacht) return null;

  return mapYachtFromDB(
    supabase,
    yacht as Record<string, unknown>,
    true
  );
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
    "";

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
