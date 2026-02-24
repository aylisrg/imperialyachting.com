"use client";

import { useState } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Rocket,
  FlaskConical,
  Loader2,
} from "lucide-react";
import type { Hypothesis, HypothesisStatus } from "@/lib/analytics/types";

interface HypothesesListProps {
  hypotheses: Hypothesis[];
  onStatusChange: (id: string, status: HypothesisStatus) => Promise<void>;
}

const statusConfig: Record<
  HypothesisStatus,
  { label: string; color: string; bgColor: string }
> = {
  new: { label: "New", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  accepted: { label: "Accepted", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "Rejected", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  implemented: { label: "Implemented", color: "text-gold-400", bgColor: "bg-gold-500/10 border-gold-500/20" },
  tested: { label: "Tested", color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  medium: { label: "Medium", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  low: { label: "Low", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

const categoryConfig: Record<string, string> = {
  ux: "UX",
  content: "Content",
  technical: "Technical",
  marketing: "Marketing",
};

const statusTransitions: Record<HypothesisStatus, HypothesisStatus[]> = {
  new: ["accepted", "rejected"],
  accepted: ["implemented", "rejected"],
  rejected: ["new"],
  implemented: ["tested"],
  tested: [],
};

export function HypothesesList({ hypotheses, onStatusChange }: HypothesesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<HypothesisStatus | "all">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = filter === "all"
    ? hypotheses
    : hypotheses.filter((h) => h.status === filter);

  async function handleStatusChange(id: string, newStatus: HypothesisStatus) {
    setLoadingId(id);
    try {
      await onStatusChange(id, newStatus);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "new", "accepted", "implemented", "tested", "rejected"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "bg-navy-700 text-white/50 border border-white/5 hover:text-white/70"
              }`}
            >
              {s === "all" ? "All" : statusConfig[s].label}
              {s !== "all" && (
                <span className="ml-1.5 text-white/30">
                  {hypotheses.filter((h) => h.status === s).length}
                </span>
              )}
            </button>
          ),
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>No hypotheses match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => {
            const isExpanded = expandedId === h.id;
            const isLoading = loadingId === h.id;
            const nextStatuses = statusTransitions[h.status as HypothesisStatus] ?? [];

            return (
              <div
                key={h.id}
                className="bg-navy-800 rounded-xl border border-white/5 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : h.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <Lightbulb className="w-5 h-5 text-gold-500/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-white truncate">
                      {h.title}
                    </p>
                    <p className="text-sm text-white/40 truncate mt-0.5">
                      {h.problem}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${priorityConfig[h.priority]?.color}`}
                    >
                      {priorityConfig[h.priority]?.label}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/5 text-white/40 border border-white/10">
                      {categoryConfig[h.category] ?? h.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusConfig[h.status as HypothesisStatus]?.bgColor} ${statusConfig[h.status as HypothesisStatus]?.color}`}
                    >
                      {statusConfig[h.status as HypothesisStatus]?.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                    <div>
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-1">
                        Problem
                      </h4>
                      <p className="text-sm text-white/70">{h.problem}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-1">
                        Solution
                      </h4>
                      <p className="text-sm text-white/70">{h.solution}</p>
                    </div>
                    {h.expected_impact && (
                      <div>
                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-1">
                          Expected Impact
                        </h4>
                        <p className="text-sm text-white/70">
                          {h.expected_impact}
                        </p>
                      </div>
                    )}
                    {h.notes && (
                      <div>
                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-1">
                          Notes
                        </h4>
                        <p className="text-sm text-white/50 italic">{h.notes}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    {nextStatuses.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {nextStatuses.map((ns) => (
                          <button
                            key={ns}
                            onClick={() => handleStatusChange(h.id, ns)}
                            disabled={isLoading}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              isLoading
                                ? "opacity-50"
                                : statusConfig[ns].bgColor
                            } ${statusConfig[ns].color}`}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : ns === "accepted" ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : ns === "rejected" ? (
                              <X className="w-3.5 h-3.5" />
                            ) : ns === "implemented" ? (
                              <Rocket className="w-3.5 h-3.5" />
                            ) : ns === "tested" ? (
                              <FlaskConical className="w-3.5 h-3.5" />
                            ) : null}
                            {statusConfig[ns].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
