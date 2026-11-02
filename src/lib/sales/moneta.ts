import type { SaleMaterialRow } from "@/lib/supabase/types";
import { MONETA_BUILD_YEAR, MONETA_MODEL_YEAR, correctMonetaYearSpecs, correctMonetaYearText } from "@/lib/moneta-years";
import type { SaleListing, SaleSpecSection } from "@/types/sale";

export const MONETA_SLUG = "monte-carlo-6-moneta";
export const MONETA_BROCHURE = {
  id: "moneta-specification-and-videos-2026-11-v3",
  title: "Moneta specification & videos (PDF)",
  description: "34 pages: specifications, photographs and four linked video previews.",
  location: "monte-carlo-6-moneta/specification-and-videos.pdf",
  fileName: "MONETA-Monte-Carlo-6-Specification-and-Videos.pdf",
  sizeBytes: 17986582,
} as const;

/** Owner-approved brochure facts, published with the GitHub/VPS release.
 * Year facts are shared with the charter fleet; all other overrides remain sale-specific.
 */
export function applyMonetaSaleFacts(listing: SaleListing): SaleListing {
  if (listing.slug !== MONETA_SLUG) return listing;

  const correctedSpecs: Record<string, string> = {
    builder: "Beneteau",
    manufacturer: "Beneteau",
    model: "Monte Carlo 6",
    loa: "18.35 m / 60'2\"",
    length: "18.35 m / 60'2\"",
    "length overall": "18.35 m / 60'2\"",
    beam: "4.91 m",
    draft: "1.17 m",
  };
  const specs: SaleSpecSection[] = listing.specSections.map((section) => ({
    ...section,
    title: /launch/i.test(section.title) ? "Build & model year" : section.title,
    items: correctMonetaYearSpecs(section.items).map((item) => ({
      ...item,
      value: correctedSpecs[item.label.trim().toLowerCase()] ?? item.value,
    })),
  })).filter((section) => section.items.length > 0);
  const yearItems = [
    { label: "Year built", value: String(MONETA_BUILD_YEAR) },
    { label: "Model year", value: String(MONETA_MODEL_YEAR) },
  ].filter(({ label }) => !specs.some((section) => section.items.some((item) => item.label.trim().toLowerCase() === label.toLowerCase())));
  if (yearItems.length) specs.push({ title: "Build & model year", items: yearItems });

  const summary = "Beneteau Monte Carlo 6 MONETA for sale in Dubai. Built 2018, model year 2019. 18.35 m flybridge yacht with an updated specification and video brochure.";
  return {
    ...listing,
    builder: "Beneteau",
    model: "Monte Carlo 6",
    yearBuilt: MONETA_BUILD_YEAR,
    modelYear: MONETA_MODEL_YEAR,
    lengthM: 18.35,
    lengthFt: 60,
    beamM: 4.91,
    draftM: 1.17,
    headline: "Beneteau Monte Carlo 6 · Built 2018 · Model year 2019",
    summary,
    description: "MONETA is a Beneteau Monte Carlo 6 flybridge yacht, built in 2018, model year 2019. She measures 18.35 m overall, with a 4.91 m beam and a 1.17 m draft.\n\nThe updated 34-page brochure contains the technical specification, photographs and four linked video previews.",
    highlights: listing.highlights.map(correctMonetaYearText),
    features: listing.features.map(correctMonetaYearText),
    faq: listing.faq.map((item) => ({
      question: correctMonetaYearText(item.question),
      answer: /launch/i.test(item.question)
        ? "The launch date has not been confirmed."
        : /(?:year.*(?:built|construction)|when.*built)/i.test(item.question)
          ? "MONETA was built in 2018; her model year is 2019."
          : correctMonetaYearText(item.answer),
    })),
    specSections: specs,
    seoTitle: "Beneteau Monte Carlo 6 MONETA for Sale in Dubai — Built 2018, Model Year 2019",
    seoDescription: summary,
    keywords: listing.keywords.map((keyword) => correctMonetaYearText(keyword.replace(/Monte Carlo Yachts/gi, "Beneteau"))),
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
