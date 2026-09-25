import type { FAQItem } from "@/types/common";
import type { Yacht } from "@/types/yacht";
import type { SaleListingRow, SaleMediaRow } from "@/lib/supabase/types";
import type { SaleListing, SaleSpecSection, SaleVideo } from "@/types/sale";

const M_TO_FT = 3.28084;

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Parses the `spec_sections` jsonb column, dropping malformed entries. */
export function parseSpecSections(raw: unknown): SaleSpecSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((section) => {
      const s = section as { title?: unknown; items?: unknown };
      const items = Array.isArray(s.items)
        ? s.items
            .map((item) => {
              const i = item as { label?: unknown; value?: unknown };
              return typeof i.label === "string" && typeof i.value === "string"
                ? { label: i.label, value: i.value }
                : null;
            })
            .filter((i): i is { label: string; value: string } => i !== null)
        : [];
      return typeof s.title === "string" && items.length > 0
        ? { title: s.title, items }
        : null;
    })
    .filter((s): s is SaleSpecSection => s !== null);
}

/** Parses the `faq` jsonb column, dropping malformed entries. */
export function parseFaq(raw: unknown): FAQItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is FAQItem =>
      typeof item?.question === "string" && typeof item?.answer === "string"
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

/** Display title: `Model "Name"`, or just the name when it already includes the model. */
export function saleTitle(model: string, name: string): string {
  if (!model || name.toLowerCase().includes(model.toLowerCase())) return name;
  return `${model} “${name}”`;
}

/**
 * Combines a sale listing row, its own media and (optionally) the charter-fleet
 * yacht it is linked to. Listing values always win; anything left empty is
 * taken from the fleet yacht, and fleet photos/videos are appended after the
 * listing's own media. Pure function — no I/O.
 */
export function mergeSaleListing(
  row: SaleListingRow,
  media: SaleMediaRow[],
  fleet: Yacht | null
): SaleListing {
  const lengthM = toNumber(row.length_m) ?? (fleet?.length.meters || null);
  const lengthFt = row.length_m != null
    ? Math.round(Number(row.length_m) * M_TO_FT)
    : fleet?.length.feet || null;

  const sortedMedia = [...media].sort((a, b) => a.sort_order - b.sort_order);
  const ownImages = sortedMedia.filter((m) => m.kind === "image").map((m) => m.url);
  const images = unique([
    ...(row.hero_image ? [row.hero_image] : []),
    ...ownImages,
    ...(fleet?.images ?? []),
  ]);

  const videos: SaleVideo[] = [
    ...sortedMedia
      .filter((m) => m.kind === "video" || m.kind === "youtube")
      .map((m) => ({
        kind: m.kind === "youtube" ? ("youtube" as const) : ("file" as const),
        url: m.url,
        caption: m.caption,
      })),
    ...[fleet?.youtubeVideo ?? "", ...(fleet?.youtubeShorts ?? [])]
      .filter((url) => nonEmpty(url))
      .map((url) => ({ kind: "youtube" as const, url, caption: "" })),
  ].filter((v, i, all) => all.findIndex((o) => o.url === v.url) === i);

  let specSections = parseSpecSections(row.spec_sections);
  if (specSections.length === 0 && fleet && fleet.specs.length > 0) {
    specSections = [{ title: "Specifications", items: fleet.specs }];
  }

  const model = nonEmpty(row.model) ?? fleet?.name ?? "";
  const builder = nonEmpty(row.builder) ?? fleet?.builder ?? "";
  const summary =
    nonEmpty(row.summary) ??
    nonEmpty(row.seo_description) ??
    `${saleTitle(model, row.name)} for sale in Dubai.`;

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    fleetSlug: row.fleet_yacht_slug,
    name: row.name,
    title: saleTitle(model, row.name),
    builder,
    model,
    yearBuilt: row.year_built ?? fleet?.year ?? null,
    refitYear: row.refit_year ?? fleet?.refit ?? null,
    lengthM,
    lengthFt,
    beamM: toNumber(row.beam_m) ?? fleet?.beam?.meters ?? null,
    draftM: toNumber(row.draft_m),
    guests: row.guests ?? fleet?.capacity ?? null,
    cabins: row.cabins ?? fleet?.cabins ?? null,
    engines: nonEmpty(row.engines) ?? "",
    topSpeedKn: toNumber(row.top_speed_kn),
    lying: nonEmpty(row.lying) ?? fleet?.location ?? "Dubai, UAE",
    flag: nonEmpty(row.flag) ?? "",
    price: { amount: toNumber(row.price_amount), currency: row.price_currency || "AED" },
    headline: nonEmpty(row.headline) ?? "",
    summary,
    description: nonEmpty(row.description) ?? fleet?.description ?? "",
    highlights: row.highlights ?? [],
    features:
      row.features && row.features.length > 0
        ? row.features
        : (fleet?.amenities ?? []).map((a) => a.label),
    specSections,
    faq: parseFaq(row.faq),
    seoTitle: nonEmpty(row.seo_title) ?? `${saleTitle(model, row.name)} for Sale in Dubai`,
    seoDescription: nonEmpty(row.seo_description) ?? summary,
    keywords: row.keywords ?? [],
    brokerTerms: nonEmpty(row.broker_terms) ?? "",
    heroImage: images[0] ?? "",
    images,
    videos,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

/** "Price on application" or a formatted amount. */
export function formatSalePrice(price: SaleListing["price"]): string {
  if (price.amount === null) return "Price on application";
  return `${price.currency} ${price.amount.toLocaleString("en-US")}`;
}

export const SALE_STATUS_LABEL: Record<SaleListing["status"], string> = {
  draft: "Draft",
  published: "Available",
  under_offer: "Under offer",
  sold: "Sold",
};
