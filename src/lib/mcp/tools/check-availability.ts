import { z } from "zod";
import { fetchAllYachts, fetchYachtBySlug } from "@/lib/yachts-db";
import { getYachtBookingInfo } from "@/lib/booking/bookings-db";
import { getAvailableSlots, dubaiLocalToUtc } from "@/lib/booking/availability";
import { getMinHours, isWeekendOrHoliday } from "@/lib/booking/pricing-engine";
import { OPERATING_HOURS, MAX_HOURS, DUBAI_TZ } from "@/lib/booking/constants";
import { sanitizeText } from "../sanitize";
import type { ToolAnnotations, ToolMeta } from "./types";

export const checkAvailabilityInputSchema = z.object({
  yachtSlug: z
    .string()
    .min(1)
    .describe("The yacht's URL slug, as returned by `list_yachts` (e.g. \"monte-carlo-6\")."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format")
    .describe("Charter date, Dubai local calendar day, as \"YYYY-MM-DD\" (e.g. \"2026-10-12\")."),
  hours: z
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe(
      "Requested charter length in hours (1-12). If omitted, defaults to the yacht's minimum " +
        "hours for that date (weekend/holiday minimum is higher than weekday). Only slots with " +
        "at least this many free hours are returned."
    ),
});
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilityInputSchema>;

const slotSchema = z.object({
  start: z.string(),
  end: z.string(),
  startsAtIso: z.string(),
  endsAtIso: z.string(),
  hours: z.number(),
});
export type AvailabilitySlot = z.infer<typeof slotSchema>;

export const checkAvailabilityOutputSchema = z.object({
  yachtSlug: z.string(),
  yachtName: z.string(),
  date: z.string(),
  isWeekendOrHoliday: z.boolean(),
  minHours: z.number(),
  requestedHours: z.number().optional(),
  operatingHours: z.string(),
  slots: z.array(slotSchema),
  calendarChecked: z.boolean(),
  note: z.string().optional(),
  validSlugs: z.array(z.string()).optional(),
});
export type CheckAvailabilityOutput = z.infer<typeof checkAvailabilityOutputSchema>;

export const checkAvailabilityAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
};

export const checkAvailabilityMeta: ToolMeta = {
  name: "check_availability",
  title: "Check Yacht Availability",
  description:
    "Check which charter time slots are free for a yacht on a given Dubai-local date, by combining existing " +
    "bookings with the yacht's live Google Calendar (when configured). " +
    "Input: `yachtSlug` (from `list_yachts`), `date` (\"YYYY-MM-DD\", Dubai local), and an optional `hours` " +
    "(1-12; defaults to the yacht's minimum hours for that date — 4 on Fri/Sat/public holidays, 2 otherwise, " +
    "unless the yacht overrides it) — only slots with at least `hours` of free time are returned. " +
    "Operating hours are 08:00-22:00 Asia/Dubai; every slot's `start`/`end` are Dubai-local \"HH:MM\" and " +
    "`startsAtIso`/`endsAtIso` are UTC ISO instants suitable for `create_quote`'s `startHour`. " +
    "When `calendarChecked` is false the result only reflects confirmed/held bookings — treat it as provisional " +
    "and re-check with this tool (or rely on `create_quote`'s own re-check) before confirming with the client. " +
    "An unknown `yachtSlug` returns an error listing valid slugs; a past date returns an error.",
  annotations: checkAvailabilityAnnotations,
};

/** Dubai-local "HH:MM" for a UTC instant. */
function dubaiHhMm(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function todayDubaiDateStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBAI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Finds free charter slots for a yacht on a given Dubai-local date. Pure
 * function — no MCP transport dependency. Returns `structured` with an
 * empty `slots` array (never throws) when the yacht is unknown or the
 * date is in the past; `server.ts` maps those to `isError`.
 */
export async function checkAvailability(
  input: CheckAvailabilityInput
): Promise<{ structured: CheckAvailabilityOutput; text: string; isError?: boolean }> {
  const yacht = await fetchYachtBySlug(input.yachtSlug);
  if (!yacht) {
    const all = await fetchAllYachts();
    const validSlugs = all.map((y) => y.slug);
    const message = `No yacht found with slug "${input.yachtSlug}". Valid slugs: ${validSlugs.join(", ") || "none available"}.`;
    return {
      structured: {
        yachtSlug: input.yachtSlug,
        yachtName: "",
        date: input.date,
        isWeekendOrHoliday: false,
        minHours: 0,
        operatingHours: `${String(OPERATING_HOURS.start).padStart(2, "0")}:00–${String(OPERATING_HOURS.end).padStart(2, "0")}:00 ${DUBAI_TZ}`,
        slots: [],
        calendarChecked: false,
        note: message,
        validSlugs,
      },
      text: message,
      isError: true,
    };
  }

  if (input.date < todayDubaiDateStr()) {
    const message = `"${input.date}" is in the past. Please provide a future date.`;
    return {
      structured: {
        yachtSlug: input.yachtSlug,
        yachtName: sanitizeText(yacht.name, 200),
        date: input.date,
        isWeekendOrHoliday: false,
        minHours: 0,
        operatingHours: `${String(OPERATING_HOURS.start).padStart(2, "0")}:00–${String(OPERATING_HOURS.end).padStart(2, "0")}:00 ${DUBAI_TZ}`,
        slots: [],
        calendarChecked: false,
        note: message,
      },
      text: message,
      isError: true,
    };
  }

  const yachtInfo = await getYachtBookingInfo(input.yachtSlug);
  const referenceDate = dubaiLocalToUtc(input.date, 12);
  const weekend = isWeekendOrHoliday(referenceDate);
  const minHours = getMinHours(yacht, referenceDate);
  const requestedHours = input.hours;
  const effectiveMinHours = requestedHours ?? minHours;

  const result = await getAvailableSlots({
    yachtId: yachtInfo?.id ?? "",
    calendarId: yachtInfo?.calendarId ?? null,
    date: input.date,
    minHours: effectiveMinHours,
    maxHours: MAX_HOURS,
  });

  const slots: AvailabilitySlot[] = result.slots
    .filter((s) => s.hours >= effectiveMinHours)
    .map((s) => {
      const startDate = new Date(s.start);
      const endDate = new Date(s.end);
      return {
        start: dubaiHhMm(startDate),
        end: dubaiHhMm(endDate),
        startsAtIso: startDate.toISOString(),
        endsAtIso: endDate.toISOString(),
        hours: s.hours,
      };
    });

  const note = result.calendarChecked
    ? undefined
    : "Live calendar could not be verified; availability is provisional and will be re-checked at checkout.";

  const structured: CheckAvailabilityOutput = {
    yachtSlug: yacht.slug,
    yachtName: sanitizeText(yacht.name, 200),
    date: input.date,
    isWeekendOrHoliday: weekend,
    minHours,
    ...(requestedHours !== undefined ? { requestedHours } : {}),
    operatingHours: `${String(OPERATING_HOURS.start).padStart(2, "0")}:00–${String(OPERATING_HOURS.end).padStart(2, "0")}:00 ${DUBAI_TZ}`,
    slots,
    calendarChecked: result.calendarChecked,
    ...(note ? { note } : {}),
  };

  const text = slots.length
    ? `${structured.yachtName} on ${input.date}: ${slots.length} slot(s) available — ` +
      slots.map((s) => `${s.start}-${s.end} (${s.hours}h)`).join(", ") +
      (note ? ` ${note}` : "")
    : `${structured.yachtName} has no available slots on ${input.date} for at least ${effectiveMinHours} hour(s).` +
      (note ? ` ${note}` : "");

  return { structured, text };
}
