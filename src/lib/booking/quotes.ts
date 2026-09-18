import { fetchYachtBySlug } from "@/lib/yachts-db";
import { fetchActiveExtras } from "@/lib/booking/extras-db";
import { isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import {
  calculateQuote,
  formatQuoteSummary,
  isWeekendOrHoliday,
  type QuoteError,
  type QuoteExtraLine,
  type QuoteResult,
} from "./pricing-engine";
import { checkAvailability, dubaiLocalToUtc, type AvailabilityConflict } from "./availability";
import { QUOTE_TTL_MINUTES } from "./constants";
import {
  getBookingWithExtras,
  getYachtBookingInfo,
  insertBooking,
  insertBookingExtras,
} from "./bookings-db";
import type { BookingSource, Extra } from "@/types/booking";

export interface QuoteExtraInput {
  slug: string;
  qty: number;
}

export interface CreateQuoteInput {
  yachtSlug: string;
  /** YYYY-MM-DD, Dubai local calendar date. */
  date: string;
  /** 0–23, Dubai local start hour. */
  startHour: number;
  hours: number;
  guests: number;
  extras?: QuoteExtraInput[];
  source: Extract<BookingSource, "mcp" | "web">;
}

type QuoteOk = Extract<QuoteResult, { ok: true }>;

export type CreateQuoteErrorCode =
  | "yacht_not_found"
  | "unknown_extra"
  | "quote_invalid"
  | "unavailable"
  | "not_configured"
  | "not_found";

export type CreateQuoteResult =
  | {
      ok: true;
      quoteId: string;
      quote: QuoteOk;
      yacht: { slug: string; name: string };
      startsAt: string;
      endsAt: string;
      expiresAt: string;
      availability: { available: boolean; calendarChecked: boolean; conflicts: AvailabilityConflict[] };
      summary: string;
    }
  | {
      ok: false;
      code: CreateQuoteErrorCode;
      message: string;
      errors?: QuoteError[];
      /** Present when code === "unavailable": what's blocking the slot. */
      conflicts?: AvailabilityConflict[];
    };

/** Resolves `{ slug, qty }` extra inputs against the active extras catalogue. */
function resolveExtras(
  inputExtras: QuoteExtraInput[],
  activeExtras: Extra[]
): { ok: true; resolved: { extra: Extra; qty: number }[] } | { ok: false; slug: string } {
  const resolved: { extra: Extra; qty: number }[] = [];
  for (const { slug, qty } of inputExtras) {
    const extra = activeExtras.find((e) => e.slug === slug);
    if (!extra) return { ok: false, slug };
    resolved.push({ extra, qty });
  }
  return { ok: true, resolved };
}

/**
 * Builds a charter quote: resolves the yacht + extras, prices the charter,
 * checks availability, and — if everything is valid and available —
 * persists a `quote` status booking row (TTL `QUOTE_TTL_MINUTES`) that
 * `createCheckout()` can later turn into a Stripe Checkout Session.
 */
export async function createQuote(input: CreateQuoteInput): Promise<CreateQuoteResult> {
  if (!isAdminSupabaseConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message: "Booking is not configured on this server.",
    };
  }

  const [yacht, yachtInfo] = await Promise.all([
    fetchYachtBySlug(input.yachtSlug),
    getYachtBookingInfo(input.yachtSlug),
  ]);

  if (!yacht || !yachtInfo) {
    return {
      ok: false,
      code: "yacht_not_found",
      message: `No yacht found for slug "${input.yachtSlug}".`,
    };
  }

  const requestedExtras = input.extras ?? [];
  let resolvedExtras: { extra: Extra; qty: number }[] = [];
  if (requestedExtras.length > 0) {
    const activeExtras = await fetchActiveExtras();
    const resolution = resolveExtras(requestedExtras, activeExtras);
    if (!resolution.ok) {
      return {
        ok: false,
        code: "unknown_extra",
        message: `Unknown extra "${resolution.slug}". Call list_extras for the current catalogue.`,
      };
    }
    resolvedExtras = resolution.resolved;
  }

  const startsAt = dubaiLocalToUtc(input.date, input.startHour);

  const quote = calculateQuote({
    yacht,
    startsAt,
    hours: input.hours,
    guests: input.guests,
    extras: resolvedExtras,
  });

  if (!quote.ok) {
    return {
      ok: false,
      code: "quote_invalid",
      message: formatQuoteSummary(quote, yacht.name),
      errors: quote.errors,
    };
  }

  const endsAt = quote.endsAt;

  const availability = await checkAvailability({
    yachtId: yachtInfo.id,
    calendarId: yachtInfo.calendarId,
    startsAt,
    endsAt,
  });

  if (!availability.available) {
    return {
      ok: false,
      code: "unavailable",
      message:
        "The requested date/time is not available for this yacht. Call check_availability to find an open slot.",
      conflicts: availability.conflicts,
    };
  }

  const quoteExpiresAt = new Date(Date.now() + QUOTE_TTL_MINUTES * 60_000);

  const booking = await insertBooking({
    yacht_id: yachtInfo.id,
    status: "quote",
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    hours: input.hours,
    guests: input.guests,
    source: input.source,
    base_amount: quote.baseAmount,
    extras_amount: quote.extrasAmount,
    bonus_hours: quote.bonusHours,
    total_amount: quote.totalAmount,
    deposit_amount: quote.depositAmount,
    currency: quote.currency,
    quote_expires_at: quoteExpiresAt.toISOString(),
  });

  if (resolvedExtras.length > 0) {
    const extraLines: QuoteExtraLine[] = quote.extras;
    await insertBookingExtras(
      resolvedExtras.map(({ extra, qty }, i) => ({
        booking_id: booking.id,
        extra_id: extra.id,
        qty,
        unit_price: extra.price,
        amount: extraLines[i]?.amount ?? extra.price * qty,
      }))
    );
  }

  return {
    ok: true,
    quoteId: booking.id,
    quote,
    yacht: { slug: yacht.slug, name: yacht.name },
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    expiresAt: booking.quoteExpiresAt ?? quoteExpiresAt.toISOString(),
    availability: {
      available: true,
      calendarChecked: availability.calendarChecked,
      conflicts: [],
    },
    summary: formatQuoteSummary(quote, yacht.name),
  };
}

/**
 * Re-reads a previously created quote (or hold/paid booking) from the DB
 * and reconstructs the same shape `createQuote()` returns, without
 * recomputing pricing. Fields not persisted on `bookings` (hourly rate,
 * season, isWeekend, min hours) are best-effort derived or defaulted —
 * they are informational only, the persisted amounts are authoritative.
 */
export async function getQuote(quoteId: string): Promise<CreateQuoteResult> {
  const data = await getBookingWithExtras(quoteId);
  if (!data) {
    return { ok: false, code: "not_found", message: `No quote/booking found for id "${quoteId}".` };
  }

  const { booking, extras, yachtName, yachtSlug } = data;

  let unitBySlug = new Map<string, Extra["unit"]>();
  if (extras.length > 0) {
    const activeExtras = await fetchActiveExtras();
    unitBySlug = new Map(activeExtras.map((e) => [e.slug, e.unit]));
  }

  const extraLines: QuoteExtraLine[] = extras.map((e) => ({
    slug: e.slug,
    name: e.name,
    qty: e.qty,
    unitPrice: e.unitPrice,
    unit: unitBySlug.get(e.slug) ?? "per_booking",
    amount: e.amount,
  }));

  const quote: QuoteOk = {
    ok: true,
    currency: booking.currency,
    hourlyRate: booking.hours > 0 ? Math.round(booking.baseAmount / booking.hours) : 0,
    hours: booking.hours,
    bonusHours: booking.bonusHours,
    totalHours: booking.hours + booking.bonusHours,
    baseAmount: booking.baseAmount,
    extras: extraLines,
    extrasAmount: booking.extrasAmount,
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    balanceAmount: booking.totalAmount - booking.depositAmount,
    season: null,
    isWeekend: isWeekendOrHoliday(new Date(booking.startsAt)),
    minHours: 0,
    endsAt: new Date(booking.endsAt),
  };

  return {
    ok: true,
    quoteId: booking.id,
    quote,
    yacht: { slug: yachtSlug, name: yachtName },
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    expiresAt: booking.quoteExpiresAt ?? booking.holdExpiresAt ?? booking.createdAt,
    availability: { available: true, calendarChecked: false, conflicts: [] },
    summary: formatQuoteSummary(quote, yachtName),
  };
}
