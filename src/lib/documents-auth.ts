import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Email magic-link access for the /documents portal.
 *
 * The page itself is public (and indexed); downloading the PDFs and seeing the
 * bank details needs a confirmed email. A visitor asks for a sign-in link, we
 * email a short-lived signed token, and following it issues a longer-lived
 * signed session cookie that carries the email — so every download is tied to
 * a real, confirmed address. Tokens are stateless HMACs: rotating the secret
 * signs everyone out.
 */

export const DOCUMENTS_COOKIE = "imperial_docs_session";

/** Session lifetime after following a sign-in link: 30 days. */
export const DOCUMENTS_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** How long an emailed sign-in link stays valid: 24 hours. */
export const DOCUMENTS_LINK_TTL = 60 * 60 * 24;

type TokenPurpose = "link" | "session";

interface TokenPayload {
  /** Purpose — a link token can never be used as a session and vice versa. */
  p: TokenPurpose;
  /** Email, lowercased. */
  m: string;
  /** Expiry, epoch seconds. */
  x: number;
}

function getSecret(): string | null {
  const dedicated = process.env.DOCUMENTS_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  // Derive from a secret that is always present in production, so the
  // portal works without one more env var.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return serviceKey ? `imperial-docs::${serviceKey}` : null;
}

/** True when tokens can be signed, i.e. the portal can grant access at all. */
export function isDocumentsAuthConfigured(): boolean {
  return getSecret() !== null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("base64url");
}

function createToken(
  purpose: TokenPurpose,
  email: string,
  ttlSeconds: number,
  now: number
): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload: TokenPayload = {
    p: purpose,
    m: normalizeEmail(email),
    x: Math.floor(now / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

function verifyToken(
  purpose: TokenPurpose,
  token: string | null | undefined,
  now: number
): string | null {
  const secret = getSecret();
  if (!secret || typeof token !== "string") return null;

  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;

  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;
    if (payload.p !== purpose || typeof payload.m !== "string" || !payload.m) return null;
    if (typeof payload.x !== "number" || payload.x * 1000 < now) return null;
    return payload.m;
  } catch {
    return null;
  }
}

/** Token for the emailed sign-in link; null when no signing secret is configured. */
export function createAccessLinkToken(email: string, now: number = Date.now()): string | null {
  return createToken("link", email, DOCUMENTS_LINK_TTL, now);
}

/** The email a sign-in link was issued to, or null if forged, malformed or expired. */
export function verifyAccessLinkToken(token: string | null | undefined, now: number = Date.now()): string | null {
  return verifyToken("link", token, now);
}

/** Token stored in the session cookie once a sign-in link has been followed. */
export function createSessionToken(email: string, now: number = Date.now()): string | null {
  return createToken("session", email, DOCUMENTS_SESSION_MAX_AGE, now);
}

/** The signed-in email for a session cookie value, or null. */
export function verifySessionToken(token: string | null | undefined, now: number = Date.now()): string | null {
  return verifyToken("session", token, now);
}

export interface DocumentsViewer {
  email: string;
}

/** Reads the request cookies and returns the confirmed visitor, if any. */
export async function getDocumentsViewer(): Promise<DocumentsViewer | null> {
  const store = await cookies();
  const email = verifySessionToken(store.get(DOCUMENTS_COOKIE)?.value);
  return email ? { email } : null;
}
