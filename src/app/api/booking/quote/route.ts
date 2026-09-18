import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { parseJsonBody } from "@/lib/api/validate";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { createQuote } from "@/lib/booking/quotes";
import { MAX_HOURS } from "@/lib/booking/constants";

export const dynamic = "force-dynamic";

const extraSchema = z.object({
  slug: z.string().min(1),
  qty: z.number().int().min(1),
});

const bodySchema = z.object({
  yachtSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  startHour: z.number().min(0).max(23),
  hours: z.number().int().min(1).max(MAX_HOURS),
  guests: z.number().int().min(1),
  extras: z.array(extraSchema).optional(),
});

/**
 * POST /api/booking/quote
 * Public, rate-limited wrapper over createQuote(). Persists a `quote`
 * status booking row (TTL `QUOTE_TTL_MINUTES`) that `/api/booking/checkout`
 * can later turn into a Stripe Checkout Session.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`booking-quote:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again later.");
  }

  const parsed = await parseJsonBody(request, bodySchema);
  if (!parsed.ok) return parsed.response;

  const result = await createQuote({ ...parsed.data, source: "web" });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.code,
        message: result.message,
        ...(result.errors ? { errors: result.errors } : {}),
        ...(result.conflicts ? { conflicts: result.conflicts } : {}),
      },
      { status: 400 }
    );
  }

  return NextResponse.json(result);
}
