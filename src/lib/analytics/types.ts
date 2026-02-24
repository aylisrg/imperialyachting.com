/* ── Analytics Report types ────────────────────────────────────── */

export interface RawMetrics {
  sessions: number;
  users: number;
  new_users: number;
  bounce_rate: number;
  avg_session_duration: number;
  page_views: number;
  whatsapp_clicks: number;
  contact_clicks: number;
  inquiry_submissions: number;
  yacht_clicks: number;
  phone_clicks: number;
  email_clicks: number;
}

export interface MetricTrend {
  value: number;
  previous_value: number;
  change_percent: number;
  direction: "up" | "down" | "flat";
}

export interface PageInsight {
  page: string;
  views: number;
  bounce_rate: number;
  avg_duration: number;
  insight: string;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  conversion_rate: number;
}

export interface TrafficAnalysis {
  summary: string;
  top_sources: TrafficSource[];
}

export type HypothesisPriority = "high" | "medium" | "low";
export type HypothesisCategory = "ux" | "content" | "technical" | "marketing";
export type HypothesisStatus = "new" | "accepted" | "rejected" | "implemented" | "tested";
export type ReportStatus = "collecting" | "analyzing" | "complete" | "error";

export interface Hypothesis {
  id: string;
  report_id: string;
  title: string;
  problem: string;
  solution: string;
  expected_impact: string;
  priority: HypothesisPriority;
  category: HypothesisCategory;
  status: HypothesisStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuickWin {
  title: string;
  description: string;
  effort: "low" | "medium";
}

export interface AnalyticsReport {
  id: string;
  period_start: string;
  period_end: string;
  raw_metrics: RawMetrics;
  trends: Record<string, MetricTrend> | null;
  summary: string | null;
  page_insights: PageInsight[] | null;
  traffic_analysis: TrafficAnalysis | null;
  quick_wins: QuickWin[] | null;
  status: ReportStatus;
  error_message: string | null;
  created_at: string;
}

/* ── GA Data API response shapes ──────────────────────────────── */

export interface GAMetricsResponse {
  sessions: number;
  totalUsers: number;
  newUsers: number;
  bounceRate: number;
  averageSessionDuration: number;
  screenPageViews: number;
}

export interface GAPageData {
  pagePath: string;
  screenPageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export interface GAEventData {
  eventName: string;
  eventCount: number;
}

export interface GATrafficData {
  sessionSource: string;
  sessionMedium: string;
  sessions: number;
}

export interface GACollectedData {
  overview: GAMetricsResponse;
  pages: GAPageData[];
  events: GAEventData[];
  traffic: GATrafficData[];
  device_split: { category: string; sessions: number }[];
  country_split: { country: string; sessions: number }[];
}

/* ── Claude analysis prompt input ─────────────────────────────── */

export interface AnalysisInput {
  current_week: GACollectedData;
  previous_week: GACollectedData | null;
  site_context: {
    name: string;
    type: string;
    conversion_actions: string[];
    pages: string[];
  };
}

export interface AnalysisOutput {
  summary: string;
  trends: Record<string, MetricTrend>;
  hypotheses: Omit<Hypothesis, "id" | "report_id" | "status" | "notes" | "created_at" | "updated_at">[];
  quick_wins: QuickWin[];
  page_insights: PageInsight[];
  traffic_analysis: TrafficAnalysis;
}
