import type { MetadataRoute } from "next";
import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";
import { createPublicSupabase } from "@/lib/supabase/public";

const BASE_URL = "https://imperialyachting.com";
const FIXED_LEGAL_DATE = "2025-01-01";

interface SlugUpdatedAt {
  slug: string;
  updatedAt: Date | null;
}

async function fetchYachtSlugsAndDates(): Promise<SlugUpdatedAt[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("yachts")
      .select("slug, updated_at");

    if (error || !data) throw error ?? new Error("No data");

    return (data as { slug: string; updated_at: string | null }[]).map((row) => ({
      slug: row.slug,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    }));
  } catch {
    const yachts = await fetchAllYachts();
    return yachts.map((yacht) => ({ slug: yacht.slug, updatedAt: null }));
  }
}

async function fetchDestinationSlugsAndDates(): Promise<SlugUpdatedAt[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("destinations")
      .select("slug, updated_at");

    if (error || !data) throw error ?? new Error("No data");

    return (data as { slug: string; updated_at: string | null }[]).map((row) => ({
      slug: row.slug,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    }));
  } catch {
    const destinations = await fetchAllDestinations();
    return destinations.map((dest) => ({ slug: dest.slug, updatedAt: null }));
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1.0, lastModified: now },
    { url: `${BASE_URL}/fleet`, changeFrequency: "weekly" as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly" as const, priority: 0.85, lastModified: now },
    { url: `${BASE_URL}/services/charter`, changeFrequency: "monthly" as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/services/yacht-management`, changeFrequency: "monthly" as const, priority: 0.85, lastModified: now },
    { url: `${BASE_URL}/services/cinematography`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/services/brandwave`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/destinations`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/destinations/dock-and-dine-dubai`, changeFrequency: "monthly" as const, priority: 0.75, lastModified: now },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.75, lastModified: now },
    { url: `${BASE_URL}/ai`, changeFrequency: "monthly" as const, priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly" as const, priority: 0.3, lastModified: FIXED_LEGAL_DATE },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly" as const, priority: 0.3, lastModified: FIXED_LEGAL_DATE },
  ];

  const yachtSlugs = await fetchYachtSlugsAndDates();
  const yachtPages = yachtSlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/fleet/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    lastModified: updatedAt ?? now,
  }));

  const destinationSlugs = await fetchDestinationSlugsAndDates();
  const destinationPages = destinationSlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/destinations/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: updatedAt ?? now,
  }));

  return [...staticPages, ...yachtPages, ...destinationPages];
}
