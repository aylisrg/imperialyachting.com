import { z } from "zod";
import { SITE_CONFIG } from "@/lib/constants";
import { termsSections } from "@/data/terms";
import { sanitizeText } from "../sanitize";
import type { ToolAnnotations, ToolMeta } from "./types";

/** No inputs today — kept as an empty object schema for a stable tool signature. */
export const getBookingTermsInputSchema = z.object({});
export type GetBookingTermsInput = z.infer<typeof getBookingTermsInputSchema>;

export const getBookingTermsOutputSchema = z.object({
  currency: z.literal("AED"),
  depositRate: z.number(),
  balanceDueHoursBefore: z.number(),
  minHours: z.object({ weekday: z.number(), weekend: z.number() }),
  bonusHours: z.string(),
  operatingHours: z.string(),
  departure: z.string(),
  cancellation: z.array(z.string()),
  contact: z.object({
    whatsapp: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
});
export type GetBookingTermsOutput = z.infer<typeof getBookingTermsOutputSchema>;

export const getBookingTermsAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

export const getBookingTermsMeta: ToolMeta = {
  name: "get_booking_terms",
  title: "Get Booking Terms",
  description:
    "Get Imperial Yachting's core commercial terms for charters: currency, deposit rate, balance due date, " +
    "minimum charter hours (weekday vs. weekend), the loyalty bonus-hours rule, operating hours, departure point, " +
    "and a summary of the cancellation policy. Use this before presenting a quote or a deposit checkout link.",
  annotations: getBookingTermsAnnotations,
};

const CANCELLATION_SECTION_TITLE = "2. Booking & Cancellation";

function findCancellationRules(): string[] {
  const section = termsSections.find((s) => s.title === CANCELLATION_SECTION_TITLE);
  if (!section) return [];
  return section.content.map((line) => sanitizeText(line, 1000));
}

/**
 * Returns Imperial Yachting's booking/commercial terms. Pure function —
 * no MCP transport dependency. Values not yet backed by a config table
 * (deposit rate, minimum hours, operating hours) are the documented
 * business defaults; update here if the policy changes.
 */
export async function getBookingTerms(): Promise<{
  structured: GetBookingTermsOutput;
  text: string;
}> {
  const structured: GetBookingTermsOutput = {
    currency: "AED",
    depositRate: 0.5,
    balanceDueHoursBefore: 48,
    minHours: { weekday: 2, weekend: 4 },
    bonusHours: "4 paid hours = 1 free bonus hour",
    operatingHours: "08:00-22:00 Asia/Dubai",
    departure: SITE_CONFIG.harbour.name,
    cancellation: findCancellationRules(),
    contact: {
      whatsapp: SITE_CONFIG.whatsapp,
      email: SITE_CONFIG.email,
      phone: SITE_CONFIG.phone,
    },
  };

  const text =
    `Currency: AED. Deposit: ${structured.depositRate * 100}% at booking, balance due ${structured.balanceDueHoursBefore}h before departure. ` +
    `Minimum hours: ${structured.minHours.weekday}h weekday / ${structured.minHours.weekend}h weekend (Fri-Sat). ` +
    `Bonus: ${structured.bonusHours}. Departs from ${structured.departure}, operating hours ${structured.operatingHours}. ` +
    `Contact: ${structured.contact.phone} / ${structured.contact.email}.`;

  return { structured, text };
}
