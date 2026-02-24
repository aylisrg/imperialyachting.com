"use client";

import {
  Users,
  Eye,
  MousePointerClick,
  MessageCircle,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Minus,
  Ship,
} from "lucide-react";
import type { RawMetrics, MetricTrend } from "@/lib/analytics/types";

interface MetricsCardsProps {
  metrics: RawMetrics;
  trends: Record<string, MetricTrend> | null;
}

interface CardDef {
  label: string;
  key: keyof RawMetrics;
  trendKey: string;
  icon: React.ReactNode;
  format: (v: number) => string;
  invertTrend?: boolean; // true for bounce_rate where down is good
}

const cards: CardDef[] = [
  {
    label: "Sessions",
    key: "sessions",
    trendKey: "sessions",
    icon: <Eye className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
  {
    label: "Users",
    key: "users",
    trendKey: "users",
    icon: <Users className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
  {
    label: "Bounce Rate",
    key: "bounce_rate",
    trendKey: "bounce_rate",
    icon: <MousePointerClick className="w-5 h-5" />,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    invertTrend: true,
  },
  {
    label: "WhatsApp Clicks",
    key: "whatsapp_clicks",
    trendKey: "whatsapp_clicks",
    icon: <MessageCircle className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
  {
    label: "Phone Clicks",
    key: "phone_clicks",
    trendKey: "phone_clicks",
    icon: <Phone className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
  {
    label: "Email Clicks",
    key: "email_clicks",
    trendKey: "email_clicks",
    icon: <Mail className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
  {
    label: "Yacht Clicks",
    key: "yacht_clicks",
    trendKey: "yacht_clicks",
    icon: <Ship className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
  {
    label: "Inquiries",
    key: "inquiry_submissions",
    trendKey: "contact_clicks",
    icon: <Mail className="w-5 h-5" />,
    format: (v) => v.toLocaleString(),
  },
];

export function MetricsCards({ metrics, trends }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const value = metrics[card.key];
        const trend = trends?.[card.trendKey];

        return (
          <div
            key={card.key}
            className="bg-navy-800 rounded-xl border border-white/5 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                {card.label}
              </span>
              <span className="text-gold-500/60">{card.icon}</span>
            </div>
            <p className="font-heading text-2xl font-bold text-white">
              {card.format(value)}
            </p>
            {trend && (
              <TrendBadge
                change={trend.change_percent}
                direction={trend.direction}
                invert={card.invertTrend}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrendBadge({
  change,
  direction,
  invert,
}: {
  change: number;
  direction: string;
  invert?: boolean;
}) {
  const isPositive = invert
    ? direction === "down"
    : direction === "up";

  const Icon =
    direction === "up"
      ? TrendingUp
      : direction === "down"
        ? TrendingDown
        : Minus;

  const colorClass = direction === "flat"
    ? "text-white/30"
    : isPositive
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <div className={`flex items-center gap-1 mt-2 text-xs ${colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </span>
      <span className="text-white/20 ml-1">vs last week</span>
    </div>
  );
}
