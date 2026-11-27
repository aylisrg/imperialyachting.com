import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import {
  DOCUMENTS_COOKIE,
  DOCUMENTS_SESSION_MAX_AGE,
  createSessionToken,
  isDocumentsPasswordConfigured,
  isPasswordValid,
} from "@/lib/documents-auth";
import { PASSWORD_SESSION_LABEL } from "@/lib/documents-session";

export const runtime = "nodejs";

/**
 * POST /api/documents/unlock  { password }
 * Unlocks /documents with the shared access password and starts the same
 * signed session as the email link (labelled as a password session).
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`docs-unlock:${ip}`, { limit: 10, windowMs: 10 * 60_000 }).ok) {
    return jsonError(429, "rate_limited", "Too many attempts. Please try again in a few minutes.");
  }

  let password: unknown = "";
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return jsonError(400, "invalid_request", "Invalid request.");
  }

  if (!isDocumentsPasswordConfigured()) {
    return jsonError(503, "not_configured", "Password access is not available. Please use the email sign-in link.");
  }
  if (!isPasswordValid(password)) {
    return jsonError(401, "wrong_password", "Incorrect password. Please try again.");
  }

  const session = createSessionToken(PASSWORD_SESSION_LABEL);
  if (!session) {
    console.error("[documents] no signing secret: set DOCUMENTS_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY");
    return jsonError(503, "not_configured", "Password access is not available. Please use the email sign-in link.");
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DOCUMENTS_COOKIE,
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DOCUMENTS_SESSION_MAX_AGE,
  });
  return response;
}
