import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/analytics/reports
 * Returns list of analytics reports, most recent first.
 * Query params: ?limit=10&offset=0
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const supabase = await createServerSupabase();

  const { data: reports, error, count } = await supabase
    .from("analytics_reports")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch hypotheses for the most recent report
  let hypotheses = null;
  if (reports && reports.length > 0) {
    const firstReport = reports[0] as { id: string };
    const { data } = await supabase
      .from("analytics_hypotheses")
      .select("*")
      .eq("report_id", firstReport.id)
      .order("created_at", { ascending: true });
    hypotheses = data;
  }

  return NextResponse.json({
    reports,
    latest_hypotheses: hypotheses,
    total: count,
  });
}
