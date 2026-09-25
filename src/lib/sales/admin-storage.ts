import { createAdminSupabase } from "@/lib/supabase/admin";

/**
 * Storage helpers for the private sales-admin MCP tools: uploads into the
 * public `sale-media` / private `sale-materials` buckets, signed upload URLs
 * for large files, and a guarded fetch for "copy this URL into storage".
 */

/** Files fetched server-side are capped — larger ones go through a signed upload URL. */
export const MAX_REMOTE_BYTES = 50 * 1024 * 1024;
/** base64 payloads travel inside a JSON-RPC message, keep them modest. */
export const MAX_BASE64_BYTES = 15 * 1024 * 1024;

const EXT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  zip: "application/zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function guessContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TYPES[ext] ?? "application/octet-stream";
}

/** Lowercase, URL-safe file name that keeps its extension. */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-\./g, ".")
    .replace(/^[-.]+|[-.]+$/g, "");
  return cleaned || "file";
}

/** `<listing-slug>/<timestamp>-<file>` — unique, grouped per listing. */
export function storagePathFor(slug: string, fileName: string, now: number = Date.now()): string {
  return `${slug}/${now}-${safeFileName(fileName)}`;
}

/** Turns a Google Drive "view" share link into a direct-download link. */
export function directDownloadUrl(url: string): string {
  const drive = /drive\.google\.com\/file\/d\/([\w-]+)/.exec(url);
  if (drive) return `https://drive.google.com/uc?export=download&id=${drive[1]}`;
  if (/dropbox\.com\//.test(url)) {
    const u = new URL(url);
    u.searchParams.set("dl", "1");
    return u.toString();
  }
  return url;
}

const PRIVATE_HOST =
  /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|\[?::1\]?|\[?f[cd][0-9a-f]{2}:.*)$/i;

/** Rejects non-https URLs and obvious internal hosts before fetching. */
export function assertFetchableUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Not a valid URL.");
  }
  if (url.protocol !== "https:") throw new Error("Only https:// URLs can be fetched.");
  if (PRIVATE_HOST.test(url.hostname)) throw new Error("That host is not allowed.");
  return url;
}

export interface FetchedFile {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
}

/** Downloads a remote file with a hard size cap. */
export async function fetchRemoteFile(
  rawUrl: string,
  maxBytes: number = MAX_REMOTE_BYTES
): Promise<FetchedFile> {
  const url = assertFetchableUrl(directDownloadUrl(rawUrl));
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) {
    throw new Error(`Could not download the file (HTTP ${response.status}).`);
  }
  assertFetchableUrl(response.url || url.toString());

  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > maxBytes) {
    throw new Error(
      `File is ${(declared / 1048576).toFixed(0)} MB — over the ${maxBytes / 1048576} MB limit. Use sales_create_upload_url instead.`
    );
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(
        `File is over the ${maxBytes / 1048576} MB limit. Use sales_create_upload_url instead.`
      );
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const fromHeader = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)?.[1];
  const fromPath = decodeURIComponent(new URL(response.url || url.toString()).pathname.split("/").pop() ?? "");
  const fileName = fromHeader || fromPath || "file";
  const contentType =
    response.headers.get("content-type")?.split(";")[0].trim() || guessContentType(fileName);

  return { bytes, contentType, fileName };
}

/** Decodes a base64 (or data: URL) payload with a size cap. */
export function decodeBase64(payload: string, maxBytes: number = MAX_BASE64_BYTES): Uint8Array {
  const data = payload.includes(",") && payload.startsWith("data:") ? payload.split(",")[1] : payload;
  const buffer = Buffer.from(data, "base64");
  if (buffer.length === 0) throw new Error("The base64 payload is empty.");
  if (buffer.length > maxBytes) {
    throw new Error(
      `Payload is over the ${maxBytes / 1048576} MB base64 limit. Use sales_create_upload_url instead.`
    );
  }
  return new Uint8Array(buffer);
}

export async function uploadToBucket(
  bucket: string,
  path: string,
  bytes: Uint8Array,
  contentType: string
): Promise<void> {
  const { error } = await createAdminSupabase()
    .storage.from(bucket)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export function publicObjectUrl(bucket: string, path: string): string {
  return createAdminSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function createUploadUrl(
  bucket: string,
  path: string
): Promise<{ signedUrl: string; path: string }> {
  const { data, error } = await createAdminSupabase()
    .storage.from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Could not create an upload URL: ${error?.message ?? "unknown error"}`);
  return { signedUrl: data.signedUrl, path: data.path };
}

export async function removeFromBucket(bucket: string, path: string): Promise<void> {
  const { error } = await createAdminSupabase().storage.from(bucket).remove([path]);
  if (error) console.error(`[sales] could not remove ${bucket}/${path}:`, error.message);
}
