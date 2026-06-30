import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Shared-password gate for the private /documents portal.
 *
 * A single password (DOCUMENTS_PASSWORD) unlocks the portal. On success an
 * httpOnly, signed cookie is issued so the visitor stays unlocked without the
 * password ever being stored client-side. The same cookie is verified before
 * any document file is streamed, so the PDFs are never reachable by direct URL
 * without unlocking first.
 */

export const DOCUMENTS_COOKIE = "imperial_docs_session";

// Session lifetime: 7 days.
export const DOCUMENTS_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Fallback password used only when DOCUMENTS_PASSWORD is not configured.
// IMPORTANT: set DOCUMENTS_PASSWORD in the environment for production — see
// DOCUMENTS_RU.md. This default exists so the page never hard-fails locally.
const FALLBACK_PASSWORD = "ImperialDocs2025";

// Static payload that gets signed. Changing the password invalidates all
// existing sessions automatically because the password is part of the key.
const TOKEN_PAYLOAD = "imperial-docs-session-v1";

export function getDocumentsPassword(): string {
  return process.env.DOCUMENTS_PASSWORD?.trim() || FALLBACK_PASSWORD;
}

function getSigningKey(): string {
  // A dedicated secret is preferred; fall back to deriving from the password
  // so the gate works with a single env var if that is all that is set.
  const secret = process.env.DOCUMENTS_SESSION_SECRET?.trim();
  if (secret) return secret;
  return `imperial-docs::${getDocumentsPassword()}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Constant-time comparison of a submitted password against the configured one. */
export function isPasswordValid(submitted: string): boolean {
  if (typeof submitted !== "string" || submitted.length === 0) return false;
  return timingSafeEqual(submitted, getDocumentsPassword());
}

/** Create the signed session token to store in the cookie. */
export function createSessionToken(): string {
  return crypto
    .createHmac("sha256", getSigningKey())
    .update(TOKEN_PAYLOAD)
    .digest("hex");
}

/** Verify a session token previously issued by createSessionToken(). */
export function isSessionTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  return timingSafeEqual(token, createSessionToken());
}

/** Read the request cookies and report whether the visitor is unlocked. */
export async function isUnlocked(): Promise<boolean> {
  const store = await cookies();
  return isSessionTokenValid(store.get(DOCUMENTS_COOKIE)?.value);
}
