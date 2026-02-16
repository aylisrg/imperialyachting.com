import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — DB health check endpoint.
 *
 * Returns the count of yachts and destinations in the database.
 * Use this after deployments to verify the DB is reachable and populated.
 *
 * Response:
 *   200 — DB is reachable and has yacht data
 *   503 — DB is unreachable or query failed
 *   500 — Unexpected error (missing env vars, etc.)
 */
export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const [yachtsResult, destinationsResult] = await Promise.all([
      supabase.from("yachts").select("*", { count: "exact", head: true }),
      supabase.from("destinations").select("*", { count: "exact", head: true }),
    ]);

    if (yachtsResult.error || destinationsResult.error) {
      return NextResponse.json(
        {
          status: "error",
          yachts: yachtsResult.error ? { error: yachtsResult.error.message } : { count: yachtsResult.count },
          destinations: destinationsResult.error
            ? { error: destinationsResult.error.message }
            : { count: destinationsResult.count },
        },
        { status: 503 }
      );
    }

    const yachtCount = yachtsResult.count ?? 0;
    const destinationCount = destinationsResult.count ?? 0;

    return NextResponse.json({
      status: yachtCount > 0 ? "healthy" : "warning",
      yachts: { count: yachtCount },
      destinations: { count: destinationCount },
      ...(yachtCount === 0 && {
        warning: "Yacht table is empty — fleet pages will show no content. Run supabase/seed.sql or add yachts via /admin.",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
