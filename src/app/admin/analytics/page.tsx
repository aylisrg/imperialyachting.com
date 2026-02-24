"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  Loader2,
  Zap,
  Globe,
  FileText,
} from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { MetricsCards } from "./components/MetricsCards";
import { HypothesesList } from "./components/HypothesesList";
import { ReportHistory } from "./components/ReportHistory";
import type {
  AnalyticsReport,
  Hypothesis,
  HypothesisStatus,
  RawMetrics,
  MetricTrend,
  PageInsight,
  TrafficAnalysis,
  QuickWin,
} from "@/lib/analytics/types";

export default function AnalyticsDashboard() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [activeReport, setActiveReport] = useState<AnalyticsReport | null>(null);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/reports?limit=20");
      const data = await res.json();
      setReports(data.reports ?? []);
      setHypotheses(data.latest_hypotheses ?? []);
      if (data.reports?.length > 0) {
        setActiveReport(data.reports[0]);
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const cronSecret = prompt("Enter ANALYTICS_CRON_SECRET to generate report:");
      if (!cronSecret) {
        setGenerating(false);
        return;
      }

      const res = await fetch("/api/analytics/collect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error ?? "Unknown error"}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGenerating(false);
    }
  }

  async function selectReport(report: AnalyticsReport) {
    setActiveReport(report);
    // Load hypotheses for this report
    const res = await fetch(`/api/analytics/hypotheses?report_id=${report.id}`);
    const data = await res.json();
    setHypotheses(data.hypotheses ?? []);
  }

  async function handleStatusChange(id: string, newStatus: HypothesisStatus) {
    const res = await fetch("/api/analytics/hypotheses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      setHypotheses((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: newStatus } : h)),
      );
    }
  }

  const rawMetrics = activeReport?.raw_metrics as unknown as RawMetrics | undefined;
  const trends = activeReport?.trends as unknown as Record<string, MetricTrend> | null;
  const pageInsights = activeReport?.page_insights as unknown as PageInsight[] | null;
  const trafficAnalysis = activeReport?.traffic_analysis as unknown as TrafficAnalysis | null;
  const quickWins = activeReport?.quick_wins as unknown as QuickWin[] | null;

  return (
    <>
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-gold-500" />
              Analytics & Insights
            </h1>
            <p className="mt-1 text-white/50">
              Weekly GA reports with AI-powered conversion optimization hypotheses.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {generating ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : !activeReport ? (
          <EmptyState onGenerate={handleGenerate} generating={generating} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content — 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Metrics */}
              {rawMetrics && rawMetrics.sessions !== undefined && (
                <MetricsCards metrics={rawMetrics} trends={trends} />
              )}

              {/* AI Summary */}
              {activeReport.summary && (
                <div className="bg-navy-800 rounded-xl border border-white/5 p-6">
                  <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gold-500/60" />
                    Weekly Summary
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {activeReport.summary}
                  </p>
                </div>
              )}

              {/* Quick Wins */}
              {quickWins && quickWins.length > 0 && (
                <div className="bg-navy-800 rounded-xl border border-white/5 p-6">
                  <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-gold-500/60" />
                    Quick Wins
                  </h2>
                  <div className="space-y-3">
                    {quickWins.map((qw, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-navy-700/50"
                      >
                        <Zap className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {qw.title}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {qw.description}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                            {qw.effort} effort
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hypotheses */}
              <div>
                <h2 className="font-heading text-lg font-bold text-white mb-4">
                  Hypotheses & Recommendations
                </h2>
                <HypothesesList
                  hypotheses={hypotheses}
                  onStatusChange={handleStatusChange}
                />
              </div>

              {/* Page Insights */}
              {pageInsights && pageInsights.length > 0 && (
                <div className="bg-navy-800 rounded-xl border border-white/5 p-6">
                  <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-gold-500/60" />
                    Page Insights
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 text-xs uppercase tracking-wider">
                          <th className="text-left pb-3">Page</th>
                          <th className="text-right pb-3">Views</th>
                          <th className="text-right pb-3">Bounce</th>
                          <th className="text-right pb-3">Avg Duration</th>
                          <th className="text-left pb-3 pl-4">Insight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {pageInsights.map((pi, i) => (
                          <tr key={i}>
                            <td className="py-3 text-white/70 font-mono text-xs">
                              {pi.page}
                            </td>
                            <td className="py-3 text-right text-white/60">
                              {pi.views.toLocaleString()}
                            </td>
                            <td className="py-3 text-right text-white/60">
                              {(pi.bounce_rate * 100).toFixed(1)}%
                            </td>
                            <td className="py-3 text-right text-white/60">
                              {Math.round(pi.avg_duration)}s
                            </td>
                            <td className="py-3 text-white/50 pl-4 text-xs">
                              {pi.insight}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Traffic Analysis */}
              {trafficAnalysis && (
                <div className="bg-navy-800 rounded-xl border border-white/5 p-6">
                  <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-gold-500/60" />
                    Traffic Analysis
                  </h2>
                  <p className="text-sm text-white/60 mb-4">
                    {trafficAnalysis.summary}
                  </p>
                  {trafficAnalysis.top_sources.length > 0 && (
                    <div className="space-y-2">
                      {trafficAnalysis.top_sources.map((src, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-navy-700/50"
                        >
                          <div>
                            <span className="text-sm text-white/70">
                              {src.source}
                            </span>
                            <span className="text-xs text-white/30 ml-2">
                              / {src.medium}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-white/60">
                              {src.sessions.toLocaleString()} sessions
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar — 1 column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  Report History
                </h3>
                <ReportHistory
                  reports={reports}
                  activeReportId={activeReport?.id ?? null}
                  onSelect={selectReport}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState({
  onGenerate,
  generating,
}: {
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
      <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
      <h2 className="font-heading text-xl font-bold text-white/50">
        No analytics reports yet
      </h2>
      <p className="mt-2 text-white/30 max-w-md mx-auto">
        Generate your first weekly report to see AI-powered insights and
        conversion optimization hypotheses.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-50"
      >
        {generating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
        Generate First Report
      </button>
    </div>
  );
}
