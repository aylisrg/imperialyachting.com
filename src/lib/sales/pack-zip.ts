import crypto from "node:crypto";
import { zipSync, type Zippable } from "fflate";
import { createAdminSupabase } from "@/lib/supabase/admin";

/**
 * Bundles a listing's gallery into one ZIP so a photo pack downloads as a
 * single file instead of a burst of separate downloads.
 *
 * The archive is built once, stored in the private materials bucket and
 * served through an expiring signed URL — so its size never touches the
 * serverless response limit. The storage key hashes the source URLs: when
 * the gallery changes, the next download builds a fresh archive and the
 * stale one is removed.
 */

/** Refuse to build archives larger than this in a single function run. */
const MAX_PACK_BYTES = 250 * 1024 * 1024;

export interface PackSource {
  /** File name inside the archive. */
  name: string;
  /** Where to fetch the original from. */
  url: string;
}

export function packKey(sources: PackSource[]): string {
  return crypto
    .createHash("sha1")
    .update(sources.map((s) => `${s.name}\n${s.url}`).join("\n"))
    .digest("hex")
    .slice(0, 12);
}

async function fetchAll(sources: PackSource[]): Promise<Zippable> {
  const entries: Zippable = {};
  let total = 0;
  for (const source of sources) {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${source.name}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    total += bytes.byteLength;
    if (total > MAX_PACK_BYTES) throw new Error("pack is too large to zip in one run");
    // Photos and videos are already compressed — store them as-is.
    entries[source.name] = [bytes, { level: 0 }];
  }
  return entries;
}

/**
 * Returns a signed download URL for the ZIP of `sources`, building and
 * storing the archive first if this exact set has not been zipped yet.
 * Throws on any failure so the caller can fall back to individual files.
 */
export async function getPackZipUrl(opts: {
  bucket: string;
  slug: string;
  kind: "photos" | "videos";
  sources: PackSource[];
  downloadName: string;
  ttlSeconds: number;
}): Promise<string> {
  const { bucket, slug, kind, sources, downloadName, ttlSeconds } = opts;
  const storage = createAdminSupabase().storage.from(bucket);
  const prefix = `${kind}-pack-`;
  const fileName = `${prefix}${packKey(sources)}.zip`;
  const path = `${slug}/${fileName}`;

  const { data: existing, error: listError } = await storage.list(slug, { search: prefix });
  if (listError) throw new Error(`list failed: ${listError.message}`);

  if (!existing?.some((f) => f.name === fileName)) {
    const archive = zipSync(await fetchAll(sources));
    const { error: uploadError } = await storage.upload(path, archive, {
      contentType: "application/zip",
      upsert: true,
    });
    if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

    const stale = (existing ?? [])
      .filter((f) => f.name.startsWith(prefix) && f.name !== fileName)
      .map((f) => `${slug}/${f.name}`);
    if (stale.length > 0) await storage.remove(stale);
  }

  const { data, error } = await storage.createSignedUrl(path, ttlSeconds, { download: downloadName });
  if (error || !data?.signedUrl) throw new Error(`sign failed: ${error?.message ?? "no url"}`);
  return data.signedUrl;
}
