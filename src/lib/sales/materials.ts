import { SITE_CONFIG } from "@/lib/constants";
import { createAdminSupabase, isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import type { SaleMaterialRow } from "@/lib/supabase/types";
import type {
  SaleDownloadFile,
  SaleListing,
  SaleMaterialSummary,
} from "@/types/sale";
import { createFileToken } from "./file-token";

export const SALE_MEDIA_BUCKET = "sale-media";
export const SALE_MATERIALS_BUCKET = "sale-materials";

/** Signed links stay valid for a week, so the copy emailed to the requester works too. */
export const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Virtual items built from the listing's own gallery — no DB row needed. */
export const PHOTO_PACK_ID = "photos";
export const VIDEO_PACK_ID = "videos";

/** Active materials of a listing (service-role read; the table has no public policy). */
export async function fetchSaleMaterialRows(listingId: string): Promise<SaleMaterialRow[]> {
  if (!isAdminSupabaseConfigured()) return [];
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("sale_materials")
      .select("*")
      .eq("listing_id", listingId)
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[sales] sale_materials query failed:", error.message);
      return [];
    }
    return (data ?? []) as SaleMaterialRow[];
  } catch (err) {
    console.error("[sales] sale_materials unavailable:", err);
    return [];
  }
}

function videoFiles(listing: SaleListing): string[] {
  return listing.videos.filter((v) => v.kind === "file").map((v) => v.url);
}

/**
 * What the page offers for download: stored materials first, then the photo
 * pack (every gallery photo) and the video pack (every uploaded video file).
 */
export function buildMaterialSummaries(
  listing: SaleListing,
  rows: SaleMaterialRow[]
): SaleMaterialSummary[] {
  const items: SaleMaterialSummary[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    kind: row.source === "url" ? "link" : "file",
    sizeBytes: row.size_bytes,
    fileCount: 1,
  }));

  if (listing.images.length > 0) {
    items.push({
      id: PHOTO_PACK_ID,
      title: "Photo pack",
      description: `${listing.images.length} photos, full resolution, no watermarks.`,
      category: "photos",
      kind: "file",
      sizeBytes: null,
      fileCount: listing.images.length,
    });
  }

  const videos = videoFiles(listing);
  if (videos.length > 0) {
    items.push({
      id: VIDEO_PACK_ID,
      title: "Video pack",
      description: `${videos.length} video file${videos.length === 1 ? "" : "s"}.`,
      category: "video",
      kind: "file",
      sizeBytes: null,
      fileCount: videos.length,
    });
  }

  return items;
}

function extensionOf(url: string, fallback: string): string {
  try {
    const match = /\.([a-z0-9]{2,5})$/i.exec(new URL(url).pathname);
    return match ? match[1].toLowerCase() : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Supabase public-object URLs honour `?download=<name>` (Content-Disposition:
 * attachment), so gallery files download instead of opening in a tab.
 */
export function withDownloadName(url: string, fileName: string): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("download", fileName);
    return u.toString();
  } catch {
    return url;
  }
}

function absolute(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${SITE_CONFIG.url}${url.startsWith("/") ? "" : "/"}${url}`;
}

function packFiles(listing: SaleListing, urls: string[], label: string, fallbackExt: string): SaleDownloadFile[] {
  const pad = Math.max(2, String(urls.length).length);
  return urls.map((url, i) => {
    const name = `${listing.slug}-${label}-${String(i + 1).padStart(pad, "0")}.${extensionOf(url, fallbackExt)}`;
    return { name, url: withDownloadName(absolute(url), name), kind: "file" as const };
  });
}

async function materialFile(row: SaleMaterialRow, baseUrl: string): Promise<SaleDownloadFile | null> {
  switch (row.source) {
    case "url":
      return { name: row.title, url: row.location, kind: "link" };
    case "bundled": {
      const token = createFileToken(row.location, row.file_name, DOWNLOAD_LINK_TTL_SECONDS);
      if (!token) return null;
      return {
        name: row.file_name,
        url: `${baseUrl}/api/sales/file?t=${encodeURIComponent(token)}`,
        kind: "file",
      };
    }
    case "storage": {
      const { data, error } = await createAdminSupabase()
        .storage.from(SALE_MATERIALS_BUCKET)
        .createSignedUrl(row.location, DOWNLOAD_LINK_TTL_SECONDS, { download: row.file_name });
      if (error || !data?.signedUrl) {
        console.error(`[sales] could not sign ${row.location}:`, error?.message);
        return null;
      }
      return { name: row.file_name, url: data.signedUrl, kind: "file" };
    }
    default:
      return null;
  }
}

export interface ResolvedMaterial {
  id: string;
  title: string;
  files: SaleDownloadFile[];
}

/**
 * Turns the ids a visitor ticked into concrete download links. Unknown ids
 * are ignored; items whose file can't be signed are dropped (and logged).
 * `baseUrl` is the origin that serves /api/sales/file — the current host, so
 * preview deployments link to themselves rather than to production.
 */
export async function resolveMaterials(
  listing: SaleListing,
  rows: SaleMaterialRow[],
  selectedIds: string[],
  baseUrl: string = SITE_CONFIG.url
): Promise<ResolvedMaterial[]> {
  const wanted = new Set(selectedIds);
  const resolved: ResolvedMaterial[] = [];

  for (const row of rows) {
    if (!wanted.has(row.id)) continue;
    const file = await materialFile(row, baseUrl);
    if (file) resolved.push({ id: row.id, title: row.title, files: [file] });
  }

  if (wanted.has(PHOTO_PACK_ID) && listing.images.length > 0) {
    resolved.push({
      id: PHOTO_PACK_ID,
      title: "Photo pack",
      files: packFiles(listing, listing.images, "photo", "jpg"),
    });
  }

  const videos = videoFiles(listing);
  if (wanted.has(VIDEO_PACK_ID) && videos.length > 0) {
    resolved.push({
      id: VIDEO_PACK_ID,
      title: "Video pack",
      files: packFiles(listing, videos, "video", "mp4"),
    });
  }

  return resolved;
}
