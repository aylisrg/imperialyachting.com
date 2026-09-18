import { SITE_CONFIG } from "@/lib/constants";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10000;

export interface IndexNowResult {
  ok: boolean;
  status?: number;
  skipped?: boolean;
}

function siteHost(): string {
  try {
    return new URL(SITE_CONFIG.url).hostname;
  } catch {
    return SITE_CONFIG.url;
  }
}

/**
 * Submits a list of URLs to the IndexNow API so search engines (Bing, Yandex,
 * and others that participate in the protocol) can pick up changes quickly.
 *
 * Requires `INDEXNOW_KEY` to be set in the environment. When it is not set,
 * this is a no-op that resolves to `{ ok: false, skipped: true }` without
 * making any network request. Never throws — all errors are caught and
 * logged.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return { ok: false, skipped: true };
  }

  const dedupedUrls = Array.from(new Set(urls)).slice(0, MAX_URLS);

  if (dedupedUrls.length === 0) {
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: siteHost(),
        key,
        keyLocation: `${SITE_CONFIG.url}/${key}.txt`,
        urlList: dedupedUrls,
      }),
    });

    if (!response.ok) {
      console.error(
        `[indexnow] submission failed with status ${response.status}`
      );
      return { ok: false, status: response.status };
    }

    return { ok: true, status: response.status };
  } catch (err) {
    console.error("[indexnow] submission error", err);
    return { ok: false };
  }
}

/** Absolute URLs to (re-)submit after a yacht is created or updated. */
export function yachtUrls(slug: string): string[] {
  return [`${SITE_CONFIG.url}/fleet/${slug}`, `${SITE_CONFIG.url}/fleet`];
}

/** Absolute URLs to (re-)submit after a destination is created or updated. */
export function destinationUrls(slug: string): string[] {
  return [
    `${SITE_CONFIG.url}/destinations/${slug}`,
    `${SITE_CONFIG.url}/destinations`,
  ];
}
