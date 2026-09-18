import type { Yacht, SeasonPricing } from "@/types/yacht";
import type { Extra } from "@/types/booking";
import {
  BONUS_HOURS_EVERY,
  DEPOSIT_RATE,
  DUBAI_TZ,
  MAX_HOURS,
  MIN_HOURS_FALLBACK,
  OPERATING_HOURS,
  UAE_PUBLIC_HOLIDAYS_2026,
  WEEKEND_DAYS,
} from "./constants";

/**
 * Pure pricing / quoting engine for charter bookings.
 *
 * No I/O, no dates-as-strings ambiguity beyond what SeasonPricing already
 * uses — everything here operates on `Date` objects (assumed to represent
 * real instants) and converts to Dubai local time internally when needed.
 */

// ---------------------------------------------------------------------------
// Date / timezone helpers
// ---------------------------------------------------------------------------

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Returns the Dubai-local calendar date as "YYYY-MM-DD". */
function dubaiDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBAI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Returns the "MM-DD" portion of a "YYYY-MM-DD" or "MM-DD" string. */
function toMonthDay(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[1]}-${parts[2]}`;
  return dateStr;
}

/** Whether month-day `md` falls within [from, to] inclusive, wrapping the year if from > to. */
function monthDayInRange(md: string, from: string, to: string): boolean {
  if (from <= to) return md >= from && md <= to;
  // Range spans the new year (e.g. Oct -> Apr).
  return md >= from || md <= to;
}

/** Minutes since local midnight, in Dubai time (UAE has a single fixed UTC+4 offset, no DST). */
function dubaiMinutesOfDay(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DUBAI_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/**
 * True if `date` falls on a UAE weekend day (Fri/Sat) or a UAE public
 * holiday, using Dubai local calendar day.
 */
export function isWeekendOrHoliday(date: Date): boolean {
  const weekdayShort = new Intl.DateTimeFormat("en-US", {
    timeZone: DUBAI_TZ,
    weekday: "short",
  }).format(date);
  const idx = WEEKDAY_SHORT_TO_INDEX[weekdayShort];
  if (idx !== undefined && WEEKEND_DAYS.includes(idx)) return true;
  return UAE_PUBLIC_HOLIDAYS_2026.includes(dubaiDateStr(date));
}

// ---------------------------------------------------------------------------
// Season resolution
// ---------------------------------------------------------------------------

/** Picks, among candidate rows, the one with the lowest non-null hourly rate. Null if none has one. */
function pickBest(rows: SeasonPricing[]): SeasonPricing | null {
  let best: SeasonPricing | null = null;
  for (const row of rows) {
    if (row.hourly !== null && row.hourly !== undefined) {
      if (best === null || best.hourly === null || row.hourly < (best.hourly as number)) {
        best = row;
      }
    }
  }
  return best;
}

/**
 * Resolves which SeasonPricing row applies to `date`.
 *
 * Priority:
 *  1. A row whose validFrom..validTo (inclusive, Dubai-local date, year-wrapping
 *     ranges supported) contains `date`, AND whose isWeekend matches.
 *  2. A row whose validFrom..validTo contains `date` (any isWeekend).
 *  3. The row with the lowest non-null hourly rate, across all rows.
 *  4. null if no row has a non-null hourly rate.
 */
export function resolveSeason(
  pricing: SeasonPricing[],
  date: Date,
  isWeekend: boolean
): SeasonPricing | null {
  const md = toMonthDay(dubaiDateStr(date));

  const dateMatches = pricing.filter((row) => {
    if (!row.validFrom || !row.validTo) return false;
    return monthDayInRange(md, toMonthDay(row.validFrom), toMonthDay(row.validTo));
  });

  if (dateMatches.length > 0) {
    const exact = dateMatches.filter((row) => (row.isWeekend ?? false) === isWeekend);
    const candidates = exact.length > 0 ? exact : dateMatches;
    const chosen = pickBest(candidates) ?? candidates[0];
    if (chosen.hourly !== null && chosen.hourly !== undefined) return chosen;
    // The matched row(s) have no usable hourly rate — fall through to the
    // global fallback below rather than returning a row with hourly: null.
  }

  // Fallback: lowest non-null hourly rate across the entire list.
  return pickBest(pricing);
}

/** Minimum paid hours required for a booking of `yacht` on `date`. */
export function getMinHours(yacht: Yacht, date: Date): number {
  const weekend = isWeekendOrHoliday(date);
  if (weekend) return yacht.minHoursWeekend ?? MIN_HOURS_FALLBACK.weekend;
  return yacht.minHoursWeekday ?? MIN_HOURS_FALLBACK.weekday;
}

// ---------------------------------------------------------------------------
// Quote calculation
// ---------------------------------------------------------------------------

export type QuoteErrorCode =
  | "min_hours"
  | "max_hours"
  | "capacity"
  | "no_pricing"
  | "outside_operating_hours"
  | "past_date"
  | "invalid_extra_qty"
  | "booking_disabled";

export interface QuoteError {
  code: QuoteErrorCode;
  message: string;
}

export interface QuoteExtraLine {
  slug: string;
  name: string;
  qty: number;
  unitPrice: number;
  unit: Extra["unit"];
  amount: number;
}

export type QuoteResult =
  | {
      ok: true;
      currency: string;
      hourlyRate: number;
      hours: number;
      bonusHours: number;
      totalHours: number;
      baseAmount: number;
      extras: QuoteExtraLine[];
      extrasAmount: number;
      totalAmount: number;
      depositAmount: number;
      balanceAmount: number;
      season: string | null;
      isWeekend: boolean;
      minHours: number;
      endsAt: Date;
    }
  | {
      ok: false;
      errors: QuoteError[];
    };

export interface CalculateQuoteInput {
  yacht: Yacht;
  startsAt: Date;
  hours: number;
  guests: number;
  extras: { extra: Extra; qty: number }[];
  b2b?: boolean;
}

export function calculateQuote(input: CalculateQuoteInput): QuoteResult {
  const { yacht, startsAt, hours, guests, extras, b2b } = input;
  const errors: QuoteError[] = [];

  if (yacht.bookingEnabled === false) {
    errors.push({ code: "booking_disabled", message: "Online booking is disabled for this yacht." });
  }

  if (startsAt.getTime() < Date.now()) {
    errors.push({ code: "past_date", message: "The selected date and time is in the past." });
  }

  const isWeekend = isWeekendOrHoliday(startsAt);
  const minHours = getMinHours(yacht, startsAt);

  if (hours < minHours) {
    errors.push({
      code: "min_hours",
      message: `Minimum charter length is ${minHours} hour${minHours === 1 ? "" : "s"} for this date.`,
    });
  }

  if (hours > MAX_HOURS) {
    errors.push({
      code: "max_hours",
      message: `Maximum charter length is ${MAX_HOURS} hours.`,
    });
  }

  if (guests > yacht.capacity) {
    errors.push({
      code: "capacity",
      message: `This yacht's maximum capacity is ${yacht.capacity} guests.`,
    });
  }

  for (const { extra, qty } of extras) {
    if (!Number.isInteger(qty) || qty <= 0) {
      errors.push({
        code: "invalid_extra_qty",
        message: `Invalid quantity for extra "${extra.name}".`,
      });
    }
  }

  const season = resolveSeason(yacht.pricing, startsAt, isWeekend);
  let hourlyRate: number | null = null;
  if (season) {
    if (b2b && season.hourlyB2B !== null && season.hourlyB2B !== undefined) {
      hourlyRate = season.hourlyB2B;
    } else {
      hourlyRate = season.hourly ?? null;
    }
  }
  if (hourlyRate === null) {
    errors.push({
      code: "no_pricing",
      message: "No hourly pricing is available for the selected date.",
    });
  }

  const paidHours = Math.max(hours, 0);
  const bonusHours = Math.floor(paidHours / BONUS_HOURS_EVERY);
  const totalHours = paidHours + bonusHours;
  const endsAt = new Date(startsAt.getTime() + totalHours * 60 * 60 * 1000);

  const startMinutes = dubaiMinutesOfDay(startsAt);
  const endMinutes = startMinutes + totalHours * 60;
  const outsideHours =
    startMinutes < OPERATING_HOURS.start * 60 || endMinutes > OPERATING_HOURS.end * 60;
  if (outsideHours) {
    errors.push({
      code: "outside_operating_hours",
      message: `Charters must start at or after ${OPERATING_HOURS.start}:00 and end by ${OPERATING_HOURS.end}:00 Dubai time.`,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // At this point hourlyRate, season are guaranteed non-null (no `no_pricing` error was raised).
  const rate = hourlyRate as number;
  const baseAmount = Math.round(rate * hours);

  const extraLines: QuoteExtraLine[] = extras.map(({ extra, qty }) => {
    let amount: number;
    switch (extra.unit) {
      case "per_booking":
        amount = extra.price * qty;
        break;
      case "per_hour":
        amount = extra.price * qty * hours;
        break;
      case "per_guest":
        amount = extra.price * qty * guests;
        break;
      default:
        amount = extra.price * qty;
    }
    return {
      slug: extra.slug,
      name: extra.name,
      qty,
      unitPrice: extra.price,
      unit: extra.unit,
      amount: Math.round(amount),
    };
  });

  const extrasAmount = extraLines.reduce((sum, l) => sum + l.amount, 0);
  const totalAmount = Math.round(baseAmount + extrasAmount);
  const depositAmount = Math.ceil(totalAmount * DEPOSIT_RATE);
  const balanceAmount = totalAmount - depositAmount;

  return {
    ok: true,
    currency: yacht.currency ?? "AED",
    hourlyRate: rate,
    hours,
    bonusHours,
    totalHours,
    baseAmount,
    extras: extraLines,
    extrasAmount,
    totalAmount,
    depositAmount,
    balanceAmount,
    season: season ? season.season : null,
    isWeekend,
    minHours,
    endsAt,
  };
}

// ---------------------------------------------------------------------------
// Human-readable summary (for LLM / text output)
// ---------------------------------------------------------------------------

function formatDubai(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatQuoteSummary(q: QuoteResult, yachtName: string): string {
  if (!q.ok) {
    const lines = [`Unable to generate a quote for ${yachtName}:`];
    for (const err of q.errors) {
      lines.push(`- ${err.message}`);
    }
    return lines.join("\n");
  }

  const lines: string[] = [];
  lines.push(`Charter Quote — ${yachtName}`);
  lines.push(
    `${q.hours} paid hour${q.hours === 1 ? "" : "s"}${
      q.bonusHours > 0 ? ` + ${q.bonusHours} bonus hour${q.bonusHours === 1 ? "" : "s"} FREE` : ""
    } (${q.totalHours} hour${q.totalHours === 1 ? "" : "s"} total)`
  );
  lines.push(`Ends: ${formatDubai(q.endsAt)} (Dubai time)`);
  lines.push(`Season: ${q.season ?? "n/a"}${q.isWeekend ? " (weekend/holiday rate)" : ""}`);
  lines.push(`Rate: ${q.currency} ${q.hourlyRate.toLocaleString("en-US")}/hr`);
  lines.push(`Base amount: ${q.currency} ${q.baseAmount.toLocaleString("en-US")}`);

  if (q.extras.length > 0) {
    lines.push("Extras:");
    for (const e of q.extras) {
      lines.push(`  - ${e.name} x${e.qty}: ${q.currency} ${e.amount.toLocaleString("en-US")}`);
    }
    lines.push(`Extras total: ${q.currency} ${q.extrasAmount.toLocaleString("en-US")}`);
  }

  lines.push(`Total: ${q.currency} ${q.totalAmount.toLocaleString("en-US")}`);
  lines.push(
    `Deposit (50% due now): ${q.currency} ${q.depositAmount.toLocaleString("en-US")}`
  );
  lines.push(
    `Balance (due 48h before departure): ${q.currency} ${q.balanceAmount.toLocaleString("en-US")}`
  );

  return lines.join("\n");
}
