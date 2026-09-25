import { SITE_CONFIG } from "@/lib/constants";
import { sendEmail } from "./email";
import { sendTelegram, escapeTelegramMarkdown } from "./telegram";
import {
  formatDubai,
  saleDownloadAdmin,
  saleMaterialsRequester,
  type SaleDownloadEvent,
} from "./templates";

/** Where download alerts go: SALES_NOTIFY_EMAIL, else the booking admin inbox. */
export function salesNotifyEmail(): string {
  return (
    process.env.SALES_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_ADMIN_EMAIL?.trim() ||
    SITE_CONFIG.email
  );
}

function buildTelegramMessage(event: SaleDownloadEvent): string {
  const lines = [
    `📥 *${event.isBroker ? "Broker" : "Buyer"} downloaded materials*`,
    `Yacht: ${escapeTelegramMarkdown(event.listingTitle)}`,
    `Email: ${escapeTelegramMarkdown(event.email)}`,
  ];
  if (event.company) lines.push(`Company: ${escapeTelegramMarkdown(event.company)}`);
  if (event.clientName) lines.push(`Client registered: ${escapeTelegramMarkdown(event.clientName)}`);
  lines.push(
    `Materials: ${escapeTelegramMarkdown(event.materials.map((m) => m.title).join(", "))}`,
    `When: ${escapeTelegramMarkdown(formatDubai(event.at))}`
  );
  if (event.previousDownloads) lines.push(`Earlier downloads: ${event.previousDownloads}`);
  if (event.country) lines.push(`Country: ${escapeTelegramMarkdown(event.country)}`);
  return lines.join("\n");
}

/**
 * Fires every notification for a materials download: the owner alert (email
 * with reply-to set to the requester, plus Telegram) and the requester's own
 * copy of the links. Channels run independently; this never throws.
 */
export async function notifySaleDownload(event: SaleDownloadEvent): Promise<void> {
  const admin = saleDownloadAdmin(event);
  const requester = saleMaterialsRequester(event);

  await Promise.allSettled([
    sendEmail({
      to: salesNotifyEmail(),
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: event.email,
    }),
    sendEmail({
      to: event.email,
      subject: requester.subject,
      html: requester.html,
      text: requester.text,
      replyTo: salesNotifyEmail(),
    }),
    sendTelegram(buildTelegramMessage(event), { parseMode: "Markdown" }),
  ]);
}
