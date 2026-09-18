import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/booking/stripe";
import { jsonError } from "@/lib/api/errors";
import {
  markStripeEventProcessed,
  handleCheckoutCompleted,
  handleCheckoutExpired,
  handleAsyncPaymentFailed,
} from "@/lib/booking/fulfilment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/stripe/webhook
 *
 * Verifies the `stripe-signature` header against the raw request body,
 * records the event id for idempotency, then dispatches to the booking
 * fulfilment logic in `src/lib/booking/fulfilment.ts`.
 *
 * Responds 200 once the event has been verified and recorded, even if a
 * downstream fulfilment step logs a failure — Stripe retries non-2xx
 * responses, and a booking that can never recover shouldn't be retried
 * forever. The one exception is a database that can't be reached to record
 * the event: that returns 500 so Stripe retries once it's back.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await request.text();

  if (!signature || !secret) {
    console.error("[stripe webhook] missing stripe-signature header or STRIPE_WEBHOOK_SECRET");
    return jsonError(400, "invalid_signature", "Missing signature or webhook secret.");
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return jsonError(400, "invalid_signature", err instanceof Error ? err.message : "Invalid signature.");
  }

  let isNewEvent: boolean;
  try {
    isNewEvent = await markStripeEventProcessed(event.id, event.type);
  } catch (err) {
    console.error("[stripe webhook] failed to record event (database unreachable?):", err);
    return jsonError(500, "db_unreachable", "Could not record the webhook event.");
  }

  if (!isNewEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(session);
        break;
      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(session);
        break;
      default:
        // Event types we don't act on (e.g. other Checkout Session or
        // unrelated account events) are acknowledged and ignored.
        break;
    }
  } catch (err) {
    // Fulfilment handlers are documented to never throw, but this is a
    // last-resort guard: the event is already recorded, so Stripe must not
    // retry an event we've already accepted.
    console.error(`[stripe webhook] fulfilment handler threw for event ${event.id} (${event.type}):`, err);
  }

  return NextResponse.json({ received: true });
}

/** Stripe never sends GET; this exists to give a clear response instead of a 404. */
export async function GET() {
  return jsonError(405, "method_not_allowed", "Use POST for Stripe webhooks.");
}
