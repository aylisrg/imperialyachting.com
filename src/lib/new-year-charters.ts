import { charterInquiry } from "./day-charters";

export const newYearsEvePath = "/services/charter/new-years-eve";
export const newYearsEveDate = "31 December 2026 – 1 January 2027";
const NEW_YEAR_DUBAI = Date.parse("2027-01-01T00:00:00+04:00");

/** Public B2C totals for one five-hour private slot, VAT included. */
export const newYearsEveOffers = [
  { name: "VanDutch 40", amount: 14900 },
  { name: "EVO 43", amount: 18900 },
  { name: "Maybach", amount: 19900 },
  { name: "Moneta", amount: 29900 },
] as const;

export function showNewYearsEveInquiry(now = new Date()) {
  return now.getTime() < NEW_YEAR_DUBAI;
}

export function newYearsEveInquiry(offer: (typeof newYearsEveOffers)[number]) {
  return charterInquiry(`the five-hour New Year's Eve private charter on ${offer.name}, ${newYearsEveDate}, at AED ${offer.amount.toLocaleString("en-US")} including VAT. Please confirm the sailing slot, berth, route and licensed capacity`);
}
