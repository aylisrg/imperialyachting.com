import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { parseJsonBody } from "@/lib/api/validate";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import {
  DOCUMENTS_LINK_TTL,
  createAccessLinkToken,
  normalizeEmail,
} from "@/lib/documents-auth";
import { accessContextFromRequest, recordLinkRequest } from "@/lib/documents-access";
import { documentsAccessLink, isEmailConfigured, sendEmail } from "@/lib/notify";
import { SITE_CONFIG } from "@/lib/constants";

export const runtime = "nodejs";

const requestLinkSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address").max(254),
  name: z.string().trim().max(200).optional(),
  company: z.string().trim().max(200).optional(),
  // Honeypot: hidden from people, bots fill it in.
  website: z.string().optional(),
});

const UNAVAILABLE = `Email sign-in is temporarily unavailable. Please contact ${SITE_CONFIG.email}.`;

/**
 * Production links always point at the canonical domain, so a spoofed Host
 * header can never put someone else's domain into our email.
 */
function linkBaseUrl(request: Request): string {
  return process.env.VERCEL_ENV === "production" ? SITE_CONFIG.url : new URL(request.url).origin;
}

/**
 * POST /api/documents/request-link
 * Saves the visitor's email and sends them a sign-in link for /documents.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`docs-link:${ip}`, { limit: 5, windowMs: 60_000 }).ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again in a minute.");
  }

  const parsed = await parseJsonBody(request, requestLinkSchema);
  if (!parsed.ok) return parsed.response;
  const { data } = parsed;

  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(data.email);
  if (!rateLimit(`docs-link-email:${email}`, { limit: 3, windowMs: 10 * 60_000 }).ok) {
    return jsonError(
      429,
      "rate_limited",
      "We've already sent a few links to this address. Please check your inbox, including spam."
    );
  }

  const token = createAccessLinkToken(email);
  if (!token) {
    console.error("[documents] no signing secret: set DOCUMENTS_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY");
    return jsonError(503, "not_configured", UNAVAILABLE);
  }

  const url = `${linkBaseUrl(request)}/api/documents/verify?token=${encodeURIComponent(token)}`;

  await recordLinkRequest(
    { email, name: data.name || null, company: data.company || null },
    accessContextFromRequest(request)
  );

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[documents] RESEND_API_KEY is not set — cannot send sign-in links");
      return jsonError(503, "not_configured", UNAVAILABLE);
    }
    // Local development without Resend: the link goes to the server log.
    console.info(`[documents] sign-in link for ${email}: ${url}`);
    return NextResponse.json({ ok: true });
  }

  const template = documentsAccessLink({ url, validHours: DOCUMENTS_LINK_TTL / 3600 });
  const sent = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  if (!sent.ok) {
    return jsonError(502, "send_failed", "We couldn't send the email. Please try again in a moment.");
  }

  return NextResponse.json({ ok: true });
}
