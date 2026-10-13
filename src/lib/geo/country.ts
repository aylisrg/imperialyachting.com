/**
 * Resolve the visitor's country (ISO 3166-1 alpha-2) from request headers,
 * independent of the hosting platform.
 *
 * Order:
 *  1. `cf-ipcountry`, only when TRUST_CF_IPCOUNTRY=1. Anyone hitting the VPS
 *     directly can set this header, so it is ignored by default. Enable it only
 *     when nginx accepts traffic from Cloudflare IP ranges (or clears the
 *     header for everything else).
 *  2. `x-vercel-ip-country` (legacy Vercel hosting).
 *  3. A custom header named by COUNTRY_HEADER (e.g. set by nginx GeoIP).
 *  4. null (unknown).
 *
 * Values that are not a real country code (Cloudflare's `XX` unknown and `T1`
 * Tor markers, garbage) are skipped.
 */
type HeaderSource = { get(name: string): string | null };

const NON_COUNTRY = new Set(["XX", "T1"]);

export function normalizeCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || NON_COUNTRY.has(code)) return null;
  return code;
}

export function getRequestCountry(
  headers: HeaderSource,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const candidates: string[] = [];
  if (env.TRUST_CF_IPCOUNTRY === "1") candidates.push("cf-ipcountry");
  candidates.push("x-vercel-ip-country");
  const custom = env.COUNTRY_HEADER?.trim();
  if (custom) candidates.push(custom.toLowerCase());

  for (const name of candidates) {
    const code = normalizeCountry(headers.get(name));
    if (code) return code;
  }
  return null;
}
