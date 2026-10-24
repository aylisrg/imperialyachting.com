import type { SaleMaterialRow } from "@/lib/supabase/types";
import type { SaleListing, SaleSpecSection } from "@/types/sale";

export const MONETA_SLUG = "monte-carlo-6-moneta";
export const MONETA_BROCHURE = {
  id: "moneta-specification-and-videos-2026-10",
  title: "Moneta specification & videos (PDF)",
  description: "63 pages: specifications, photographs and four linked video previews.",
  location: "monte-carlo-6-moneta/specification-and-videos.pdf",
  fileName: "MONETA-Monte-Carlo-6-Specification-and-Videos.pdf",
  sizeBytes: 13388979,
} as const;

/** Owner-approved brochure facts, published with the GitHub/VPS release.
 * Keep this sale-specific: changing the linked charter yacht is a separate task.
 */
export function applyMonetaSaleFacts(listing: SaleListing): SaleListing {
  if (listing.slug !== MONETA_SLUG) return listing;

  const correctedSpecs: Record<string, string> = {
    builder: "Beneteau",
    manufacturer: "Beneteau",
    model: "Monte Carlo 6",
    year: "2019",
    "year built": "2019",
    built: "2019",
    launched: "2020",
    "launch year": "2020",
    loa: "18.35 m / 60'2\"",
    length: "18.35 m / 60'2\"",
    "length overall": "18.35 m / 60'2\"",
    beam: "4.91 m",
    draft: "1.17 m",
  };
  const specs: SaleSpecSection[] = listing.specSections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      value: item.label.replace(/\s/g, "").toLowerCase() === "year/refit"
        ? item.value.replace(/^\s*\d{4}/, "2019")
        : correctedSpecs[item.label.trim().toLowerCase()] ?? item.value,
    })),
  }));
  if (!specs.some((s) => s.items.some((i) => /^(launched|launch year)$/i.test(i.label.trim())))) {
    specs.push({ title: "Build & launch", items: [
      { label: "Year built", value: "2019" },
      { label: "Launched", value: "2020" },
    ] });
  }

  const summary = "Beneteau Monte Carlo 6 MONETA for sale in Dubai. Built 2019, launched 2020. 18.35 m flybridge yacht with an updated specification and video brochure.";
  return {
    ...listing,
    builder: "Beneteau",
    model: "Monte Carlo 6",
    yearBuilt: 2019,
    lengthM: 18.35,
    lengthFt: 60,
    beamM: 4.91,
    draftM: 1.17,
    headline: "Beneteau Monte Carlo 6 · Built 2019 · Launched 2020",
    summary,
    description: "MONETA is a Beneteau Monte Carlo 6 flybridge yacht, built in 2019 and launched in 2020. She measures 18.35 m overall, with a 4.91 m beam and a 1.17 m draft.\n\nThe updated 63-page brochure contains the technical specification, photographs and four linked video previews.",
    specSections: specs,
    seoTitle: "Beneteau Monte Carlo 6 MONETA for Sale in Dubai — Built 2019, Launched 2020",
    seoDescription: summary,
    keywords: listing.keywords.map((keyword) => keyword.replace(/Monte Carlo Yachts/gi, "Beneteau")),
  };
}

/** Do not suppress other documents or anonymous/general manufacturer brochures.
 * A historical row is replaceable only when it explicitly identifies this yacht
 * and is categorized as a brochure, or already points at this exact bundle.
 */
export function isMonetaBrochure(row: SaleMaterialRow): boolean {
  if (row.source === "bundled" && row.location === MONETA_BROCHURE.location) return true;
  // Every upload has the listing slug as its directory; that prefix is NOT
  // evidence of document identity. Model-only brochures may be manufacturer's.
  const basename = row.location.split(/[\\/]/).pop()?.split(/[?#]/)[0] ?? "";
  return row.category === "brochure" && /\bmoneta\b/i.test(
    `${row.title} ${row.file_name} ${basename}`.replace(/[^a-z0-9]/gi, " ")
  );
}

/** Reuse an identifiable old brochure id so existing selections/logs keep their
 * meaning. Database records/files are retained for rollback, not deleted.
 */
export function withMonetaBrochure(listing: SaleListing, rows: SaleMaterialRow[]): SaleMaterialRow[] {
  if (listing.slug !== MONETA_SLUG) return rows;
  const previous = rows.find(isMonetaBrochure);
  const brochure: SaleMaterialRow = {
    id: previous?.id ?? MONETA_BROCHURE.id,
    listing_id: listing.id,
    title: MONETA_BROCHURE.title,
    description: MONETA_BROCHURE.description,
    category: "brochure",
    source: "bundled",
    location: MONETA_BROCHURE.location,
    file_name: MONETA_BROCHURE.fileName,
    mime_type: "application/pdf",
    size_bytes: MONETA_BROCHURE.sizeBytes,
    active: true,
    sort_order: previous?.sort_order ?? 0,
    created_at: previous?.created_at ?? "2026-10-24T00:00:00Z",
  };
  return [brochure, ...rows.filter((row) => !isMonetaBrochure(row))]
    .sort((a, b) => a.sort_order - b.sort_order);
}
