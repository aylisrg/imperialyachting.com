import { createAdminSupabase } from "@/lib/supabase/admin";
import { SITE_CONFIG } from "@/lib/constants";
import { sendEmail, sendTelegram, bookingBalanceReminder } from "@/lib/notify";
import { getBookingWithExtras, updateBooking } from "./bookings-db";
import { getStripe, isStripeConfigured } from "./stripe";

/** Text marker appended to `notes` once a balance payment link has been sent for a booking. */
const BALANCE_LINK_SENT_MARKER = "[balance-link-sent]";

export type CreateBalanceCheckoutErrorCode =
  | "not_found"
  | "wrong_status"
  | "nothing_due"
  | "stripe_error"
  | "not_configured";

export type CreateBalanceCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; code: CreateBalanceCheckoutErrorCode; message: string };

/**
 * Finds `deposit_paid` bookings whose charter starts within the next
 * `withinHours` hours and that have not already had a balance payment
 * link sent (tracked via a `[balance-link-sent]` text marker appended to
 * `notes`, to avoid a schema change). Filtering on the marker is done in
 * JS since it's a substring check on free-text notes.
 */
export async function findBookingsDueForBalance({
  withinHours = 72,
}: { withinHours?: number } = {}): Promise<string[]> {
  const supabase = createAdminSupabase();
  const nowIso = new Date().toISOString();
  const untilIso = new Date(Date.now() + withinHours * 60 * 60_000).toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select("id, notes")
    .eq("status", "deposit_paid")
    .gte("starts_at", nowIso)
    .lte("starts_at", untilIso);

  if (error) {
    console.error("[balance] failed to query bookings due for balance:", error);
    return [];
  }

  return (data ?? [])
    .filter((row) => !(row.notes ?? "").includes(BALANCE_LINK_SENT_MARKER))
    .map((row) => row.id);
}

/**
 * Clamps a candidate Stripe `expires_at` (unix seconds) into Stripe's
 * required 30 minute – 24 hour window, further capped so the session
 * never outlives the charter's own start time by more than a small
 * margin. Preferred target is `starts_at - 1h`, but at least
 * `now + 30min` and at most `now + 24h`.
 */
function clampBalanceExpiresAt(nowMs: number, startsAtMs: number): number {
  const nowSec = Math.floor(nowMs / 1000);
  const preferredSec = Math.floor(startsAtMs / 1000) - 60 * 60;
  const minSec = nowSec + 31 * 60; // 30min + latency buffer
  const maxSec = nowSec + 24 * 60 * 60 - 5 * 60; // 24h - small buffer
  return Math.min(Math.max(preferredSec, minSec), maxSec);
}

/**
 * Creates (or, on retry, re-creates idempotently) a Stripe Checkout
 * Session for the remaining balance on a `deposit_paid` booking. Appends
 * a `[balance-link-sent]` marker + timestamp to the booking's `notes` on
 * success so `findBookingsDueForBalance` won't pick it up again.
 */
export async function createBalanceCheckout(bookingId: string): Promise<CreateBalanceCheckoutResult> {
  if (!isStripeConfigured()) {
    return { ok: false, code: "not_configured", message: "Stripe is not configured." };
  }

  const data = await getBookingWithExtras(bookingId);
  if (!data) {
    return { ok: false, code: "not_found", message: `No booking found for id "${bookingId}".` };
  }

  const { booking, yachtName, yachtSlug } = data;

  if (booking.status !== "deposit_paid") {
    return {
      ok: false,
      code: "wrong_status",
      message: `Booking is in status "${booking.status}", expected "deposit_paid".`,
    };
  }

  const balance = booking.totalAmount - booking.depositAmount;
  if (balance <= 0) {
    return { ok: false, code: "nothing_due", message: "No balance is due for this booking." };
  }

  const now = Date.now();
  const startsAtMs = new Date(booking.startsAt).getTime();
  const expiresAt = clampBalanceExpiresAt(now, startsAtMs);

  const dateStr = new Date(booking.startsAt).toLocaleDateString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const metadata = {
    booking_id: booking.id,
    payment_stage: "balance",
    yacht_slug: yachtSlug,
  };

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: booking.currency.toLowerCase(),
              unit_amount: Math.round(balance * 100),
              product_data: {
                name: `Balance — ${yachtName}, ${dateStr}`,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: booking.customerEmail ?? undefined,
        client_reference_id: booking.id,
        metadata,
        expires_at: expiresAt,
        success_url: `${SITE_CONFIG.url}/booking/${booking.id}?status=success&stage=balance`,
        cancel_url: `${SITE_CONFIG.url}/booking/${booking.id}?status=cancelled&stage=balance`,
        payment_intent_data: {
          metadata,
        },
      },
      { idempotencyKey: `balance-${bookingId}` }
    );

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    const marker = `${BALANCE_LINK_SENT_MARKER} ${new Date().toISOString()}`;
    const notes = booking.notes ? `${booking.notes}\n${marker}` : marker;
    await updateBooking(booking.id, { notes });

    return { ok: true, url: session.url };
  } catch (err) {
    return {
      ok: false,
      code: "stripe_error",
      message: err instanceof Error ? err.message : "Stripe balance checkout session creation failed.",
    };
  }
}

/**
 * Sends a balance-due reminder for a single booking: creates the balance
 * checkout link (which also marks the booking so it isn't picked up
 * again), then emails the customer and notifies admins via Telegram.
 */
export async function sendBalanceReminder(
  bookingId: string
): Promise<{ ok: boolean; skipped?: string }> {
  const data = await getBookingWithExtras(bookingId);
  if (!data) {
    return { ok: false, skipped: "not_found" };
  }

  const { booking, extras, yachtName } = data;

  const checkout = await createBalanceCheckout(bookingId);
  if (!checkout.ok) {
    return { ok: false, skipped: checkout.code };
  }

  const balanceAmount = booking.totalAmount - booking.depositAmount;

  const templateBase = {
    yachtName,
    startsAt: new Date(booking.startsAt),
    hours: booking.hours,
    bonusHours: booking.bonusHours,
    guests: booking.guests,
    extras: extras.map((e) => ({ name: e.name, qty: e.qty, amount: e.amount })),
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    balanceAmount,
    currency: booking.currency,
    bookingId: booking.id,
  };

  const template = bookingBalanceReminder(templateBase);

  // The template signature has no dedicated payment-link field, so append
  // a short paragraph with the link to both the HTML and text bodies.
  const linkParagraph = `<p style="margin:16px 0 0;"><a href="${checkout.url}" style="color:#c9a84c;">Pay the remaining balance</a></p>`;
  const html = template.html.replace("</body>", `${linkParagraph}</body>`);
  const text = `${template.text}\n\nPay the remaining balance: ${checkout.url}`;

  const [emailResult, telegramResult] = await Promise.allSettled([
    booking.customerEmail
      ? sendEmail({ to: booking.customerEmail, subject: template.subject, html, text })
      : Promise.resolve({ ok: false, skipped: true as const }),
    sendTelegram(
      `Balance reminder sent — ${yachtName} (${booking.id})\nBalance: ${booking.currency} ${balanceAmount.toLocaleString("en-US")}\nLink: ${checkout.url}`
    ),
  ]);

  const emailOk = emailResult.status === "fulfilled" && emailResult.value.ok;
  const telegramOk = telegramResult.status === "fulfilled" && telegramResult.value === true;

  return { ok: emailOk || telegramOk };
}

/**
 * Cron entry point: finds all bookings due for a balance reminder and
 * sends one to each, tallying successes/failures. Never throws — each
 * booking's failure is isolated.
 */
export async function runBalanceReminders(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const bookingIds = await findBookingsDueForBalance({});

  let sent = 0;
  let failed = 0;

  for (const id of bookingIds) {
    try {
      const result = await sendBalanceReminder(id);
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (err) {
      console.error(`[balance] failed to send balance reminder for booking ${id}:`, err);
      failed += 1;
    }
  }

  return { processed: bookingIds.length, sent, failed };
}
