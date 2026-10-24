import { SITE_CONFIG } from "@/lib/constants";
import { sendEmail } from "./email";
import { sendTelegram, escapeTelegramMarkdown } from "./telegram";
import { documentsLoginAdmin, formatDubai, type DocumentsLoginEvent } from "./templates";

function buildTelegramMessage(event: DocumentsLoginEvent): string {
  const lines = [
    `🔐 *Documents opened*${event.loginCount <= 1 ? " (first sign-in)" : ""}`,
    `Email: ${escapeTelegramMarkdown(event.email)}`,
  ];
  if (event.name) lines.push(`Name: ${escapeTelegramMarkdown(event.name)}`);
  if (event.company) lines.push(`Company: ${escapeTelegramMarkdown(event.company)}`);
  if (event.loginCount > 1) lines.push(`Sign-in #${event.loginCount}`);
  lines.push(`When: ${escapeTelegramMarkdown(formatDubai(event.at))}`);
  if (event.country) lines.push(`Country: ${escapeTelegramMarkdown(event.country)}`);
  return lines.join("\n");
}

/**
 * Tells the team who just confirmed their email and opened the documents:
 * an admin email (reply-to the visitor) plus Telegram. Never throws.
 */
export async function notifyDocumentsLogin(event: DocumentsLoginEvent): Promise<void> {
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL || SITE_CONFIG.email;
  const admin = documentsLoginAdmin(event);

  await Promise.allSettled([
    sendEmail({
      to: adminEmail,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: event.email,
    }),
    sendTelegram(buildTelegramMessage(event), { parseMode: "Markdown" }),
  ]);
}
