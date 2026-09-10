import type { AdsRecommendation, AdsReport, AdVerdict } from "./types";

const SITE_URL = "https://imperialyachting.com";

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set");
  }
  return { token, chatId };
}

function formatTrend(change: number): string {
  if (change === 0) return "—";
  const arrow = change > 0 ? "↑" : "↓";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% ${arrow}`;
}

function priorityEmoji(priority: string): string {
  switch (priority) {
    case "high": return "🔴";
    case "medium": return "🟡";
    case "low": return "🟢";
    default: return "⚪";
  }
}

function verdictEmoji(verdict: AdVerdict): string {
  switch (verdict) {
    case "scale": return "🚀";
    case "keep": return "✅";
    case "watch": return "👀";
    case "fix": return "🔧";
    case "pause": return "⏸️";
    default: return "⚪";
  }
}

function money(value: number, currency: string): string {
  return `${value.toFixed(2)} ${currency}`;
}

export function buildAdsTelegramMessage(
  report: AdsReport,
  recommendations: AdsRecommendation[],
  currency = "USD",
): string {
  const m = report.account_metrics;
  const t = report.trends ?? {};

  const lines: string[] = [
    `📣 *Daily Ads Report*`,
    `Imperial Yachting | ${report.period_start}`,
    "",
    `💰 *Spend & Delivery:*`,
    `• Spend: ${money(m.spend, currency)} ${t.spend ? formatTrend(t.spend.change_percent) : ""}`,
    `• Impressions: ${m.impressions.toLocaleString()} ${t.impressions ? formatTrend(t.impressions.change_percent) : ""}`,
    `• Clicks: ${m.clicks.toLocaleString()} ${t.clicks ? formatTrend(t.clicks.change_percent) : ""}`,
    `• CTR: ${m.ctr.toFixed(2)}% ${t.ctr ? formatTrend(t.ctr.change_percent) : ""}`,
    `• CPC: ${money(m.cpc, currency)} ${t.cpc ? formatTrend(t.cpc.change_percent) : ""}`,
    `• Results: ${m.results} ${t.results ? formatTrend(t.results.change_percent) : ""}`,
  ];

  if (m.cost_per_result !== null) {
    lines.push(
      `• Cost per result: ${money(m.cost_per_result, currency)} ${t.cost_per_result ? formatTrend(t.cost_per_result.change_percent) : ""}`,
    );
  }

  // Meta cannot see WhatsApp enquiries, so the site side is the honest read.
  if (report.site_signals) {
    const s = report.site_signals;
    lines.push(
      "",
      `📲 *On the site (paid social):*`,
      `• Sessions: ${s.paid_social_sessions.toLocaleString()}`,
      `• WhatsApp clicks: ${s.whatsapp_clicks}`,
      `• Enquiries: ${s.inquiry_submissions}`,
    );
    if (!s.utm_tagging_detected) {
      lines.push(`⚠️ No UTM tags detected — ad-level attribution is blind`);
    }
  }

  if (report.opportunity_score !== null) {
    lines.push("", `🎯 *Opportunity Score:* ${report.opportunity_score}/100`);
  }

  if (report.summary) {
    lines.push("", `📝 *Summary:*`, report.summary);
  }

  if (report.anomalies && report.anomalies.length > 0) {
    lines.push("", `🚨 *Anomalies:*`);
    report.anomalies.slice(0, 3).forEach((a) => {
      lines.push(`${priorityEmoji(a.severity)} ${a.entity_name} — ${a.description}`);
    });
  }

  if (report.entities && report.entities.length > 0) {
    const ads = report.entities.filter((e) => e.level === "ad").slice(0, 5);
    if (ads.length > 0) {
      lines.push("", `📊 *Per ad:*`);
      ads.forEach((e) => {
        lines.push(
          `${verdictEmoji(e.verdict)} *${e.name}* — ${money(e.metrics.spend, currency)}, CTR ${e.metrics.ctr.toFixed(2)}%, ${e.metrics.results} res.`,
        );
      });
    }
  }

  if (recommendations.length > 0) {
    lines.push("", `💡 *Actions:*`);
    recommendations.slice(0, 4).forEach((r, i) => {
      lines.push(`${i + 1}. ${priorityEmoji(r.priority)} *${r.title}*`);
      lines.push(`   ${r.action}`);
    });
  }

  lines.push("", `🔗 [Full Report](${SITE_URL}/admin/ads)`);

  return lines.join("\n");
}

export async function sendAdsTelegramNotification(
  report: AdsReport,
  recommendations: AdsRecommendation[],
  currency = "USD",
): Promise<void> {
  const { token, chatId } = getTelegramConfig();
  const text = buildAdsTelegramMessage(report, recommendations, currency);

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error: ${response.status} — ${body}`);
  }
}
