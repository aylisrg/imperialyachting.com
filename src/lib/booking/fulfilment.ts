import { createAdminSupabase } from "@/lib/supabase/admin";
import { SITE_CONFIG } from "@/lib/constants";
import { getBookingWithExtras, updateBooking, type BookingWithExtras } from "./bookings-db";
import { describeBookingForHumans } from "./checkout";
import { createCharterEvent } from "@/lib/google/calendar";
import {
  sendEmail,
  sendTelegram,
  escapeTelegramMarkdown,
  bookingDepositPaidCustomer,
  bookingDepositPaidAdmin,
  formatDubai,
  type BookingNotificationBase,
} from "@/lib/notify";

/**
 * Fulfilment logic for the Stripe checkout webhook: idempotency bookkeeping,
 * booking status transitions, Google Calendar event creation and customer/
 * admin notifications. Everything here is written to be called from
 * `src/app/api/stripe/webhook/route.ts` after signature verification.
 */

/**
 * The subset of a Stripe Checkout Session's fields this module needs.
 * Kept narrow (rather than importing `Stripe.Checkout.Session` directly)
 * so tests can build plain fixtures without pulling in the full SDK type.
 */
export interface StripeCheckoutSessionLike {
  id: string;
  client_reference_id: string | null;
  payment_intent: string | { id: string } | null;
  metadata?: Record<string, string> | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  amount_total?: number | null;
}

export interface FulfilmentResult {
  ok: boolean;
  bookingId?: string;
  skipped?: string;
}

interface ResolvedCustomer {
  name: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * Idempotency guard for Stripe webhook events. Inserts `(id, type)` into
 * `stripe_events`. Returns `false` when that event id has already been
 * recorded (a `23505` unique-violation on the primary key, i.e. this is a
 * Stripe retry or duplicate delivery), so the caller can skip reprocessing
 * it. Throws on any other database error so the webhook route can respond
 * with a 500 and let Stripe retry once the database is reachable again.
 */
export async function markStripeEventProcessed(eventId: string, type: string): Promise<boolean> {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("stripe_events").insert({ id: eventId, type });

  if (error) {
    if (error.code === "23505") return false;
    throw new Error(`[fulfilment] failed to record stripe event ${eventId}: ${error.message}`);
  }

  return true;
}

/** `booking_id` from `client_reference_id`, falling back to `metadata.booking_id`. */
function resolveBookingId(session: StripeCheckoutSessionLike): string | null {
  return session.client_reference_id || session.metadata?.booking_id || null;
}

function resolvePaymentIntentId(session: StripeCheckoutSessionLike): string | null {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
}

/** The yacht's Google Calendar id. `getBookingWithExtras` doesn't carry it. */
async function getYachtCalendarId(yachtId: string): Promise<string | null> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("yachts")
    .select("calendar_id")
    .eq("id", yachtId)
    .single();

  if (error || !data) return null;
  return data.calendar_id;
}

function adminBookingUrl(bookingId: string): string {
  return `${SITE_CONFIG.url}/admin/bookings/${bookingId}`;
}

/**
 * Creates the "deposit paid" calendar event on the yacht's calendar and
 * saves the resulting `gcal_event_id`. Never throws — logs and returns on
 * any failure so it can't block the rest of the fulfilment flow.
 */
async function createCalendarEventForBooking(
  data: BookingWithExtras,
  customer: ResolvedCustomer
): Promise<void> {
  const { booking, yachtName } = data;

  try {
    const calendarId = await getYachtCalendarId(booking.yachtId);
    if (!calendarId) {
      console.warn(`[fulfilment] no calendar configured for yacht ${booking.yachtId} (booking ${booking.id})`);
      return;
    }

    const summary = `CHARTER ${yachtName} — ${booking.guests} pax — ${customer.name ?? "Guest"} (deposit paid)`;
    const description = [
      describeBookingForHumans(data),
      `Phone: ${customer.phone ?? "—"}`,
      "",
      `Admin: ${adminBookingUrl(booking.id)}`,
    ].join("\n");

    const eventId = await createCharterEvent(calendarId, {
      summary,
      description,
      start: new Date(booking.startsAt),
      end: new Date(booking.endsAt),
      attendeesEmail: customer.email ?? undefined,
    });

    if (!eventId) {
      console.error(`[fulfilment] failed to create calendar event for booking ${booking.id}`);
      return;
    }

    await updateBooking(booking.id, { gcal_event_id: eventId });
  } catch (err) {
    console.error(`[fulfilment] calendar event creation threw for booking ${booking.id}:`, err);
  }
}

function toNotificationBase(data: BookingWithExtras): BookingNotificationBase {
  const { booking, extras, yachtName } = data;
  return {
    yachtName,
    startsAt: new Date(booking.startsAt),
    hours: booking.hours,
    bonusHours: booking.bonusHours,
    guests: booking.guests,
    extras: extras.map((e) => ({ name: e.name, qty: e.qty, amount: e.amount })),
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    balanceAmount: booking.totalAmount - booking.depositAmount,
    currency: booking.currency,
    bookingId: booking.id,
  };
}

function buildDepositTelegramMessage(
  data: BookingWithExtras,
  base: BookingNotificationBase,
  customer: ResolvedCustomer
): string {
  const lines = [
    "💰 *Deposit Paid*",
    `Yacht: ${escapeTelegramMarkdown(data.yachtName)}`,
    `Date: ${escapeTelegramMarkdown(formatDubai(base.startsAt))}`,
    `Hours: ${escapeTelegramMarkdown(String(base.hours))}`,
    `Guests: ${escapeTelegramMarkdown(String(base.guests))}`,
    `Total: ${escapeTelegramMarkdown(`${base.currency} ${base.totalAmount.toLocaleString("en-US")}`)}`,
    `Deposit: ${escapeTelegramMarkdown(`${base.currency} ${base.depositAmount.toLocaleString("en-US")}`)}`,
    `Customer: ${escapeTelegramMarkdown(customer.name ?? "—")}`,
    `Phone: ${escapeTelegramMarkdown(customer.phone ?? "—")}`,
    `Source: ${escapeTelegramMarkdown(data.booking.source)}`,
    `Admin: ${adminBookingUrl(data.booking.id)}`,
  ];
  return lines.join("\n");
}

/**
 * Sends the customer confirmation email, the admin notification email and
 * the Telegram summary for a paid deposit. Each channel is wrapped in its
 * own try/catch — a failure in one never blocks the others and this
 * function itself never throws.
 */
async function sendDepositPaidNotifications(
  data: BookingWithExtras,
  customer: ResolvedCustomer
): Promise<void> {
  const base = toNotificationBase(data);
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL || SITE_CONFIG.email;

  if (customer.email) {
    try {
      const template = bookingDepositPaidCustomer(base);
      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      console.error(`[fulfilment] failed to send customer deposit email for booking ${data.booking.id}:`, err);
    }
  } else {
    console.warn(`[fulfilment] no customer email on file for booking ${data.booking.id}, skipping confirmation email`);
  }

  try {
    const template = bookingDepositPaidAdmin({
      ...base,
      customer: { name: customer.name ?? "—", email: customer.email ?? "—", phone: customer.phone },
      source: data.booking.source,
    });
    await sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err) {
    console.error(`[fulfilment] failed to send admin deposit email for booking ${data.booking.id}:`, err);
  }

  try {
    await sendTelegram(buildDepositTelegramMessage(data, base, customer), { parseMode: "Markdown" });
  } catch (err) {
    console.error(`[fulfilment] failed to send telegram notification for booking ${data.booking.id}:`, err);
  }
}

/**
 * Handles `checkout.session.completed` / `checkout.session.async_payment_succeeded`.
 *
 * Resolves the booking from `client_reference_id` (falling back to
 * `metadata.booking_id`), and:
 * - a booking already `deposit_paid`/`paid` is left alone (duplicate delivery);
 * - `metadata.payment_stage === "balance"` (the later balance-collection
 *   cron/link) flips the booking to `paid`;
 * - anything else is the initial deposit, and flips it to `deposit_paid`,
 *   creates the Google Calendar event and sends the deposit-paid
 *   notifications.
 *
 * Never throws: every side effect after the booking is loaded is
 * individually try/caught and logged with the booking id.
 */
export async function handleCheckoutCompleted(session: StripeCheckoutSessionLike): Promise<FulfilmentResult> {
  const bookingId = resolveBookingId(session);
  if (!bookingId) {
    console.error(`[fulfilment] checkout session ${session.id} has no booking id`);
    return { ok: false, skipped: "no_booking_id" };
  }

  const data = await getBookingWithExtras(bookingId);
  if (!data) {
    console.error(`[fulfilment] booking ${bookingId} not found for checkout session ${session.id}`);
    return { ok: false, bookingId, skipped: "not_found" };
  }

  const { booking } = data;
  if (booking.status === "deposit_paid" || booking.status === "paid") {
    return { ok: true, bookingId, skipped: "already_processed" };
  }

  const isBalancePayment = session.metadata?.payment_stage === "balance";
  const newStatus = isBalancePayment ? "paid" : "deposit_paid";
  const paymentIntentId = resolvePaymentIntentId(session);

  const customer: ResolvedCustomer = {
    name: booking.customerName || session.customer_details?.name || null,
    email: booking.customerEmail || session.customer_details?.email || null,
    phone: booking.customerPhone || session.customer_details?.phone || null,
  };

  const patch: Record<string, unknown> = {
    status: newStatus,
    stripe_payment_intent_id: paymentIntentId,
  };
  if (!booking.customerName && customer.name) patch.customer_name = customer.name;
  if (!booking.customerEmail && customer.email) patch.customer_email = customer.email;
  if (!booking.customerPhone && customer.phone) patch.customer_phone = customer.phone;

  const updated = await updateBooking(booking.id, patch);
  if (!updated) {
    console.error(`[fulfilment] failed to update booking ${booking.id} after payment`);
    return { ok: false, bookingId };
  }

  // The calendar event and "deposit paid" notifications only apply to the
  // initial deposit — the balance settlement (from the cron-driven second
  // Checkout Session) reuses this same handler but shouldn't repeat them.
  if (!isBalancePayment) {
    await createCalendarEventForBooking(data, customer);
    await sendDepositPaidNotifications(data, customer);
  }

  return { ok: true, bookingId };
}

/**
 * Releases a `hold` booking back to `expired` when its Checkout Session
 * expired or its async payment failed. Any other status (already paid,
 * already expired/cancelled, etc.) is left untouched.
 */
async function releaseHoldIfPending(session: StripeCheckoutSessionLike): Promise<FulfilmentResult> {
  const bookingId = resolveBookingId(session);
  if (!bookingId) {
    console.error(`[fulfilment] checkout session ${session.id} has no booking id`);
    return { ok: false, skipped: "no_booking_id" };
  }

  const data = await getBookingWithExtras(bookingId);
  if (!data) {
    console.error(`[fulfilment] booking ${bookingId} not found for checkout session ${session.id}`);
    return { ok: false, bookingId, skipped: "not_found" };
  }

  if (data.booking.status !== "hold") {
    return { ok: true, bookingId, skipped: "not_hold" };
  }

  const updated = await updateBooking(bookingId, { status: "expired", hold_expires_at: null });
  if (!updated) {
    console.error(`[fulfilment] failed to expire hold for booking ${bookingId}`);
    return { ok: false, bookingId };
  }

  return { ok: true, bookingId };
}

/** Handles `checkout.session.expired`: releases a `hold` booking back to `expired`. */
export async function handleCheckoutExpired(session: StripeCheckoutSessionLike): Promise<FulfilmentResult> {
  return releaseHoldIfPending(session);
}

/** Handles `checkout.session.async_payment_failed`: same as an expired session. */
export async function handleAsyncPaymentFailed(session: StripeCheckoutSessionLike): Promise<FulfilmentResult> {
  return releaseHoldIfPending(session);
}
