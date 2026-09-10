import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { analyzeAdsWithClaude } from "@/lib/ads/mcp-analyzer";
import { fetchPaidSocialSignals } from "@/lib/ads/site-signals";
import { sendAdsTelegramNotification } from "@/lib/ads/telegram-notifier";
import type {
  AdsAnalysisInput,
  AdsRecommendation,
  AdsReport,
  SiteSignals,
} from "@/lib/ads/types";

/**
 * The MCP tool loop runs server-side at Anthropic and routinely takes a couple
 * of minutes on a real account. Vercel's default 10s cap would kill it.
 */
export const maxDuration = 300;

/**
 * POST /api/ads/collect
 *
 * Daily pipeline: Claude drives Meta's Ads MCP server → analysis → Supabase →
 * Telegram. Protected by ANALYTICS_CRON_SECRET, same as the weekly GA job.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.ANALYTICS_CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adAccountId = process.env.META_ADS_ACCOUNT_ID;
  if (!adAccountId) {
    return NextResponse.json(
      { error: "META_ADS_ACCOUNT_ID is not set" },
      { status: 500 },
    );
  }

  const currency = process.env.META_ADS_CURRENCY ?? "USD";
  const supabase = await createServerSupabase();

  // Yesterday — Meta attribution keeps moving for a few hours after midnight,
  // so today is never a complete picture.
  const day = new Date();
  day.setDate(day.getDate() - 1);
  const period = formatDate(day);

  const baselineEnd = new Date(day);
  baselineEnd.setDate(baselineEnd.getDate() - 1);
  const baselineStart = new Date(baselineEnd);
  baselineStart.setDate(baselineStart.getDate() - 6);

  // Upsert so a manual re-run refreshes the day instead of failing on the
  // one-report-per-day unique index.
  const { data: reportRow, error: insertError } = await supabase
    .from("ads_reports")
    .upsert(
      {
        period_start: period,
        period_end: period,
        account_metrics: {} as Record<string, unknown>,
        status: "collecting",
        error_message: null,
      },
      { onConflict: "period_start,period_end" },
    )
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
    // Site-side signals are optional: a GA outage should not lose the ads report.
    let siteSignals: SiteSignals | null = null;
    try {
      siteSignals = await fetchPaidSocialSignals(period, period);
    } catch (gaError) {
      console.error("GA paid social signals failed:", gaError);
    }

    await supabase
      .from("ads_reports")
      .update({
        site_signals: siteSignals as unknown as Record<string, unknown>,
        status: "analyzing",
      })
      .eq("id", reportId);

    const analysisInput: AdsAnalysisInput = {
      period_start: period,
      period_end: period,
      baseline_start: formatDate(baselineStart),
      baseline_end: formatDate(baselineEnd),
      ad_account_id: adAccountId,
      site_signals: siteSignals,
      business_context: {
        name: "Imperial Yachting",
        type: "Luxury yacht charter & management in Dubai",
        conversion_actions: [
          "click_whatsapp",
          "click_contact",
          "click_phone",
          "click_email",
          "submit_inquiry",
        ],
        landing_pages: [
          "/",
          "/fleet",
          "/fleet/[slug]",
          "/services/charter",
          "/destinations",
          "/contact",
        ],
        currency,
      },
    };

    const analysis = await analyzeAdsWithClaude(analysisInput);

    // The column is INTEGER, and the model may omit the key entirely.
    const opportunityScore =
      typeof analysis.opportunity_score === "number"
        ? Math.round(analysis.opportunity_score)
        : null;

    await supabase
      .from("ads_reports")
      .update({
        account_metrics: analysis.account_metrics as unknown as Record<string, unknown>,
        trends: analysis.trends as unknown as Record<string, unknown>,
        entities: analysis.entities as unknown as Record<string, unknown>[],
        summary: analysis.summary,
        opportunity_score: opportunityScore,
        anomalies: analysis.anomalies as unknown as Record<string, unknown>[],
        benchmarks: analysis.benchmarks as unknown as Record<string, unknown>[],
        status: "complete",
      })
      .eq("id", reportId);

    // A re-run of the same day replaces its recommendations rather than
    // stacking a second set on top.
    await supabase.from("ads_recommendations").delete().eq("report_id", reportId);

    const recommendationsToInsert = analysis.recommendations.map((r) => ({
      report_id: reportId,
      title: r.title,
      entity_level: r.entity_level,
      entity_id: r.entity_id,
      entity_name: r.entity_name,
      problem: r.problem,
      action: r.action,
      expected_impact: r.expected_impact,
      priority: r.priority,
      action_type: r.action_type,
      status: "new" as const,
    }));

    const { data: insertedRecommendations } = await supabase
      .from("ads_recommendations")
      .insert(recommendationsToInsert)
      .select();

    try {
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const fullReport: AdsReport = {
          id: reportId,
          period_start: period,
          period_end: period,
          account_metrics: analysis.account_metrics,
          trends: analysis.trends,
          entities: analysis.entities,
          summary: analysis.summary,
          opportunity_score: opportunityScore,
          anomalies: analysis.anomalies,
          benchmarks: analysis.benchmarks,
          site_signals: siteSignals,
          status: "complete",
          error_message: null,
          created_at: new Date().toISOString(),
        };
        await sendAdsTelegramNotification(
          fullReport,
          (insertedRecommendations ?? []) as unknown as AdsRecommendation[],
          currency,
        );
      }
    } catch (telegramError) {
      console.error("Telegram notification failed:", telegramError);
    }

    return NextResponse.json({
      success: true,
      report_id: reportId,
      recommendations_count: analysis.recommendations.length,
      status: "complete",
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("ads_reports")
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
