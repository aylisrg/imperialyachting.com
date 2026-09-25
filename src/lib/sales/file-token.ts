import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Short-lived signed links for sale materials that ship with the site
 * (`private/sales/**`, outside /public). The link is issued only after the
 * email gate, so the files are never reachable by a guessable URL.
 */

export const BUNDLED_SALES_DIR = path.join(process.cwd(), "private", "sales");

const SAFE_LOCATION = /^[a-z0-9][a-z0-9/_.-]*$/i;

interface FileTokenPayload {
  /** Location relative to BUNDLED_SALES_DIR. */
  l: string;
  /** Download file name. */
  n: string;
  /** Expiry, epoch seconds. */
  e: number;
}

function getSecret(): string | null {
  const dedicated = process.env.SALES_FILE_SECRET?.trim();
  if (dedicated) return dedicated;
  // Derive from a secret that is always present in production, so the
  // feature works without one more env var.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return serviceKey ? `imperial-sales-files::${serviceKey}` : null;
}

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("base64url");
}

/** Signs a token for a bundled file; null when no signing secret is configured. */
export function createFileToken(
  location: string,
  fileName: string,
  ttlSeconds: number,
  now: number = Date.now()
): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload: FileTokenPayload = {
    l: location,
    n: fileName,
    e: Math.floor(now / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

/** Verifies a token; returns its payload, or null if forged, malformed or expired. */
export function verifyFileToken(
  token: string,
  now: number = Date.now()
): { location: string; fileName: string } | null {
  const secret = getSecret();
  if (!secret || typeof token !== "string") return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as FileTokenPayload;
    if (typeof payload.l !== "string" || typeof payload.n !== "string") return null;
    if (typeof payload.e !== "number" || payload.e * 1000 < now) return null;
    return { location: payload.l, fileName: payload.n };
  } catch {
    return null;
  }
}

/** Absolute path of a bundled file, or null if the location is unsafe or missing. */
export function resolveBundledFile(location: string): string | null {
  if (!SAFE_LOCATION.test(location) || location.split("/").includes("..")) return null;
  const full = path.resolve(BUNDLED_SALES_DIR, location);
  if (!full.startsWith(BUNDLED_SALES_DIR + path.sep)) return null;
  return fs.existsSync(full) ? full : null;
}
