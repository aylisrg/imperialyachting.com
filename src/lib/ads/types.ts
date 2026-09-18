import type { MetricTrend } from "@/lib/analytics/types";

export type { MetricTrend };

/* ── Meta Ads metrics ──────────────────────────────────────────── */

export interface AdMetrics {
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  /** Results for the campaign objective (leads, messaging conversations, ...). */
  results: number;
  cost_per_result: number | null;
}

export type AdEntityLevel = "account" | "campaign" | "adset" | "ad";

/**
 * A verdict is what we decided to do with the entity, not just how it did.
 * `scale` and `pause` are the two that move money.
 */
export type AdVerdict = "scale" | "keep" | "watch" | "fix" | "pause";

export interface AdEntity {
  level: AdEntityLevel;
  id: string;
  name: string;
  status: string;
  metrics: AdMetrics;
  verdict: AdVerdict;
  reasoning: string;
}

/* ── Recommendations ───────────────────────────────────────────── */

export type AdsPriority = "high" | "medium" | "low";
export type AdsActionType =
  | "budget"
  | "creative"
  | "targeting"
  | "bidding"
  | "landing_page"
  | "tracking"
  | "structure";
export type AdsRecommendationStatus =
  | "new"
  | "accepted"
  | "rejected"
  | "applied"
  | "tested";
export type AdsReportStatus = "collecting" | "analyzing" | "complete" | "error";

export interface AdsRecommendation {
  id: string;
  report_id: string;
  title: string;
  entity_level: AdEntityLevel;
  entity_id: string | null;
  entity_name: string | null;
  problem: string;
  action: string;
  expected_impact: string | null;
  priority: AdsPriority;
  action_type: AdsActionType;
  status: AdsRecommendationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Signals pulled from Meta's own optimization tools ─────────── */

export interface AdsAnomaly {
  entity_name: string;
  metric: string;
  description: string;
  severity: AdsPriority;
}

export interface AdsBenchmark {
  metric: string;
  our_value: number;
  benchmark_value: number;
  verdict: "above" | "at" | "below";
}

/**
 * Meta only sees on-platform events. Every real lead lands in WhatsApp, so the
 * GA4 side is the only place where "did this ad actually produce an enquiry"
 * can be answered.
 */
export interface SiteSignals {
  paid_social_sessions: number;
  whatsapp_clicks: number;
  contact_clicks: number;
  inquiry_submissions: number;
  /** True when at least one ad landing URL carries utm_source/utm_campaign. */
  utm_tagging_detected: boolean;
}

/* ── Report ────────────────────────────────────────────────────── */

export interface AdsReport {
  id: string;
  period_start: string;
  period_end: string;
  account_metrics: AdMetrics;
  trends: Record<string, MetricTrend> | null;
  entities: AdEntity[] | null;
  summary: string | null;
  opportunity_score: number | null;
  anomalies: AdsAnomaly[] | null;
  benchmarks: AdsBenchmark[] | null;
  site_signals: SiteSignals | null;
  status: AdsReportStatus;
  error_message: string | null;
  created_at: string;
}

/* ── Analyzer contract ─────────────────────────────────────────── */

export interface AdsAnalysisInput {
  /** Day being analysed, YYYY-MM-DD. */
  period_start: string;
  period_end: string;
  /** Comparison window, usually the 7 days before the analysed day. */
  baseline_start: string;
  baseline_end: string;
  ad_account_id: string;
  site_signals: SiteSignals | null;
  business_context: {
    name: string;
    type: string;
    conversion_actions: string[];
    landing_pages: string[];
    currency: string;
  };
}

export interface AdsAnalysisOutput {
  summary: string;
  account_metrics: AdMetrics;
  trends: Record<string, MetricTrend>;
  entities: AdEntity[];
  opportunity_score: number | null;
  anomalies: AdsAnomaly[];
  benchmarks: AdsBenchmark[];
  recommendations: Omit<
    AdsRecommendation,
    "id" | "report_id" | "status" | "notes" | "created_at" | "updated_at"
  >[];
}
