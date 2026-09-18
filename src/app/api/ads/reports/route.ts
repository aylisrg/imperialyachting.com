import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { verifyBearer } from "@/lib/api/auth";

/**
 * Allows either the analytics cron secret (bearer token) or a logged-in
 * Supabase user (the admin dashboard, which sends cookies same-origin).
 * Ad spend, campaign names and recommendations are not public data.
 */
async function isAuthorized(request: Request): Promise<boolean> {
  if (verifyBearer(request, process.env.ANALYTICS_CRON_SECRET)) return true;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

/**
 * GET /api/ads/reports
 * Returns daily ads reports, most recent first, with the latest report's
 * recommendations. Query params: ?limit=10&offset=0
 */
export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const supabase = await createServerSupabase();

  const { data: reports, error, count } = await supabase
    .from("ads_reports")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let recommendations = null;
  if (reports && reports.length > 0) {
    const firstReport = reports[0] as { id: string };
    const { data } = await supabase
      .from("ads_recommendations")
      .select("*")
      .eq("report_id", firstReport.id)
      .order("created_at", { ascending: true });
    recommendations = data;
  }

  return NextResponse.json({
    reports,
    latest_recommendations: recommendations,
    total: count,
  });
}
