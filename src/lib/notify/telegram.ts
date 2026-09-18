/**
 * Generic Telegram Bot API notifier for transactional/commerce notifications
 * (leads, bookings, payments). Distinct from `src/lib/analytics/telegram-notifier.ts`,
 * which is analytics-report-specific and throws on failure; this helper is meant to be
 * used inline in request-handling code paths, so it never throws — it resolves to
 * `false` when unconfigured or when the Telegram API call fails.
 */

export interface SendTelegramOptions {
  /** Telegram `parse_mode`. Omit for plain text. */
  parseMode?: "Markdown" | "HTML";
}

function getTelegramConfig(): { token: string; chatId: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

/**
 * Sends a message via the Telegram Bot API. Never throws: returns `false` when
 * the bot is not configured (missing env vars) or when the request itself fails.
 */
export async function sendTelegram(
  text: string,
  opts: SendTelegramOptions = {}
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config) return false;

  const { token, chatId } = config;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(opts.parseMode ? { parse_mode: opts.parseMode } : {}),
        disable_web_page_preview: true,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Escapes text for use inside Telegram legacy Markdown (`parse_mode: "Markdown"`)
 * messages, so that user-supplied strings (names, messages, etc.) can't break
 * formatting or be interpreted as Markdown syntax.
 */
export function escapeTelegramMarkdown(s: string): string {
  return s.replace(/([_*[\]`])/g, "\\$1");
}
