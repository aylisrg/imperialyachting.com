import { z } from "zod";
import { createQuote as createQuoteDomain } from "@/lib/booking/quotes";
import { sanitizeText } from "../sanitize";
import type { ToolAnnotations, ToolMeta } from "./types";

export const createQuoteInputSchema = z.object({
  yachtSlug: z
    .string()
    .min(1)
    .describe("The yacht's URL slug, as returned by `list_yachts` (e.g. \"monte-carlo-6\")."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format")
    .describe("Charter date, Dubai local calendar day, as \"YYYY-MM-DD\"."),
  startHour: z
    .number()
    .int()
    .min(8)
    .max(21)
    .describe("Charter start hour, Dubai local time, 24h clock (8-21, e.g. 14 for 2 PM)."),
  hours: z
    .number()
    .int()
    .min(1)
    .max(12)
    .describe("Paid charter duration in hours (1-12). Must meet the yacht's minimum hours for the date — call `check_availability` first if unsure."),
  guests: z
    .number()
    .int()
    .min(1)
    .describe("Number of guests. Must not exceed the yacht's capacity."),
  extras: z
    .array(
      z.object({
        slug: z.string().min(1).describe("Extra's slug, from `list_extras`."),
        qty: z.number().int().min(1).describe("Quantity of this extra."),
      })
    )
    .optional()
    .describe("Optional add-ons (catering, decorations, etc.) from `list_extras`."),
});
export type CreateQuoteInput = z.infer<typeof createQuoteInputSchema>;

const extraLineSchema = z.object({
  slug: z.string(),
  name: z.string(),
  qty: z.number(),
  unitPrice: z.number(),
  unit: z.string(),
  amount: z.number(),
});

const conflictSchema = z.object({
  source: z.enum(["booking", "calendar"]),
  start: z.string(),
  end: z.string(),
});

export const createQuoteOutputSchema = z.object({
  ok: z.boolean(),
  quoteId: z.string().optional(),
  yacht: z.object({ slug: z.string(), name: z.string() }).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  currency: z.string().optional(),
  hours: z.number().optional(),
  bonusHours: z.number().optional(),
  totalHours: z.number().optional(),
  hourlyRate: z.number().optional(),
  baseAmount: z.number().optional(),
  extras: z.array(extraLineSchema).optional(),
  extrasAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  depositAmount: z.number().optional(),
  balanceAmount: z.number().optional(),
  season: z.string().nullable().optional(),
  isWeekend: z.boolean().optional(),
  minHours: z.number().optional(),
  availability: z
    .object({ available: z.boolean(), calendarChecked: z.boolean() })
    .optional(),
  summary: z.string().optional(),
  nextStep: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
  errors: z.array(z.object({ code: z.string(), message: z.string() })).optional(),
  conflicts: z.array(conflictSchema).optional(),
});
export type CreateQuoteOutput = z.infer<typeof createQuoteOutputSchema>;

export const createQuoteAnnotations: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
};

export const createQuoteMeta: ToolMeta = {
  name: "create_quote",
  title: "Create Charter Quote",
  description:
    "Create a priced, time-limited charter quote and hold a `quote` row for it (valid 30 minutes). " +
    "Input: `yachtSlug`, `date` (\"YYYY-MM-DD\" Dubai local), `startHour` (8-21 Dubai local), `hours` (1-12), " +
    "`guests`, and optional `extras` (from `list_extras`). " +
    "Re-checks the yacht's minimum hours, capacity, pricing season, and live availability before returning a quote — " +
    "never invent a price or assume a slot is free. " +
    "On success returns the full price breakdown (base amount, bonus hours, extras, total, 50% deposit, balance) " +
    "and a `nextStep` telling you to confirm details with the customer and call `create_checkout` with the `quoteId` " +
    "within 30 minutes (`expiresAt`). " +
    "On failure returns `isError` with a `code` (e.g. \"min_hours\", \"capacity\", \"unavailable\", \"unknown_extra\", " +
    "\"yacht_not_found\") and a `message` explaining what to change — e.g. call `check_availability` for an open slot, " +
    "or ask the customer to adjust guests/hours.",
  annotations: createQuoteAnnotations,
};

/**
 * Builds a charter quote via the domain `createQuote()`, mapping its
 * discriminated-union result onto the tool's flat output schema. Pure
 * function — no MCP transport dependency.
 */
export async function createQuote(
  input: CreateQuoteInput
): Promise<{ structured: CreateQuoteOutput; text: string; isError?: boolean }> {
  const result = await createQuoteDomain({
    yachtSlug: input.yachtSlug,
    date: input.date,
    startHour: input.startHour,
    hours: input.hours,
    guests: input.guests,
    extras: input.extras,
    source: "mcp",
  });

  if (!result.ok) {
    const structured: CreateQuoteOutput = {
      ok: false,
      code: result.code,
      message: result.message,
      ...(result.errors ? { errors: result.errors } : {}),
      ...(result.conflicts
        ? {
            conflicts: result.conflicts.map((c) => ({
              source: c.source,
              start: c.start.toISOString(),
              end: c.end.toISOString(),
            })),
          }
        : {}),
    };
    return { structured, text: result.message, isError: true };
  }

  const { quote } = result;
  const structured: CreateQuoteOutput = {
    ok: true,
    quoteId: result.quoteId,
    yacht: { slug: result.yacht.slug, name: sanitizeText(result.yacht.name, 200) },
    startsAt: result.startsAt,
    endsAt: result.endsAt,
    expiresAt: result.expiresAt,
    currency: quote.currency,
    hours: quote.hours,
    bonusHours: quote.bonusHours,
    totalHours: quote.totalHours,
    hourlyRate: quote.hourlyRate,
    baseAmount: quote.baseAmount,
    extras: quote.extras,
    extrasAmount: quote.extrasAmount,
    totalAmount: quote.totalAmount,
    depositAmount: quote.depositAmount,
    balanceAmount: quote.balanceAmount,
    season: quote.season,
    isWeekend: quote.isWeekend,
    minHours: quote.minHours,
    availability: {
      available: result.availability.available,
      calendarChecked: result.availability.calendarChecked,
    },
    summary: result.summary,
    nextStep:
      "Confirm the details with the customer, collect name, email and phone, then call create_checkout with this quoteId within 30 minutes.",
  };

  return { structured, text: result.summary };
}
