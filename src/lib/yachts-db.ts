import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "./supabase/server";
import { withRetry } from "./supabase/with-retry";
import type { Database } from "./supabase/types";
import type { Yacht } from "@/types/yacht";

type SupabaseDbClient = SupabaseClient<Database>;
type YachtRow = Database["public"]["Tables"]["yachts"]["Row"];
type YachtImageRow = Database["public"]["Tables"]["yacht_images"]["Row"];
type YachtSpecRow = Database["public"]["Tables"]["yacht_specs"]["Row"];
type YachtAmenityRow = Database["public"]["Tables"]["yacht_amenities"]["Row"];
type YachtPricingRow = Database["public"]["Tables"]["yacht_pricing"]["Row"];
type YachtIncludedRow = Database["public"]["Tables"]["yacht_included"]["Row"];

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
    (yachts as YachtRow[]).map((y) => mapYachtFromDB(supabase, y, false))
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
    (yachts as YachtRow[]).map((y) => mapYachtFromDB(supabase, y, false))
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

  return mapYachtFromDB(supabase, yacht as YachtRow, true);
}

async function mapYachtFromDB(
  supabase: SupabaseDbClient,
  dbYacht: YachtRow,
  full: boolean
): Promise<Yacht> {
  // Fetch images and pricing in parallel (always needed for cards + detail).
  // No shared array here: Postgrest's `.select("*")` result type does not
  // line up 1:1 with our hand-written Row types, so each query is awaited
  // on its own and cast individually instead of via one heterogeneous array.
  const [imagesRes, pricingRes] = await Promise.all([
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
  ]);

  const images = (imagesRes.data ?? []) as YachtImageRow[];
  const pricing = (pricingRes.data ?? []) as YachtPricingRow[];

  let specs: YachtSpecRow[] = [];
  let amenities: YachtAmenityRow[] = [];
  let included: YachtIncludedRow[] = [];

  // Only fetch specs/amenities/included for detail pages
  if (full) {
    const [specsRes, amenitiesRes, includedRes] = await Promise.all([
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
        .order("sort_order", { ascending: true }),
    ]);

    specs = (specsRes.data ?? []) as YachtSpecRow[];
    amenities = (amenitiesRes.data ?? []) as YachtAmenityRow[];
    included = (includedRes.data ?? []) as YachtIncludedRow[];
  }

  const heroImg = images.find((img) => img.category === "hero");
  const heroImage = heroImg?.url ?? images[0]?.url ?? "";

  // Always place the hero image first so the gallery opens on it
  const imageUrls: string[] = heroImg
    ? [heroImg.url, ...images.filter((img) => img.id !== heroImg.id).map((img) => img.url)]
    : images.map((img) => img.url);

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
    specs: specs.map((s) => ({ label: s.label, value: s.value })),
    amenities: amenities.map((a) => ({
      icon: a.icon || "anchor",
      label: a.label,
    })),
    pricing: pricing.map((p) => ({
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
      validFrom: p.valid_from ?? null,
      validTo: p.valid_to ?? null,
      isWeekend: p.is_weekend ?? false,
    })),
    included: included.map((i) => i.item),
    featured: dbYacht.featured,
    youtubeShorts: dbYacht.youtube_shorts || [],
    youtubeVideo: dbYacht.youtube_video || "",
    showVideos: dbYacht.show_videos ?? false,
    dailyRules: dbYacht.daily_rules || "",
    weeklyRules: dbYacht.weekly_rules || "",
    minHoursWeekday: dbYacht.min_hours_weekday ?? undefined,
    minHoursWeekend: dbYacht.min_hours_weekend ?? undefined,
    currency: dbYacht.currency || undefined,
    calendarId: dbYacht.calendar_id ?? null,
    bookingEnabled: dbYacht.booking_enabled ?? undefined,
  };
}
