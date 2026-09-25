import { z } from "zod";
import { fetchSaleListings } from "@/lib/sales/listings-db";
import { formatSalePrice, SALE_STATUS_LABEL } from "@/lib/sales/merge";
import { SITE_CONFIG } from "@/lib/constants";
import { sanitizeText, sanitizeStringArray } from "../sanitize";
import type { ToolAnnotations, ToolMeta } from "./types";

export const listYachtsForSaleInputSchema = z.object({});

const saleSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  status: z.string(),
  builder: z.string(),
  model: z.string(),
  yearBuilt: z.number().nullable(),
  refitYear: z.number().nullable(),
  lengthM: z.number().nullable(),
  guests: z.number().nullable(),
  cabins: z.number().nullable(),
  lying: z.string(),
  price: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  image: z.string().nullable(),
  url: z.string(),
});

export const listYachtsForSaleOutputSchema = z.object({
  listings: z.array(saleSummarySchema),
  overviewUrl: z.string(),
});
export type ListYachtsForSaleOutput = z.infer<typeof listYachtsForSaleOutputSchema>;

const annotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

export const listYachtsForSaleMeta: ToolMeta = {
  name: "list_yachts_for_sale",
  title: "List Yachts for Sale",
  description:
    "Yachts Imperial Yachting is selling in Dubai (owner-direct, lying Dubai Harbour): model, year, size, status, asking price " +
    "and the listing URL, where the spec sheet and photo pack can be downloaded. Brokers welcome. Not for charter — use list_yachts for that.",
  annotations,
};

export async function listYachtsForSale(): Promise<{
  structured: ListYachtsForSaleOutput;
  text: string;
}> {
  const listings = await fetchSaleListings();
  const structured: ListYachtsForSaleOutput = {
    overviewUrl: `${SITE_CONFIG.url}/yachts-for-sale`,
    listings: listings.map((l) => ({
      slug: l.slug,
      title: sanitizeText(l.title, 200),
      status: SALE_STATUS_LABEL[l.status],
      builder: sanitizeText(l.builder, 200),
      model: sanitizeText(l.model, 200),
      yearBuilt: l.yearBuilt,
      refitYear: l.refitYear,
      lengthM: l.lengthM,
      guests: l.guests,
      cabins: l.cabins,
      lying: sanitizeText(l.lying, 200),
      price: formatSalePrice(l.price),
      summary: sanitizeText(l.summary, 500),
      highlights: sanitizeStringArray(l.highlights, 200, 12),
      image: l.heroImage || null,
      url: `${SITE_CONFIG.url}/yachts-for-sale/${l.slug}`,
    })),
  };

  const text =
    structured.listings.length === 0
      ? "No yachts are listed for sale right now."
      : structured.listings
          .map((l) => `${l.title} — ${l.status}, ${l.price}. ${l.summary} ${l.url}`)
          .join("\n");

  return { structured, text };
}
