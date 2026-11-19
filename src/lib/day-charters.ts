import { SITE_CONFIG } from "./constants";
import { CHARTER_BONUS_ACTIVE, getCharterBaseAmount, getCharterBonusHours } from "./booking/constants";

/** Standard B2C package totals, already including VAT. */
export const fullDayCharters = [
  { slug: "vd-40", name: "VanDutch 40", detail: "40 ft · Day cruiser", price: 7500, image: "/media/home/posters/vd40-aerial.jpg" },
  { slug: "maybach", name: "Maybach", detail: "46 ft · Silver Arrows Marine", price: 11500, image: "/media/charter/maybach.webp" },
  { slug: "monte-carlo-6", name: "Moneta", detail: "60 ft · Monte Carlo 6", price: 15000, image: "/media/home/posters/moneta-golden.jpg" },
] as const;
export type FullDayCharter = (typeof fullDayCharters)[number];

export function getFullDayCharter(slug: string): FullDayCharter | undefined {
  return fullDayCharters.find((entry) => entry.slug === (slug === "van-dutch-40" ? "vd-40" : slug));
}

export const FULL_DAY_HOURS = 8;

/** The booking engine treats hourly rates as the total customer charge, with no VAT added. */
export function fullDayOffer(basePrice: number, hourlyRate: number | null, active = CHARTER_BONUS_ACTIVE) {
  if (!active || hourlyRate === null || hourlyRate <= 0 || !Number.isFinite(hourlyRate)) {
    return { amount: basePrice, standardAmount: basePrice, promotional: false };
  }
  const paidHours = Array.from({ length: FULL_DAY_HOURS }, (_, i) => i + 1).find(
    (paid) => paid + getCharterBonusHours(paid, active) === FULL_DAY_HOURS,
  );
  const promoPrice = paidHours == null ? Infinity : getCharterBaseAmount(hourlyRate, paidHours);
  return promoPrice < basePrice
    ? { amount: promoPrice, standardAmount: basePrice, promotional: true }
    : { amount: basePrice, standardAmount: basePrice, promotional: false };
}

export function charterInquiry(format: string) {
  const url = new URL(SITE_CONFIG.whatsapp);
  url.searchParams.set("text", `Hello Imperial Yachting! Could you check availability for ${format}?`);
  return url.href;
}

export const standardDayIncludes = "Captain, crew, drinking water and fuel for the agreed standard Dubai Harbour route.";
