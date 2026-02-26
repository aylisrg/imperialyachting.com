/**
 * Instagram Graph API — fetches media from a Business/Creator Instagram account.
 *
 * NOTE: Instagram Basic Display API was shut down by Meta in December 2024.
 * This implementation uses the Instagram Graph API (graph.facebook.com),
 * which is the only supported way to fetch your own Instagram media as of 2025.
 *
 * ─── Prerequisites ───────────────────────────────────────────────────────────
 * • @dubai.yachts.rental must be a Business or Creator account (not Personal)
 *   → Instagram app → Settings → Account → Switch to Professional Account
 * • The Instagram account must be linked to a Facebook Page
 *   → Instagram Settings → Account → Linked Accounts → Facebook
 *
 * ─── How to get a long-lived Page Access Token (step-by-step) ────────────────
 *
 * STEP 1 — Meta Developer Portal
 *   1. Go to https://developers.facebook.com/
 *   2. Open your existing App (or create a new one: Business type)
 *   3. In the left sidebar: Add Product → "Instagram" (the Graph API one, NOT Basic Display)
 *   4. Under App Settings → Basic → add your domain: imperialyachting.com
 *
 * STEP 2 — Generate a User Access Token with the Graph API Explorer
 *   1. Go to https://developers.facebook.com/tools/explorer/
 *   2. In the top-right: select your App from the dropdown
 *   3. Click "Generate Access Token"
 *   4. When asked for permissions, add ALL of these:
 *        • pages_show_list
 *        • pages_read_engagement
 *        • instagram_basic
 *        • instagram_content_publish   (allows reading your own media)
 *   5. Click "Generate Access Token" → log in with the Facebook account
 *      that OWNS the Page linked to @dubai.yachts.rental
 *   6. Copy the short-lived User Access Token (valid 1 hour)
 *
 * STEP 3 — Exchange for a Long-Lived User Access Token (valid 60 days)
 *   Open your browser and visit this URL (replace placeholders):
 *
 *   https://graph.facebook.com/oauth/access_token
 *     ?grant_type=fb_exchange_token
 *     &client_id={YOUR_APP_ID}
 *     &client_secret={YOUR_APP_SECRET}
 *     &fb_exchange_token={SHORT_LIVED_TOKEN_FROM_STEP_2}
 *
 *   → App ID and App Secret are in developers.facebook.com → Your App → App Settings → Basic
 *   → You'll get back a long-lived token (valid ~60 days). Copy it.
 *
 * STEP 4 — Get your Instagram Business Account ID
 *   In the Graph API Explorer, with the long-lived token selected, run:
 *
 *   GET /me/accounts
 *   → Copy the "id" of your Facebook Page (e.g. "123456789")
 *
 *   GET /{page-id}?fields=instagram_business_account
 *   → Copy the inner "id" — this is your Instagram Business Account ID (IGBID)
 *   → Store it as INSTAGRAM_BUSINESS_ACCOUNT_ID in Vercel env vars
 *
 * STEP 5 — Get a long-lived Page Access Token (doesn't expire!)
 *   In the Graph API Explorer, run:
 *
 *   GET /{page-id}?fields=access_token
 *   → Copy the "access_token" value — this is a Page Access Token
 *   → Page Access Tokens do NOT expire (unlike User tokens)
 *   → Store it as INSTAGRAM_ACCESS_TOKEN in Vercel env vars
 *
 * STEP 6 — Add to Vercel
 *   In Vercel → Your Project → Settings → Environment Variables, add:
 *     INSTAGRAM_ACCESS_TOKEN      = <page access token from Step 5>
 *     INSTAGRAM_BUSINESS_ACCOUNT_ID = <IGBID from Step 4>
 *
 * ─── Token refresh ────────────────────────────────────────────────────────────
 * Page Access Tokens never expire, so no refresh is needed.
 * If you used a User Access Token (60-day), call refreshInstagramToken()
 * from a Vercel Cron Job every 50 days.
 * ─────────────────────────────────────────────────────────────────────────────
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
// Your Instagram Business Account ID (numeric, e.g. "17841400008460056")
const INSTAGRAM_BUSINESS_ACCOUNT_ID =
  process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? "";

const INSTAGRAM_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

const GRAPH_API_VERSION = "v22.0";

/**
 * Fetch recent posts from the configured Instagram Business account.
 * Returns an empty array when env vars are not configured or the API fails.
 * Results are ISR-cached for 1 hour.
 */
export async function fetchInstagramPosts(limit = 9): Promise<InstagramPost[]> {
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    return [];
  }

  try {
    const url = new URL(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
    );
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
 * Refresh a long-lived User Access Token before it expires (60-day tokens only).
 * Page Access Tokens do not expire and do not need refreshing.
 */
export async function refreshInstagramToken(): Promise<string | null> {
  if (!INSTAGRAM_TOKEN) return null;

  try {
    const url = new URL(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token`,
    );
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set(
      "client_id",
      process.env.INSTAGRAM_APP_ID ?? "",
    );
    url.searchParams.set(
      "client_secret",
      process.env.INSTAGRAM_APP_SECRET ?? "",
    );
    url.searchParams.set("fb_exchange_token", INSTAGRAM_TOKEN);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  } catch {
    return null;
  }
}
