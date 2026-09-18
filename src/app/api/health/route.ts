import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/api/auth";
import { runHealthChecks, DB_EMPTY_WARNING } from "@/lib/health/checks";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — service health-check endpoint.
 *
 * Shallow mode (default): public. Reports DB reachability/counts (as
 * before) plus, for every other integration (Supabase admin client,
 * Stripe, Google Calendar, email, Telegram, IndexNow, the MCP server),
 * only whether it is configured — no secrets, no outbound calls to paid
 * or external APIs.
 *
 * Deep mode (`?deep=1`): requires a valid `Authorization: Bearer <secret>`
 * header (BOOKING_CRON_SECRET or ANALYTICS_CRON_SECRET) because it
 * exercises each configured integration with a real, lightweight call
 * (e.g. a Stripe balance lookup) — that costs money/quota and must not be
 * publicly triggerable.
 *
 * Response:
 *   200 — status is "healthy" or "warning"
 *   401 — deep mode requested without a valid bearer token
 *   503 — status is "error" (e.g. the database is unreachable)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deep = url.searchParams.get("deep") === "1";

  if (deep) {
    const expected = process.env.BOOKING_CRON_SECRET ?? process.env.ANALYTICS_CRON_SECRET;
    if (!verifyBearer(request, expected)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const report = await runHealthChecks({ deep, origin: url.origin });

  const yachtCount = report.meta?.yachts ?? 0;
  const destinationCount = report.meta?.destinations ?? 0;
  const dbErrored = !report.checks.database?.ok && report.checks.database?.detail !== DB_EMPTY_WARNING;

  const httpStatus = report.status === "error" ? 503 : 200;

  return NextResponse.json(
    {
      status: report.status,
      yachts: dbErrored
        ? { error: report.checks.database?.detail }
        : { count: yachtCount },
      destinations: dbErrored
        ? { error: report.checks.database?.detail }
        : { count: destinationCount },
      ...(!dbErrored && yachtCount === 0 && { warning: DB_EMPTY_WARNING }),
      checks: report.checks,
      timestamp: report.timestamp,
    },
    { status: httpStatus }
  );
}
