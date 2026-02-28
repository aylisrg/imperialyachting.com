/**
 * YouTube RSS Feed Fetcher
 *
 * Fetches real videos from the Imperial Wave YouTube channel using the public
 * RSS feed — no API key required. Thumbnails are served from i.ytimg.com.
 *
 * How to find your Channel ID:
 *   1. Go to https://www.youtube.com/@imperial_wave
 *   2. View Page Source → search for "channelId" or "externalId"
 *   3. The value is in the format "UCxxxxxxxxxxxxxxxxxxxxxxxx"
 *   OR use: https://commentpicker.com/youtube-channel-id.php
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  thumbnailHq: string;
  url: string;
  channelTitle: string;
}

// ─── Channel ID ──────────────────────────────────────────────────────────────
// Set this once. Find it at: https://www.youtube.com/@imperial_wave
// View Page Source → search for "channelId" (format: UCxxxxxxxxxxxxxxxxxxxxxxxx)
const DEFAULT_CHANNEL_ID = "UC8eBvU6VgGyMY6_Tf4P8_QA";
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;

const YOUTUBE_RSS_URL = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

/** Returns the standard YouTube thumbnail URL for a given video ID */
export function ytThumbnail(videoId: string, quality: "hq" | "mq" | "sd" | "max" = "hq"): string {
  const q = quality === "max" ? "maxresdefault" : `${quality}default`;
  return `https://i.ytimg.com/vi/${videoId}/${q}.jpg`;
}

/** Returns the YouTube watch URL for a given video ID */
export function ytUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Parses YouTube Atom RSS feed XML into structured video objects.
 * The RSS feed includes the video ID, title, published date, and thumbnail.
 */
function parseYouTubeRss(xml: string): YouTubeVideo[] {
  const entries = xml.split("<entry>").slice(1);

  return entries.map((entry) => {
    const videoId =
      entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
    const title =
      entry
        .match(/<title>([^<]+)<\/title>/)?.[1]
        ?.replace(/&amp;/g, "&")
        ?.replace(/&lt;/g, "<")
        ?.replace(/&gt;/g, ">")
        ?.replace(/&quot;/g, '"')
        ?.replace(/&#39;/g, "'") ?? "";
    const published =
      entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
    const channelTitle =
      entry
        .match(/<name>([^<]+)<\/name>/)?.[1]
        ?.replace(/&amp;/g, "&") ?? "Imperial Wave";

    // Media thumbnail from the feed
    const mediaThumbnail =
      entry.match(/url="(https:\/\/i\.ytimg\.com[^"]+)"/)?.[1] ?? "";

    return {
      id: videoId,
      title,
      published,
      thumbnail: mediaThumbnail || ytThumbnail(videoId, "sd"),
      thumbnailHq: ytThumbnail(videoId, "max"),
      url: ytUrl(videoId),
      channelTitle,
    };
  }).filter((v) => v.id && v.title);
}

// ─── Hardcoded fallback ──────────────────────────────────────────────────────
// Real videos from @imperial_wave channel, used when RSS feed is unavailable.
// Thumbnails load from i.ytimg.com, links go to real YouTube videos.
const HARDCODED_VIDEOS: YouTubeVideo[] = [
  { id: "rI6c7cYhdQ0", title: "Transformer boat" },
  { id: "5SPTgDjH4y0", title: "TOP G EPIC ARRIVAL ⚓️" },
  { id: "BrkXuwaERj4", title: "Boat traffic in Dubai Harbour at sunset." },
  { id: "GcvTvtqry2Q", title: "Dubai Marina at night 🌙" },
  { id: "-KqykGp8-j0", title: "Parking the yacht Moneta in Dubai Harbor" },
  { id: "1xYbwomzw8w", title: "Imperial Wave #8" },
  { id: "526tn0t8-S4", title: "Moneta review by Farooq Syed & Aleksandr Danilov" },
  { id: "iqY2Ss8-hBM", title: "VanDutch review by Farooq Syed & Aleksandr Danilov" },
  { id: "K6Xd3h5J3sw", title: "Imperial Logbook #7" },
  { id: "9LGiYJdRueA", title: "Sound Design — Imperial Logbook #6" },
  { id: "gi64yX95Xi4", title: "New Salon — Imperial Logbook #5" },
  { id: "RbzQOjJ9Ngk", title: "Imperial Wave — Meet us!" },
].map((v) => ({
  id: v.id,
  title: v.title,
  published: "",
  thumbnail: ytThumbnail(v.id, "sd"),
  thumbnailHq: ytThumbnail(v.id, "max"),
  url: ytUrl(v.id),
  channelTitle: "Imperial Wave",
}));

/**
 * Fetches the latest videos from the YouTube channel RSS feed.
 * Cached with Next.js ISR — revalidates every hour.
 * Falls back to hardcoded real video data when RSS is unavailable.
 */
export async function fetchYouTubeVideos(limit = 12): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(YOUTUBE_RSS_URL(YOUTUBE_CHANNEL_ID), {
      next: { revalidate: 3600 }, // cache for 1 hour
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImperialYachtingBot/1.0)",
      },
    });

    if (res.ok) {
      const xml = await res.text();
      const videos = parseYouTubeRss(xml);
      if (videos.length > 0) {
        return videos.slice(0, limit);
      }
    }
  } catch {
    // RSS unavailable — fall through to hardcoded data
  }

  // Fallback: return hardcoded real videos from @imperial_wave
  return HARDCODED_VIDEOS.slice(0, limit);
}
