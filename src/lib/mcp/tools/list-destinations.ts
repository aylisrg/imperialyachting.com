import { z } from "zod";
import { fetchAllDestinations } from "@/lib/destinations-db";
import { SITE_CONFIG } from "@/lib/constants";
import { sanitizeText, sanitizeStringArray } from "../sanitize";
import type { Destination, DestinationCategory } from "@/types/common";
import type { ToolAnnotations, ToolMeta } from "./types";

export const listDestinationsInputSchema = z.object({
  category: z
    .enum(["destination", "experience", "activity"])
    .optional()
    .describe("Only return items of this category."),
});
export type ListDestinationsInput = z.infer<typeof listDestinationsInputSchema>;

const destinationCardSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.enum(["destination", "experience", "activity"]),
  shortDescription: z.string(),
  sailingTime: z.string(),
  duration: z.string(),
  priceFrom: z.number().nullable(),
  bestFor: z.array(z.string()),
  highlights: z.array(z.string()),
  url: z.string(),
});
export type DestinationCard = z.infer<typeof destinationCardSchema>;

export const listDestinationsOutputSchema = z.object({
  destinations: z.array(destinationCardSchema),
});
export type ListDestinationsOutput = z.infer<typeof listDestinationsOutputSchema>;

export const listDestinationsAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

export const listDestinationsMeta: ToolMeta = {
  name: "list_destinations",
  title: "List Destinations",
  description:
    "List the cruising destinations, experiences, and activities Imperial Yachting offers from Dubai Harbour " +
    "(e.g. Palm Jumeirah, Dubai Marina skyline, Ain Dubai, World Islands). " +
    "Filter by `category`: 'destination' (a place to cruise to), 'experience' (a themed outing), or 'activity' (an on-water activity). " +
    "`priceFrom` is in AED. Use this to suggest an itinerary alongside a yacht from `list_yachts`.",
  annotations: listDestinationsAnnotations,
};

function mapDestinationCard(d: Destination): DestinationCard {
  return {
    slug: d.slug,
    name: sanitizeText(d.name, 200),
    category: (d.category as DestinationCategory) || "destination",
    shortDescription: sanitizeText(d.shortDescription, 500),
    sailingTime: sanitizeText(d.sailingTime, 100),
    duration: sanitizeText(d.duration, 100),
    priceFrom: d.priceFrom ?? null,
    bestFor: sanitizeStringArray(d.bestFor, 100, 20),
    highlights: sanitizeStringArray(d.highlights, 200, 20),
    url: `${SITE_CONFIG.url}/destinations/${d.slug}`,
  };
}

/**
 * Lists destinations/experiences/activities, optionally filtered by
 * category. Pure function — no MCP transport dependency.
 */
export async function listDestinations(
  input: ListDestinationsInput
): Promise<{ structured: ListDestinationsOutput; text: string }> {
  const destinations = await fetchAllDestinations();

  const filtered = input.category
    ? destinations.filter((d) => d.category === input.category)
    : destinations;

  const cards = filtered.map(mapDestinationCard);
  const structured: ListDestinationsOutput = { destinations: cards };

  const text = cards.length
    ? `Found ${cards.length} destination(s):\n` +
      cards.map((c) => `- ${c.name} (${c.category}): ${c.shortDescription} ${c.url}`).join("\n")
    : "No destinations matched the given filter.";

  return { structured, text };
}
