/**
 * Instagram Basic Display API
 *
 * Fetches real photos from the @dubai.yachts.rental Instagram account.
 * Requires a long-lived access token stored in the INSTAGRAM_ACCESS_TOKEN
 * environment variable.
 *
 * ─── How to get an access token ──────────────────────────────────────────
 * 1. Go to https://developers.facebook.com/ and create an app
 * 2. Add the "Instagram Basic Display" product
 * 3. Under Instagram > Basic Display > User Token Generator, add your Instagram
 *    account and generate a user token
 * 4. Exchange the short-lived token for a long-lived one (valid 60 days):
 *    GET https://graph.instagram.com/access_token
 *      ?grant_type=ig_exchange_token
 *      &client_secret={app-secret}
 *      &access_token={short-lived-token}
 * 5. Refresh before expiry (call refreshInstagramToken from a cron route):
 *    GET https://graph.instagram.com/refresh_access_token
 *      ?grant_type=ig_refreshtoken
 *      &access_token={long-lived-token}
 * 6. Set INSTAGRAM_ACCESS_TOKEN in your Vercel environment variables
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN ?? "";

const INSTAGRAM_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

/**
 * Fetch recent posts from the configured Instagram account.
 * Returns an empty array when the token is not configured or the API fails.
 * Results are cached for 1 hour via Next.js ISR.
 */
export async function fetchInstagramPosts(limit = 9): Promise<InstagramPost[]> {
  if (!INSTAGRAM_TOKEN) {
    return [];
  }

  try {
    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set("fields", INSTAGRAM_FIELDS);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", INSTAGRAM_TOKEN);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { data: InstagramPost[] };

    // Only include posts that have a displayable image
    return data.data.filter(
      (post) =>
        post.media_type === "IMAGE" ||
        post.media_type === "CAROUSEL_ALBUM" ||
        (post.media_type === "VIDEO" && !!post.thumbnail_url),
    );
  } catch {
    return [];
  }
}

/**
 * Refresh the long-lived token before it expires (call from a scheduled job).
 * A long-lived token is valid for 60 days; refresh after ~50 days.
 */
export async function refreshInstagramToken(): Promise<string | null> {
  if (!INSTAGRAM_TOKEN) return null;

  try {
    const url = new URL("https://graph.instagram.com/refresh_access_token");
    url.searchParams.set("grant_type", "ig_refreshtoken");
    url.searchParams.set("access_token", INSTAGRAM_TOKEN);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  } catch {
    return null;
  }
}
