import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { parseJsonBody } from "@/lib/api/validate";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { createCheckout } from "@/lib/booking/checkout";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  quoteId: z.string().min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().min(1).email(),
    phone: z.string().optional(),
  }),
  acceptTerms: z.literal(true),
});

/**
 * POST /api/booking/checkout
 * Public, rate-limited wrapper over createCheckout(). Turns a `quote`
 * booking into a Stripe Checkout Session for the 50% deposit.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`booking-checkout:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again later.");
  }

  const parsed = await parseJsonBody(request, bodySchema);
  if (!parsed.ok) return parsed.response;

  const { quoteId, customer } = parsed.data;

  const result = await createCheckout({ quoteId, customer });

  if (!result.ok) {
    return NextResponse.json({ error: result.code, message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    checkoutUrl: result.checkoutUrl,
    bookingId: result.bookingId,
    expiresAt: result.expiresAt,
  });
}
