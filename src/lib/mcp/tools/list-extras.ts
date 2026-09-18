import { z } from "zod";
import { fetchActiveExtras } from "@/lib/booking/extras-db";
import { sanitizeText } from "../sanitize";
import type { Extra } from "@/types/booking";
import type { ToolAnnotations, ToolMeta } from "./types";

/** No filters today — kept as an empty object schema so the tool is easy to extend later. */
export const listExtrasInputSchema = z.object({});
export type ListExtrasInput = z.infer<typeof listExtrasInputSchema>;

const extraCardSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  unit: z.string(),
  category: z.string(),
});
export type ExtraCard = z.infer<typeof extraCardSchema>;

export const listExtrasOutputSchema = z.object({
  extras: z.array(extraCardSchema),
  note: z.string().optional(),
});
export type ListExtrasOutput = z.infer<typeof listExtrasOutputSchema>;

export const listExtrasAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

export const listExtrasMeta: ToolMeta = {
  name: "list_extras",
  title: "List Charter Extras",
  description:
    "List optional add-on services for a charter (catering, decorations, photography, water sports equipment, etc.), " +
    "with their prices in AED and billing unit (per booking, per hour, or per guest). " +
    "Use this alongside `get_yacht` to build a complete quote before calling `create_quote`.",
  annotations: listExtrasAnnotations,
};

function mapExtraCard(extra: Extra): ExtraCard {
  return {
    slug: extra.slug,
    name: sanitizeText(extra.name, 200),
    description: sanitizeText(extra.description, 1000),
    price: extra.price,
    unit: extra.unit,
    category: sanitizeText(extra.category, 100),
  };
}

/**
 * Lists active charter extras. Pure function — no MCP transport dependency.
 * `fetchActiveExtras` throws on persistent DB failure; that's caught here
 * so the tool degrades to an empty list with an explanatory note rather
 * than failing the whole `tools/call`.
 */
export async function listExtras(): Promise<{
  structured: ListExtrasOutput;
  text: string;
}> {
  try {
    const extras = await fetchActiveExtras();
    const cards = extras.map(mapExtraCard);
    const structured: ListExtrasOutput = { extras: cards };

    const text = cards.length
      ? `Found ${cards.length} extra(s):\n` +
        cards.map((c) => `- ${c.name}: AED ${c.price} (${c.unit})`).join("\n")
      : "No charter extras are currently available.";

    return { structured, text };
  } catch (error) {
    const note = "Extras are temporarily unavailable — proceed with the base charter price and mention that add-ons can be arranged separately.";
    return {
      structured: { extras: [], note },
      text: `${note} (${error instanceof Error ? error.message : "unknown error"})`,
    };
  }
}
