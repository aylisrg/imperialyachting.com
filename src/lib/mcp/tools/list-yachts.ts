import { z } from "zod";
import { fetchAllYachts } from "@/lib/yachts-db";
import { getHourlyRate, getLowestPrice } from "@/lib/pricing";
import { SITE_CONFIG } from "@/lib/constants";
import { sanitizeText } from "../sanitize";
import type { Yacht } from "@/types/yacht";
import type { ToolAnnotations, ToolMeta } from "./types";

export const listYachtsInputSchema = z.object({
  guests: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Minimum number of guests the yacht must accommodate."),
  maxHourlyRate: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Maximum acceptable hourly rate, in AED."),
  featuredOnly: z
    .boolean()
    .optional()
    .describe("Only return featured/flagship yachts."),
});
export type ListYachtsInput = z.infer<typeof listYachtsInputSchema>;

const yachtCardSchema = z.object({
  slug: z.string(),
  name: z.string(),
  builder: z.string(),
  year: z.number(),
  lengthFt: z.number(),
  lengthM: z.number(),
  capacity: z.number(),
  cabins: z.number().nullable(),
  fromPrice: z
    .object({ amount: z.number(), unit: z.string() })
    .nullable(),
  hourlyRate: z.number().nullable(),
  heroImage: z.string(),
  url: z.string(),
  location: z.string(),
  tagline: z.string(),
  bookingEnabled: z.boolean(),
  minHoursWeekday: z.number(),
  minHoursWeekend: z.number(),
});
export type YachtCard = z.infer<typeof yachtCardSchema>;

export const listYachtsOutputSchema = z.object({
  yachts: z.array(yachtCardSchema),
});
export type ListYachtsOutput = z.infer<typeof listYachtsOutputSchema>;

export const listYachtsAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

export const listYachtsMeta: ToolMeta = {
  name: "list_yachts",
  title: "List Yachts",
  description:
    "List Imperial Yachting's owned fleet of motor yachts available for charter from Dubai Harbour, Dubai. " +
    "Prices are in AED per hour and include a professional crew, fuel for standard cruising routes, and soft drinks. " +
    "Use `guests` to filter by party size and `maxHourlyRate` to filter by budget. " +
    "Weekend minimum-hours apply on Friday and Saturday in the UAE. " +
    "Call `get_yacht` with the returned slug for the full pricing table, specs, and included amenities before quoting a client.",
  annotations: listYachtsAnnotations,
};

function absoluteUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_CONFIG.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

function mapYachtCard(yacht: Yacht): YachtCard {
  return {
    slug: yacht.slug,
    name: sanitizeText(yacht.name, 200),
    builder: sanitizeText(yacht.builder, 200),
    year: yacht.year,
    lengthFt: yacht.length.feet,
    lengthM: yacht.length.meters,
    capacity: yacht.capacity,
    cabins: yacht.cabins ?? null,
    fromPrice: getLowestPrice(yacht.pricing),
    hourlyRate: getHourlyRate(yacht.pricing),
    heroImage: absoluteUrl(yacht.heroImage),
    url: `${SITE_CONFIG.url}/fleet/${yacht.slug}`,
    location: sanitizeText(yacht.location, 200),
    tagline: sanitizeText(yacht.tagline, 300),
    bookingEnabled: yacht.bookingEnabled ?? false,
    minHoursWeekday: yacht.minHoursWeekday ?? 2,
    minHoursWeekend: yacht.minHoursWeekend ?? 4,
  };
}

/**
 * Lists the fleet, optionally filtered by guest capacity, hourly budget,
 * and/or featured status. Pure function — no MCP transport dependency, so
 * it is directly unit-testable.
 */
export async function listYachts(
  input: ListYachtsInput
): Promise<{ structured: ListYachtsOutput; text: string }> {
  const yachts = await fetchAllYachts();

  const filtered = yachts.filter((yacht) => {
    if (input.featuredOnly && !yacht.featured) return false;
    if (input.guests != null && yacht.capacity < input.guests) return false;
    if (input.maxHourlyRate != null) {
      const hourly = getHourlyRate(yacht.pricing);
      if (hourly == null || hourly > input.maxHourlyRate) return false;
    }
    return true;
  });

  const cards = filtered.map(mapYachtCard);
  const structured: ListYachtsOutput = { yachts: cards };

  const text = cards.length
    ? `Found ${cards.length} yacht(s) matching your criteria:\n` +
      cards
        .map(
          (c) =>
            `- ${c.name} (${c.slug}): up to ${c.capacity} guests, ${
              c.hourlyRate != null ? `from AED ${c.hourlyRate}/hr` : "price on request"
            }. ${c.url}`
        )
        .join("\n")
    : "No yachts matched the given filters.";

  return { structured, text };
}
