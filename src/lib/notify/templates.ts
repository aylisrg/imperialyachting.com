import { SITE_CONFIG } from "@/lib/constants";
import type { LeadRow } from "@/lib/supabase/types";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const NAVY = "#0a1a2f";
const NAVY_LIGHT = "#12253f";
const GOLD = "#c9a84c";
const WHITE = "#ffffff";
const MUTED = "#9aa7b8";

/** Formats a Date as a human-readable Dubai-local (Asia/Dubai, UTC+4) date/time string. */
export function formatDubai(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date) + " (Dubai time)";
}

function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapEmail(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:${NAVY};font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${NAVY};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background-color:${NAVY_LIGHT};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid rgba(201,168,76,0.25);">
                <span style="color:${GOLD};font-size:18px;font-weight:bold;letter-spacing:0.5px;">${SITE_CONFIG.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${WHITE};font-size:15px;line-height:1.6;">
                <h1 style="color:${WHITE};font-size:20px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(201,168,76,0.25);color:${MUTED};font-size:12px;">
                ${SITE_CONFIG.name} &middot; ${SITE_CONFIG.phone} &middot; ${SITE_CONFIG.email}<br />
                ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function footerText(): string {
  return `${SITE_CONFIG.name} | ${SITE_CONFIG.phone} | ${SITE_CONFIG.email}\n${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}`;
}

export interface LeadLike {
  name: string;
  email: string;
  phone?: string | null;
  inquiry_type: string;
  preferred_date?: string | null;
  message: string;
}

/** Admin-facing notification for a new website lead/inquiry. */
export function leadReceivedAdmin(lead: LeadLike | LeadRow): EmailTemplate {
  const subject = `New inquiry: ${lead.name} (${lead.inquiry_type})`;

  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone || "—"],
    ["Inquiry type", lead.inquiry_type],
    ["Preferred date", lead.preferred_date || "—"],
  ];

  const html = wrapEmail(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:4px 0;color:${MUTED};width:130px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;color:${WHITE};">${escapeHtml(value)}</td></tr>`
        )
        .join("")}
    </table>
    <p style="color:${MUTED};margin:0 0 6px;">Message</p>
    <p style="color:${WHITE};white-space:pre-wrap;margin:0;">${escapeHtml(lead.message)}</p>`,
    "New Website Inquiry"
  );

  const text = [
    "New Website Inquiry",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    lead.message,
    "",
    footerText(),
  ].join("\n");

  return { subject, html, text };
}

/** Customer-facing auto-reply confirming receipt of their inquiry. */
export function leadAutoReply(lead: LeadLike | LeadRow): EmailTemplate {
  const subject = `We've received your inquiry — ${SITE_CONFIG.name}`;

  const html = wrapEmail(
    `<p style="margin:0 0 16px;">Dear ${escapeHtml(lead.name)},</p>
    <p style="margin:0 0 16px;">Thank you for reaching out to ${SITE_CONFIG.name} regarding <strong style="color:${GOLD};">${escapeHtml(lead.inquiry_type)}</strong>. Our team has received your message and will get back to you within 24 hours.</p>
    <p style="margin:0 0 16px;">For urgent inquiries, please reach us directly via WhatsApp at <a href="${SITE_CONFIG.whatsapp}" style="color:${GOLD};">${SITE_CONFIG.phone}</a>.</p>
    <p style="margin:0;">Kind regards,<br />The ${SITE_CONFIG.name} Team</p>`,
    "Message Received"
  );

  const text = [
    `Dear ${lead.name},`,
    "",
    `Thank you for reaching out to ${SITE_CONFIG.name} regarding ${lead.inquiry_type}. Our team has received your message and will get back to you within 24 hours.`,
    "",
    `For urgent inquiries, please reach us directly via WhatsApp at ${SITE_CONFIG.phone}.`,
    "",
    `Kind regards,`,
    `The ${SITE_CONFIG.name} Team`,
    "",
    footerText(),
  ].join("\n");

  return { subject, html, text };
}

export interface BookingExtraLine {
  name: string;
  qty: number;
  amount: number;
}

export interface BookingNotificationBase {
  yachtName: string;
  startsAt: Date;
  hours: number;
  bonusHours?: number;
  guests: number;
  extras: BookingExtraLine[];
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  currency: string;
  bookingId: string;
}

function bookingSummaryRows(booking: BookingNotificationBase): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Booking ID", booking.bookingId],
    ["Yacht", booking.yachtName],
    ["Date & time", formatDubai(booking.startsAt)],
    [
      "Duration",
      booking.bonusHours
        ? `${booking.hours}h + ${booking.bonusHours}h bonus`
        : `${booking.hours}h`,
    ],
    ["Guests", String(booking.guests)],
  ];

  if (booking.extras.length > 0) {
    rows.push([
      "Extras",
      booking.extras
        .map((e) => `${e.name} x${e.qty} (${formatMoney(e.amount, booking.currency)})`)
        .join(", "),
    ]);
  }

  rows.push(
    ["Total", formatMoney(booking.totalAmount, booking.currency)],
    ["Deposit paid", formatMoney(booking.depositAmount, booking.currency)],
    ["Balance due", formatMoney(booking.balanceAmount, booking.currency)]
  );

  return rows;
}

function rowsToHtml(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    ${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:4px 0;color:${MUTED};width:140px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;color:${WHITE};">${escapeHtml(value)}</td></tr>`
      )
      .join("")}
  </table>`;
}

function rowsToText(rows: Array<[string, string]>): string {
  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

/** Customer-facing confirmation that a booking deposit has been paid. */
export function bookingDepositPaidCustomer(booking: BookingNotificationBase): EmailTemplate {
  const subject = `Booking confirmed — ${booking.yachtName}`;
  const rows = bookingSummaryRows(booking);

  const html = wrapEmail(
    `<p style="margin:0 0 16px;">Your deposit has been received and your charter is confirmed.</p>
    ${rowsToHtml(rows)}
    <p style="margin:0;color:${MUTED};">The remaining balance is due before departure. We'll send a reminder ahead of time.</p>`,
    "Deposit Received — Booking Confirmed"
  );

  const text = [
    "Deposit Received — Booking Confirmed",
    "",
    "Your deposit has been received and your charter is confirmed.",
    "",
    rowsToText(rows),
    "",
    "The remaining balance is due before departure. We'll send a reminder ahead of time.",
    "",
    footerText(),
  ].join("\n");

  return { subject, html, text };
}

export interface BookingCustomerInfo {
  name: string;
  email: string;
  phone?: string | null;
}

/** Admin-facing notification that a booking deposit has been paid. */
export function bookingDepositPaidAdmin(
  booking: BookingNotificationBase & { customer: BookingCustomerInfo; source?: string }
): EmailTemplate {
  const subject = `Deposit paid — ${booking.yachtName} (${booking.customer.name})`;
  const rows: Array<[string, string]> = [
    ["Customer", booking.customer.name],
    ["Email", booking.customer.email],
    ["Phone", booking.customer.phone || "—"],
    ["Source", booking.source || "—"],
    ...bookingSummaryRows(booking),
  ];

  const html = wrapEmail(rowsToHtml(rows), "Deposit Paid");
  const text = ["Deposit Paid", "", rowsToText(rows), "", footerText()].join("\n");

  return { subject, html, text };
}

/** Customer-facing reminder that the remaining balance is due. */
export function bookingBalanceReminder(booking: BookingNotificationBase): EmailTemplate {
  const subject = `Balance due soon — ${booking.yachtName}`;
  const rows = bookingSummaryRows(booking);

  const html = wrapEmail(
    `<p style="margin:0 0 16px;">This is a reminder that the remaining balance for your upcoming charter is due soon.</p>
    ${rowsToHtml(rows)}
    <p style="margin:0;">Please contact us if you have any questions.</p>`,
    "Balance Payment Reminder"
  );

  const text = [
    "Balance Payment Reminder",
    "",
    "This is a reminder that the remaining balance for your upcoming charter is due soon.",
    "",
    rowsToText(rows),
    "",
    "Please contact us if you have any questions.",
    "",
    footerText(),
  ].join("\n");

  return { subject, html, text };
}
