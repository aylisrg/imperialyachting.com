import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/api/auth";
import { expireStaleQuotesAndHolds } from "@/lib/booking/bookings-db";

export const dynamic = "force-dynamic";

/**
 * Cron entry point (Vercel Cron and/or the GitHub Actions fallback
 * workflow): flips any `quote`/`hold` booking past its expiry into
 * `expired`, as a backstop to Stripe's own `checkout.session.expired`
 * webhook.
 *
 * Auth: accepts either `BOOKING_CRON_SECRET` (used by the GitHub Actions
 * fallback and manual calls) or `CRON_SECRET` (the value Vercel Cron
 * sends as `Authorization: Bearer ${CRON_SECRET}` when that env var is
 * configured on the project).
 */
async function handle(request: Request) {
  const authorized =
    verifyBearer(request, process.env.BOOKING_CRON_SECRET) ||
    verifyBearer(request, process.env.CRON_SECRET);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { expired } = await expireStaleQuotesAndHolds();

  return NextResponse.json({ ok: true, expired });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
