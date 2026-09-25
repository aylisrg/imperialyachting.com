import { SITE_CONFIG } from "@/lib/constants";
import type { LeadRow } from "@/lib/supabase/types";
import { sendEmail } from "./email";
import { sendTelegram, escapeTelegramMarkdown } from "./telegram";
import { leadReceivedAdmin, leadAutoReply, type LeadLike } from "./templates";

export * from "./telegram";
export * from "./email";
export * from "./templates";

function buildLeadTelegramMessage(lead: LeadLike | LeadRow): string {
  const lines = [
    `📩 *New Website Inquiry*`,
    `Name: ${escapeTelegramMarkdown(lead.name)}`,
    `Email: ${escapeTelegramMarkdown(lead.email)}`,
  ];
  if (lead.phone) lines.push(`Phone: ${escapeTelegramMarkdown(lead.phone)}`);
  lines.push(`Type: ${escapeTelegramMarkdown(lead.inquiry_type)}`);
  if (lead.preferred_date) {
    lines.push(`Preferred date: ${escapeTelegramMarkdown(lead.preferred_date)}`);
  }
  lines.push("", escapeTelegramMarkdown(lead.message));
  return lines.join("\n");
}

/**
 * Fires off all notifications for a newly-received lead: an admin email, an
 * auto-reply to the lead, and a Telegram summary. Every channel runs
 * independently via `Promise.allSettled` — a failure in one never blocks or
 * throws for the others, and this function itself never throws.
 */
export async function notifyLead(lead: LeadLike | LeadRow): Promise<void> {
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL || SITE_CONFIG.email;
  const adminTemplate = leadReceivedAdmin(lead);
  const autoReplyTemplate = leadAutoReply(lead);

  await Promise.allSettled([
    sendEmail({
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      replyTo: lead.email,
    }),
    sendEmail({
      to: lead.email,
      subject: autoReplyTemplate.subject,
      html: autoReplyTemplate.html,
      text: autoReplyTemplate.text,
    }),
    sendTelegram(buildLeadTelegramMessage(lead), { parseMode: "Markdown" }),
  ]);
}

export { notifySaleDownload, salesNotifyEmail } from "./sales";
