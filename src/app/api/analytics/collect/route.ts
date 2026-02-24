import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchWeeklyData } from "@/lib/analytics/ga-client";
import { analyzeWithClaude } from "@/lib/analytics/claude-analyzer";
import { sendTelegramNotification } from "@/lib/analytics/telegram-notifier";
import type { RawMetrics, AnalysisInput, AnalyticsReport, Hypothesis } from "@/lib/analytics/types";

/**
 * POST /api/analytics/collect
 *
 * Main pipeline: Collect GA data → Analyze with Claude → Store in Supabase → Notify via Telegram.
 * Protected by ANALYTICS_CRON_SECRET bearer token.
 */
export async function POST(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.ANALYTICS_CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabase();

  // Calculate date range (last 7 days)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // yesterday
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // 7 days total

  const periodStart = formatDate(startDate);
  const periodEnd = formatDate(endDate);

  // Step 1: Create report record with "collecting" status
  const { data: reportRow, error: insertError } = await supabase
    .from("analytics_reports")
    .insert({
      period_start: periodStart,
      period_end: periodEnd,
      raw_metrics: {} as Record<string, unknown>,
      status: "collecting",
    })
    .select()
    .single();

  if (insertError || !reportRow) {
    return NextResponse.json(
      { error: "Failed to create report", details: insertError?.message },
      { status: 500 },
    );
  }

  const reportId = (reportRow as { id: string }).id;

  try {
    // Step 2: Fetch current week data from GA
    const currentWeekData = await fetchWeeklyData(periodStart, periodEnd);

    // Fetch previous week data for comparison
    const prevEnd = new Date(startDate);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 6);

    let previousWeekData = null;
    try {
      previousWeekData = await fetchWeeklyData(
        formatDate(prevStart),
        formatDate(prevEnd),
      );
    } catch {
      // Previous week data is optional
    }

    // Build raw metrics from GA data
    const eventMap = Object.fromEntries(
      currentWeekData.events.map((e) => [e.eventName, e.eventCount]),
    );

    const rawMetrics: RawMetrics = {
      sessions: currentWeekData.overview.sessions,
      users: currentWeekData.overview.totalUsers,
      new_users: currentWeekData.overview.newUsers,
      bounce_rate: currentWeekData.overview.bounceRate,
      avg_session_duration: currentWeekData.overview.averageSessionDuration,
      page_views: currentWeekData.overview.screenPageViews,
      whatsapp_clicks: eventMap["click_whatsapp"] ?? 0,
      contact_clicks: eventMap["click_contact"] ?? 0,
      inquiry_submissions: eventMap["submit_inquiry"] ?? 0,
      yacht_clicks: eventMap["click_yacht"] ?? 0,
      phone_clicks: eventMap["click_phone"] ?? 0,
      email_clicks: eventMap["click_email"] ?? 0,
    };

    // Update report with raw metrics, set status to analyzing
    await supabase
      .from("analytics_reports")
      .update({
        raw_metrics: rawMetrics as unknown as Record<string, unknown>,
        status: "analyzing",
      })
      .eq("id", reportId);

    // Step 3: Analyze with Claude
    const analysisInput: AnalysisInput = {
      current_week: currentWeekData,
      previous_week: previousWeekData,
      site_context: {
        name: "Imperial Yachting",
        type: "Luxury yacht charter & management in Dubai",
        conversion_actions: [
          "click_whatsapp",
          "click_contact",
          "click_phone",
          "click_email",
          "submit_inquiry",
          "click_yacht",
        ],
        pages: [
          "/",
          "/fleet",
          "/fleet/[slug]",
          "/services",
          "/services/charter",
          "/destinations",
          "/contact",
          "/about",
        ],
      },
    };

    const analysis = await analyzeWithClaude(analysisInput);

    // Step 4: Update report with analysis results
    await supabase
      .from("analytics_reports")
      .update({
        summary: analysis.summary,
        trends: analysis.trends as unknown as Record<string, unknown>,
        page_insights: analysis.page_insights as unknown as Record<string, unknown>[],
        traffic_analysis: analysis.traffic_analysis as unknown as Record<string, unknown>,
        quick_wins: analysis.quick_wins as unknown as Record<string, unknown>[],
        status: "complete",
      })
      .eq("id", reportId);

    // Step 5: Insert hypotheses
    const hypothesesToInsert = analysis.hypotheses.map((h) => ({
      report_id: reportId,
      title: h.title,
      problem: h.problem,
      solution: h.solution,
      expected_impact: h.expected_impact,
      priority: h.priority,
      category: h.category,
      status: "new" as const,
    }));

    const { data: insertedHypotheses } = await supabase
      .from("analytics_hypotheses")
      .insert(hypothesesToInsert)
      .select();

    // Step 6: Send Telegram notification (optional, don't fail on error)
    try {
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const fullReport: AnalyticsReport = {
          id: reportId,
          period_start: periodStart,
          period_end: periodEnd,
          raw_metrics: rawMetrics,
          trends: analysis.trends,
          summary: analysis.summary,
          page_insights: analysis.page_insights,
          traffic_analysis: analysis.traffic_analysis,
          quick_wins: analysis.quick_wins,
          status: "complete",
          error_message: null,
          created_at: new Date().toISOString(),
        };
        await sendTelegramNotification(
          fullReport,
          (insertedHypotheses ?? []) as unknown as Hypothesis[],
        );
      }
    } catch (telegramError) {
      console.error("Telegram notification failed:", telegramError);
    }

    return NextResponse.json({
      success: true,
      report_id: reportId,
      hypotheses_count: analysis.hypotheses.length,
      status: "complete",
    });
  } catch (err) {
    // Update report with error status
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("analytics_reports")
      .update({ status: "error", error_message: errorMessage })
      .eq("id", reportId);

    return NextResponse.json(
      { error: "Pipeline failed", details: errorMessage, report_id: reportId },
      { status: 500 },
    );
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
