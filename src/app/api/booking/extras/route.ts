import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { fetchActiveExtras } from "@/lib/booking/extras-db";

export const dynamic = "force-dynamic";

/**
 * GET /api/booking/extras
 * Public catalogue of active add-on extras, for the booking widget.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`booking-extras:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again later.");
  }

  const extras = await fetchActiveExtras();
  return NextResponse.json({ extras });
}
