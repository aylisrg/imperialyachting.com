"use client";

import { Calendar, CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import type { AnalyticsReport } from "@/lib/analytics/types";

interface ReportHistoryProps {
  reports: AnalyticsReport[];
  activeReportId: string | null;
  onSelect: (report: AnalyticsReport) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  complete: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  analyzing: <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />,
  collecting: <Clock className="w-4 h-4 text-blue-400" />,
};

export function ReportHistory({ reports, activeReportId, onSelect }: ReportHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-white/30">
        <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No reports yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <button
          key={report.id}
          onClick={() => onSelect(report)}
          className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
            activeReportId === report.id
              ? "bg-gold-500/10 border-gold-500/20"
              : "bg-navy-800 border-white/5 hover:border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              {report.period_start} — {report.period_end}
            </span>
            {statusIcons[report.status]}
          </div>
          {report.status === "complete" && report.summary && (
            <p className="text-xs text-white/40 mt-1 line-clamp-2">
              {report.summary}
            </p>
          )}
          {report.status === "error" && report.error_message && (
            <p className="text-xs text-red-400/60 mt-1 truncate">
              {report.error_message}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
