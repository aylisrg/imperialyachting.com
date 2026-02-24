import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendTelegramNotification } from "@/lib/analytics/telegram-notifier";
import type { AnalyticsReport, Hypothesis } from "@/lib/analytics/types";

/**
 * POST /api/analytics/notify
 * Send Telegram notification for a specific report.
 * Body: { report_id: string }
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.ANALYTICS_CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { report_id } = await request.json();

  if (!report_id) {
    return NextResponse.json({ error: "report_id is required" }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  const { data: report, error: reportError } = await supabase
    .from("analytics_reports")
    .select("*")
    .eq("id", report_id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const { data: hypotheses } = await supabase
    .from("analytics_hypotheses")
    .select("*")
    .eq("report_id", report_id)
    .order("created_at", { ascending: true });

  await sendTelegramNotification(
    report as unknown as AnalyticsReport,
    (hypotheses ?? []) as unknown as Hypothesis[],
  );

  return NextResponse.json({ success: true });
}
