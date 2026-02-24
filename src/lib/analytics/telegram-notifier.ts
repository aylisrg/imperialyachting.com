import type { AnalyticsReport, Hypothesis } from "./types";

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
  const arrow = change > 0 ? "\u2191" : "\u2193";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% ${arrow}`;
}

function priorityEmoji(priority: string): string {
  switch (priority) {
    case "high": return "\ud83d\udd34";
    case "medium": return "\ud83d\udfe1";
    case "low": return "\ud83d\udfe2";
    default: return "\u26aa";
  }
}

export function buildTelegramMessage(
  report: AnalyticsReport,
  hypotheses: Hypothesis[],
): string {
  const m = report.raw_metrics;
  const t = report.trends ?? {};

  const lines: string[] = [
    `\ud83d\udcca *Weekly Analytics Report*`,
    `Imperial Yachting | ${report.period_start} — ${report.period_end}`,
    "",
    `\ud83d\udcc8 *Key Metrics:*`,
    `\u2022 Sessions: ${m.sessions.toLocaleString()} ${t.sessions ? formatTrend(t.sessions.change_percent) : ""}`,
    `\u2022 Users: ${m.users.toLocaleString()} ${t.users ? formatTrend(t.users.change_percent) : ""}`,
    `\u2022 Bounce Rate: ${(m.bounce_rate * 100).toFixed(1)}% ${t.bounce_rate ? formatTrend(t.bounce_rate.change_percent) : ""}`,
    `\u2022 WhatsApp clicks: ${m.whatsapp_clicks} ${t.whatsapp_clicks ? formatTrend(t.whatsapp_clicks.change_percent) : ""}`,
    `\u2022 Contact form: ${m.inquiry_submissions} ${t.contact_clicks ? formatTrend(t.contact_clicks.change_percent) : ""}`,
    `\u2022 Phone clicks: ${m.phone_clicks} ${t.phone_clicks ? formatTrend(t.phone_clicks.change_percent) : ""}`,
  ];

  if (report.summary) {
    lines.push("", `\ud83d\udcdd *Summary:*`, report.summary);
  }

  if (hypotheses.length > 0) {
    lines.push("", `\ud83d\udca1 *Top Hypotheses:*`);
    hypotheses.slice(0, 3).forEach((h, i) => {
      lines.push(`${i + 1}. ${priorityEmoji(h.priority)} *${h.title}*`);
      lines.push(`   ${h.problem}`);
    });
  }

  if (report.quick_wins && report.quick_wins.length > 0) {
    lines.push("", `\u26a1 *Quick Wins:*`);
    report.quick_wins.forEach((qw) => {
      lines.push(`\u2022 ${qw.title} — ${qw.description}`);
    });
  }

  lines.push("", `\ud83d\udd17 [Full Report](${SITE_URL}/admin/analytics)`);

  return lines.join("\n");
}

export async function sendTelegramNotification(
  report: AnalyticsReport,
  hypotheses: Hypothesis[],
): Promise<void> {
  const { token, chatId } = getTelegramConfig();
  const text = buildTelegramMessage(report, hypotheses);

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
