import { SITE_CONFIG } from "./constants";
import type { Yacht } from "@/types/yacht";

/** Fixed public B2C amounts in AED, VAT included. Not an hourly promotion. */
export const fullDayCharters = [
  { slug: "vd-40", name: "VanDutch 40", detail: "40 ft · Day cruiser", price: 7000, fourOutings: 26600, hours: 8, image: "/media/home/posters/vd40-aerial.jpg" },
  { slug: "evo4", name: "EVO 43", detail: "43 ft · Day cruiser", price: 15000, fourOutings: 57000, hours: null, image: "/media/home/posters/evo43-run.jpg" },
  { slug: "maybach", name: "Maybach", detail: "46 ft · Silver Arrows Marine", price: 10500, fourOutings: 39900, hours: 8, image: "/media/charter/maybach.webp" },
  { slug: "monte-carlo-6", name: "Moneta", detail: "60 ft · Monte Carlo 6", price: 14000, fourOutings: 53200, hours: 8, image: "/media/home/posters/moneta-golden.jpg" },
] as const;
export type FullDayCharter = (typeof fullDayCharters)[number];

export function getFullDayCharter(slug: string): FullDayCharter | undefined {
  const canonical = slug === "van-dutch-40" ? "vd-40" : slug === "evo-43" ? "evo4" : slug;
  return fullDayCharters.find((entry) => entry.slug === canonical);
}

/** Public display/SEO rates only. Leave the Supabase pricing engine untouched. */
export function publicCharterPricing(yacht: Pick<Yacht, "slug" | "pricing">): Yacht["pricing"] {
  const charter = getFullDayCharter(yacht.slug);
  const rows = yacht.pricing.filter((row) => !charter || row.hourly != null).map((row) => ({
    season: row.season, period: row.period, validFrom: row.validFrom, validTo: row.validTo,
    isWeekend: row.isWeekend, hourly: row.hourly,
    daily: charter ? null : row.daily, weekly: charter ? null : row.weekly, monthly: charter ? null : row.monthly,
  }));
  return charter ? [...rows, {
    season: "Regular day package", period: "Non-holiday dates", hourly: null, daily: charter.price, weekly: null, monthly: null,
  }] : rows;
}

/** Generic Product JSON-LD implies in-stock bookability; exclude inquiry-only packages. */
export function structuredCharterPricing(yacht: Pick<Yacht, "slug" | "pricing">) {
  const pricing = publicCharterPricing(yacht);
  return getFullDayCharter(yacht.slug) ? pricing.filter((row) => row.hourly != null) : pricing;
}

export function charterInquiry(format: string) {
  const url = new URL(SITE_CONFIG.whatsapp);
  url.searchParams.set("text", `Hello Imperial Yachting! Could you check availability for ${format}?`);
  return url.href;
}

export const standardDayIncludes = "Captain, crew, drinking water and fuel for the agreed standard Dubai Harbour route.";
export const outingTerms = "Four agreed outings within 30 days, subject to availability. Non-exclusive; holidays excluded. Hourly promotions do not apply.";
