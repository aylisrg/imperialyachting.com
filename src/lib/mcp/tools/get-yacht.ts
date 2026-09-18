import { z } from "zod";
import { fetchAllYachts, fetchYachtBySlug } from "@/lib/yachts-db";
import { SITE_CONFIG } from "@/lib/constants";
import { sanitizeText, sanitizeStringArray } from "../sanitize";
import type { Yacht } from "@/types/yacht";
import type { ToolAnnotations, ToolMeta } from "./types";

export const getYachtInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .describe("The yacht's URL slug, as returned by `list_yachts` (e.g. \"monte-carlo-6\")."),
});
export type GetYachtInput = z.infer<typeof getYachtInputSchema>;

const MAX_IMAGES = 8;

const pricingRowSchema = z.object({
  season: z.string(),
  period: z.string(),
  validFrom: z.string().nullable(),
  validTo: z.string().nullable(),
  isWeekend: z.boolean(),
  hourly: z.number().nullable(),
  daily: z.number().nullable(),
  weekly: z.number().nullable(),
  monthly: z.number().nullable(),
});

const yachtDetailSchema = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  builder: z.string(),
  year: z.number(),
  lengthFt: z.number(),
  lengthM: z.number(),
  capacity: z.number(),
  cabins: z.number().nullable(),
  location: z.string(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
  amenities: z.array(z.object({ icon: z.string(), label: z.string() })),
  included: z.array(z.string()),
  pricing: z.array(pricingRowSchema),
  rules: z.object({ daily: z.string(), weekly: z.string() }),
  images: z.array(z.string()),
  youtubeVideo: z.string().nullable(),
  minHoursWeekday: z.number(),
  minHoursWeekend: z.number(),
  bookingEnabled: z.boolean(),
  url: z.string(),
});
export type YachtDetail = z.infer<typeof yachtDetailSchema>;

export const getYachtOutputSchema = z.object({
  found: z.boolean(),
  yacht: yachtDetailSchema.optional(),
  message: z.string().optional(),
  validSlugs: z.array(z.string()).optional(),
});
export type GetYachtOutput = z.infer<typeof getYachtOutputSchema>;

export const getYachtAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

export const getYachtMeta: ToolMeta = {
  name: "get_yacht",
  title: "Get Yacht Details",
  description:
    "Get the full detail card for a single Imperial Yachting vessel: description, specs, amenities, what's included, " +
    "the complete seasonal pricing table (hourly/daily/weekly/monthly, weekday vs. weekend), rules, and up to 8 images. " +
    "Use this before quoting a client — `list_yachts` only returns a summary. " +
    "If the slug is not found, the result lists valid slugs to retry with.",
  annotations: getYachtAnnotations,
};

function absoluteUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_CONFIG.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

function mapYachtDetail(yacht: Yacht): YachtDetail {
  return {
    slug: yacht.slug,
    name: sanitizeText(yacht.name, 200),
    tagline: sanitizeText(yacht.tagline, 300),
    description: sanitizeText(yacht.description, 2000),
    builder: sanitizeText(yacht.builder, 200),
    year: yacht.year,
    lengthFt: yacht.length.feet,
    lengthM: yacht.length.meters,
    capacity: yacht.capacity,
    cabins: yacht.cabins ?? null,
    location: sanitizeText(yacht.location, 200),
    specs: yacht.specs.map((s) => ({
      label: sanitizeText(s.label, 100),
      value: sanitizeText(s.value, 200),
    })),
    amenities: yacht.amenities.map((a) => ({
      icon: sanitizeText(a.icon, 50),
      label: sanitizeText(a.label, 150),
    })),
    included: sanitizeStringArray(yacht.included, 200, 50),
    pricing: yacht.pricing.map((p) => ({
      season: sanitizeText(p.season, 100),
      period: sanitizeText(p.period, 100),
      validFrom: p.validFrom ?? null,
      validTo: p.validTo ?? null,
      isWeekend: p.isWeekend ?? false,
      hourly: p.hourly,
      daily: p.daily,
      weekly: p.weekly,
      monthly: p.monthly,
    })),
    rules: {
      daily: sanitizeText(yacht.dailyRules, 1000),
      weekly: sanitizeText(yacht.weeklyRules, 1000),
    },
    images: yacht.images.filter(Boolean).slice(0, MAX_IMAGES).map(absoluteUrl),
    youtubeVideo: yacht.youtubeVideo ? yacht.youtubeVideo : null,
    minHoursWeekday: yacht.minHoursWeekday ?? 2,
    minHoursWeekend: yacht.minHoursWeekend ?? 4,
    bookingEnabled: yacht.bookingEnabled ?? false,
    url: `${SITE_CONFIG.url}/fleet/${yacht.slug}`,
  };
}

/**
 * Fetches the full detail card for one yacht. Pure function — no MCP
 * transport dependency, so it is directly unit-testable. When the slug
 * doesn't exist, `structured.found` is `false` and `validSlugs` lists the
 * available slugs; `server.ts` turns that into an `isError` tool result.
 */
export async function getYacht(
  input: GetYachtInput
): Promise<{ structured: GetYachtOutput; text: string }> {
  const yacht = await fetchYachtBySlug(input.slug);

  if (!yacht) {
    const all = await fetchAllYachts();
    const validSlugs = all.map((y) => y.slug);
    const message =
      validSlugs.length > 0
        ? `No yacht found with slug "${input.slug}". Valid slugs: ${validSlugs.join(", ")}.`
        : `No yacht found with slug "${input.slug}", and no yachts are currently available.`;

    return {
      structured: { found: false, message, validSlugs },
      text: message,
    };
  }

  const detail = mapYachtDetail(yacht);
  const text =
    `${detail.name} (${detail.builder}, ${detail.year}) — up to ${detail.capacity} guests, ${detail.lengthFt}ft. ` +
    `${detail.description} Departs from ${detail.location}. ${detail.url}`;

  return { structured: { found: true, yacht: detail }, text };
}
