import { Resend } from "resend";

const DEFAULT_FROM = "Imperial Yachting <booking@imperialyachting.com>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  skipped?: boolean;
}

/** True when `RESEND_API_KEY` is set, i.e. `sendEmail` will actually attempt delivery. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Sends a transactional email via Resend. Never throws: resolves to
 * `{ ok: false, skipped: true }` when `RESEND_API_KEY` is not configured, and
 * to `{ ok: false }` if the Resend API call itself fails.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true };
  }

  const from = process.env.BOOKING_FROM_EMAIL || DEFAULT_FROM;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });

    if (error || !data) {
      return { ok: false };
    }

    return { ok: true, id: data.id };
  } catch {
    return { ok: false };
  }
}
