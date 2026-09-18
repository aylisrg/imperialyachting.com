import { SITE_CONFIG } from "@/lib/constants";
import { checkAvailability } from "./availability";
import { HOLD_TTL_MINUTES } from "./constants";
import {
  getBookingWithExtras,
  getYachtBookingInfo,
  updateBooking,
  type BookingWithExtras,
} from "./bookings-db";
import { getStripe, isStripeConfigured } from "./stripe";
import { DUBAI_TZ } from "./constants";

export interface CreateCheckoutCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateCheckoutInput {
  quoteId: string;
  customer: CreateCheckoutCustomer;
  successUrl?: string;
  cancelUrl?: string;
}

export type CreateCheckoutErrorCode =
  | "not_found"
  | "expired"
  | "already_paid"
  | "unavailable"
  | "stripe_error"
  | "not_configured";

export type CreateCheckoutResult =
  | {
      ok: true;
      bookingId: string;
      checkoutUrl: string;
      expiresAt: string;
      depositAmount: number;
      currency: string;
    }
  | {
      ok: false;
      code: CreateCheckoutErrorCode;
      message: string;
    };

/** Dubai-local "YYYY-MM-DD" for a UTC instant. */
function dubaiDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBAI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Dubai-local hour (0-23) for a UTC instant. */
function dubaiHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DUBAI_TZ,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? "0");
}

/**
 * Stripe requires `expires_at` to be at least 30 minutes and at most 24
 * hours in the future. We want it to track our own hold TTL, so clamp it
 * into a safe 31–35 minute window (31 rather than 30 to absorb request
 * latency between computing `holdExpiresAt` and Stripe receiving the
 * call).
 */
function clampStripeExpiresAt(holdExpiresAtMs: number): number {
  const nowSec = Math.floor(Date.now() / 1000);
  const holdSec = Math.floor(holdExpiresAtMs / 1000);
  const minSec = nowSec + 31 * 60;
  const maxSec = nowSec + 35 * 60;
  return Math.min(Math.max(holdSec, minSec), maxSec);
}

function buildLineItemDescription(data: BookingWithExtras): string {
  const { booking, extras, yachtName } = data;
  const startsAt = new Date(booking.startsAt);
  const date = dubaiDateStr(startsAt);
  const startHour = dubaiHour(startsAt);
  const balance = booking.totalAmount - booking.depositAmount;
  const extrasText =
    extras.length > 0 ? `, extras: ${extras.map((e) => `${e.name} x${e.qty}`).join(", ")}` : "";

  return (
    `${date} ${startHour}:00, ${booking.hours}h (+${booking.bonusHours} bonus) for ${booking.guests} guests` +
    `${extrasText}. Balance ${balance} ${booking.currency} due 48h before departure. (${yachtName})`
  );
}

/** Human-readable summary of a booking + its extras, for chat/email output. */
export function describeBookingForHumans(data: BookingWithExtras): string {
  const { booking, extras, yachtName } = data;
  const lines: string[] = [];
  lines.push(`Booking ${booking.id} — ${yachtName}`);
  lines.push(`Status: ${booking.status}`);
  lines.push(`Starts: ${booking.startsAt}`);
  lines.push(`Ends: ${booking.endsAt}`);
  lines.push(`Guests: ${booking.guests}`);

  if (extras.length > 0) {
    lines.push("Extras:");
    for (const e of extras) {
      lines.push(`  - ${e.name} x${e.qty}: ${booking.currency} ${e.amount.toLocaleString("en-US")}`);
    }
  }

  lines.push(`Total: ${booking.currency} ${booking.totalAmount.toLocaleString("en-US")}`);
  lines.push(`Deposit: ${booking.currency} ${booking.depositAmount.toLocaleString("en-US")}`);
  if (booking.customerName) {
    lines.push(`Customer: ${booking.customerName} (${booking.customerEmail ?? "no email"})`);
  }

  return lines.join("\n");
}

/**
 * Turns a `quote` booking into a Stripe Checkout Session for the 50%
 * deposit. Re-checks availability (while the booking is still in `quote`
 * status, so it does not count against itself), flips it to `hold`, then
 * creates the session. Idempotent on `quoteId`: a Checkout Session create
 * uses `Idempotency-Key: checkout-${quoteId}`, and a booking already in
 * `hold` with a live, unexpired Stripe session returns that same session's
 * URL instead of creating a new one.
 */
export async function createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured", message: "Stripe is not configured." };
  }

  const data = await getBookingWithExtras(input.quoteId);
  if (!data) {
    return { ok: false, code: "not_found", message: `No booking found for id "${input.quoteId}".` };
  }

  const { booking } = data;
  const now = Date.now();

  if (booking.status === "hold") {
    const holdExpiresAtMs = booking.holdExpiresAt ? new Date(booking.holdExpiresAt).getTime() : 0;
    if (booking.stripeCheckoutId && holdExpiresAtMs > now) {
      try {
        const session = await getStripe().checkout.sessions.retrieve(booking.stripeCheckoutId);
        if (session.status === "complete") {
          return { ok: false, code: "already_paid", message: "This booking's deposit has already been paid." };
        }
        if (session.status !== "expired" && session.url) {
          return {
            ok: true,
            bookingId: booking.id,
            checkoutUrl: session.url,
            expiresAt: booking.holdExpiresAt as string,
            depositAmount: booking.depositAmount,
            currency: booking.currency,
          };
        }
      } catch (err) {
        return {
          ok: false,
          code: "stripe_error",
          message: err instanceof Error ? err.message : "Failed to retrieve the existing checkout session.",
        };
      }
    }
    return {
      ok: false,
      code: "expired",
      message: "This booking's hold has expired. Please request a new quote.",
    };
  }

  if (booking.status === "deposit_paid" || booking.status === "paid") {
    return { ok: false, code: "already_paid", message: "This booking's deposit has already been paid." };
  }

  if (booking.status === "cancelled" || booking.status === "expired") {
    return { ok: false, code: "expired", message: "This booking is no longer active. Please request a new quote." };
  }

  // status === "quote"
  if (booking.quoteExpiresAt && new Date(booking.quoteExpiresAt).getTime() < now) {
    return { ok: false, code: "expired", message: "This quote has expired. Please request a new quote." };
  }

  const yachtInfo = await getYachtBookingInfo(data.yachtSlug);
  if (!yachtInfo) {
    return { ok: false, code: "not_found", message: `No yacht found for slug "${data.yachtSlug}".` };
  }

  const availability = await checkAvailability({
    yachtId: booking.yachtId,
    calendarId: yachtInfo.calendarId,
    startsAt: new Date(booking.startsAt),
    endsAt: new Date(booking.endsAt),
  });

  if (!availability.available) {
    return {
      ok: false,
      code: "unavailable",
      message: "This slot is no longer available. Please request a new quote.",
    };
  }

  const holdExpiresAt = new Date(now + HOLD_TTL_MINUTES * 60_000);

  await updateBooking(booking.id, {
    status: "hold",
    hold_expires_at: holdExpiresAt.toISOString(),
    customer_name: input.customer.name,
    customer_email: input.customer.email,
    customer_phone: input.customer.phone ?? null,
  });

  const description = buildLineItemDescription(data);
  const metadata = {
    booking_id: booking.id,
    yacht_slug: data.yachtSlug,
    payment_stage: "deposit",
    source: booking.source,
  };

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: booking.currency.toLowerCase(),
              unit_amount: booking.depositAmount * 100,
              product_data: {
                name: `Deposit (50%) — ${data.yachtName}`,
                description,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: input.customer.email,
        client_reference_id: booking.id,
        metadata,
        expires_at: clampStripeExpiresAt(holdExpiresAt.getTime()),
        success_url:
          input.successUrl ??
          `${SITE_CONFIG.url}/booking/${booking.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: input.cancelUrl ?? `${SITE_CONFIG.url}/booking/${booking.id}?status=cancelled`,
        payment_intent_data: {
          description,
          metadata,
        },
      },
      { idempotencyKey: `checkout-${input.quoteId}` }
    );

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    await updateBooking(booking.id, { stripe_checkout_id: session.id });

    return {
      ok: true,
      bookingId: booking.id,
      checkoutUrl: session.url,
      expiresAt: holdExpiresAt.toISOString(),
      depositAmount: booking.depositAmount,
      currency: booking.currency,
    };
  } catch (err) {
    await updateBooking(booking.id, { status: "quote", hold_expires_at: null });
    return {
      ok: false,
      code: "stripe_error",
      message: err instanceof Error ? err.message : "Stripe checkout session creation failed.",
    };
  }
}
