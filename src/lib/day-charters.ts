import { SITE_CONFIG } from "./constants";

/** Proposed B2C rates. Public cards show the gross approved quote, not a database hourly rate. */
export const fullDayCharters = [
  { slug: "vd-40", name: "VanDutch 40", detail: "40 ft · Day cruiser", price: 7500, image: "/media/home/posters/vd40-aerial.jpg" },
  { slug: "maybach", name: "Maybach", detail: "46 ft · Silver Arrows Marine", price: 11500, image: "/media/charter/maybach.webp" },
  { slug: "monte-carlo-6", name: "Moneta", detail: "60 ft · Monte Carlo 6", price: 15000, image: "/media/home/posters/moneta-golden.jpg" },
] as const;
export type FullDayCharter = (typeof fullDayCharters)[number];

export function getFullDayCharter(slug: string): FullDayCharter | undefined {
  return fullDayCharters.find((entry) => entry.slug === (slug === "van-dutch-40" ? "vd-40" : slug));
}

export function charterInquiry(format: string) {
  const url = new URL(SITE_CONFIG.whatsapp);
  url.searchParams.set("text", `Hello Imperial Yachting! Could you check availability for ${format}?`);
  return url.href;
}

export const standardDayIncludes = "Captain, crew, drinking water and fuel for the agreed standard Dubai Harbour route.";
