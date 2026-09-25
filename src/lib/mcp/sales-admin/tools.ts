import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type {
  Database,
  SaleListingRow,
  SaleMaterialRow,
  SaleMediaRow,
} from "@/lib/supabase/types";
import { SITE_CONFIG } from "@/lib/constants";
import { saleListingUrls, submitToIndexNow } from "@/lib/seo/indexnow";
import { SALE_MATERIALS_BUCKET, SALE_MEDIA_BUCKET } from "@/lib/sales/materials";
import {
  createUploadUrl,
  decodeBase64,
  fetchRemoteFile,
  guessContentType,
  publicObjectUrl,
  removeFromBucket,
  storagePathFor,
  uploadToBucket,
} from "@/lib/sales/admin-storage";
import type { ToolAnnotations } from "../tools/types";

/**
 * Owner-only tools behind /api/mcp/sales (token-protected). Unlike the public
 * booking tools they write: listings, photos, videos and gated materials,
 * and they read the download log. Every function returns a JSON-able result;
 * `server.ts` turns thrown errors into `isError` tool results.
 */

type ListingInsert = Database["public"]["Tables"]["sale_listings"]["Insert"];

const slugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase-kebab-case, e.g. vandutch-40-van-dutch-connect")
  .describe("Listing URL slug: the page lives at /yachts-for-sale/<slug>.");

function listingUrl(slug: string): string {
  return `${SITE_CONFIG.url}/yachts-for-sale/${slug}`;
}

function refreshPages(slug: string, status: string): void {
  for (const path of ["/yachts-for-sale", `/yachts-for-sale/${slug}`, "/sitemap.xml", "/llms.txt", "/llms-full.txt"]) {
    try {
      revalidatePath(path);
    } catch {
      // Outside a Next request (tests/scripts) there is nothing to revalidate.
    }
  }
  if (status !== "draft") void submitToIndexNow(saleListingUrls(slug));
}

async function getListingRow(slug: string): Promise<SaleListingRow> {
  const { data, error } = await createAdminSupabase()
    .from("sale_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Database error: ${error.message}`);
  if (!data) throw new Error(`No listing with slug "${slug}". Call sales_list_listings to see all slugs.`);
  return data as SaleListingRow;
}

// ── sales_list_listings ───────────────────────────────────────────────
export const listListingsInputSchema = z.object({});

export async function listListings() {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("sale_listings")
    .select("id, slug, status, name, model, fleet_yacht_slug, price_amount, price_currency, updated_at")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Database error: ${error.message}`);

  const rows = (data ?? []) as Array<Pick<SaleListingRow, "id" | "slug" | "status" | "name" | "model" | "fleet_yacht_slug" | "price_amount" | "price_currency" | "updated_at">>;
  const { data: downloads } = await supabase
    .from("sale_download_requests")
    .select("listing_slug");
  const counts = new Map<string, number>();
  for (const d of (downloads ?? []) as Array<{ listing_slug: string }>) {
    counts.set(d.listing_slug, (counts.get(d.listing_slug) ?? 0) + 1);
  }

  return {
    listings: rows.map((r) => ({
      ...r,
      downloads: counts.get(r.slug) ?? 0,
      url: listingUrl(r.slug),
    })),
  };
}

// ── sales_get_listing ─────────────────────────────────────────────────
export const getListingInputSchema = z.object({ slug: slugSchema });

export async function getListing(input: z.infer<typeof getListingInputSchema>) {
  const row = await getListingRow(input.slug);
  const supabase = createAdminSupabase();
  const [media, materials, downloads] = await Promise.all([
    supabase.from("sale_media").select("*").eq("listing_id", row.id).order("sort_order"),
    supabase.from("sale_materials").select("*").eq("listing_id", row.id).order("sort_order"),
    supabase
      .from("sale_download_requests")
      .select("id", { count: "exact", head: true })
      .eq("listing_slug", row.slug),
  ]);
  return {
    listing: row,
    media: (media.data ?? []) as SaleMediaRow[],
    materials: (materials.data ?? []) as SaleMaterialRow[],
    downloads: downloads.count ?? 0,
    url: listingUrl(row.slug),
    note: "Empty listing fields (year, length, guests, specs, photos, videos) are filled from the linked fleet yacht (fleet_yacht_slug) on the page.",
  };
}

// ── sales_upsert_listing ──────────────────────────────────────────────
const specSectionSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
});

export const upsertListingInputSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200).optional().describe("Vessel name, e.g. \"Van Dutch Connect\". Required when creating."),
  status: z
    .enum(["draft", "published", "under_offer", "sold"])
    .optional()
    .describe("draft = hidden (404); published = Available; under_offer; sold (page stays, downloads close)."),
  fleet_yacht_slug: z
    .string()
    .nullable()
    .optional()
    .describe("Slug of the charter-fleet yacht (/fleet/<slug>) to borrow photos, videos and specs from, e.g. \"vd-40\"."),
  builder: z.string().max(200).nullable().optional(),
  model: z.string().max(200).nullable().optional(),
  year_built: z.number().int().min(1900).max(2100).nullable().optional(),
  refit_year: z.number().int().min(1900).max(2100).nullable().optional(),
  length_m: z.number().positive().nullable().optional(),
  beam_m: z.number().positive().nullable().optional(),
  draft_m: z.number().positive().nullable().optional(),
  guests: z.number().int().positive().nullable().optional(),
  cabins: z.number().int().min(0).nullable().optional(),
  engines: z.string().max(300).nullable().optional(),
  top_speed_kn: z.number().positive().nullable().optional(),
  lying: z.string().max(200).nullable().optional(),
  flag: z.string().max(100).nullable().optional(),
  price_amount: z.number().int().positive().nullable().optional().describe("Asking price; null = price on application."),
  price_currency: z.string().length(3).optional(),
  headline: z.string().max(300).nullable().optional(),
  summary: z.string().max(400).nullable().optional().describe("1–2 sentences for cards, meta description and llms.txt."),
  description: z.string().max(6000).nullable().optional().describe("Paragraphs separated by a blank line. Keep it short — brokers skim."),
  highlights: z.array(z.string().max(200)).max(12).optional(),
  features: z.array(z.string().max(200)).max(40).optional(),
  spec_sections: z.array(specSectionSchema).max(12).optional(),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).max(12).optional(),
  seo_title: z.string().max(120).nullable().optional(),
  seo_description: z.string().max(300).nullable().optional(),
  keywords: z.array(z.string().max(100)).max(20).optional(),
  hero_image: z.string().url().nullable().optional(),
  broker_terms: z.string().max(500).nullable().optional().describe("Co-brokerage terms shown under the download form."),
  sort_order: z.number().int().optional(),
});

export async function upsertListing(input: z.infer<typeof upsertListingInputSchema>) {
  const supabase = createAdminSupabase();
  const { data: existing, error: readError } = await supabase
    .from("sale_listings")
    .select("*")
    .eq("slug", input.slug)
    .maybeSingle();
  if (readError) throw new Error(`Database error: ${readError.message}`);

  const fields = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<SaleListingRow>;

  const current = existing as SaleListingRow | null;
  const status = fields.status ?? current?.status ?? "draft";
  if (status !== "draft" && !current?.published_at) {
    fields.published_at = new Date().toISOString();
  }

  let saved: SaleListingRow;
  if (current) {
    const { data, error } = await supabase
      .from("sale_listings")
      .update(fields)
      .eq("id", current.id)
      .select("*")
      .single();
    if (error) throw new Error(`Database error: ${error.message}`);
    saved = data as SaleListingRow;
  } else {
    if (!fields.name) throw new Error("`name` is required when creating a new listing.");
    const { data, error } = await supabase
      .from("sale_listings")
      .insert(fields as ListingInsert)
      .select("*")
      .single();
    if (error) throw new Error(`Database error: ${error.message}`);
    saved = data as SaleListingRow;
  }

  refreshPages(saved.slug, saved.status);
  return {
    created: !current,
    slug: saved.slug,
    status: saved.status,
    url: listingUrl(saved.slug),
  };
}

// ── sales_add_media ───────────────────────────────────────────────────
export const addMediaInputSchema = z.object({
  slug: slugSchema,
  kind: z.enum(["image", "video", "youtube"]),
  youtube_url: z.string().url().optional().describe("For kind=youtube: the YouTube link."),
  source_url: z
    .string()
    .url()
    .optional()
    .describe("https link to a photo/video (Google Drive and Dropbox share links work) — copied into site storage. Max 50 MB."),
  base64: z.string().optional().describe("File content as base64 or a data: URL. Max 15 MB."),
  storage_path: z
    .string()
    .optional()
    .describe("Path returned by sales_create_upload_url (target=media) after you PUT the file there."),
  file_name: z.string().max(200).optional(),
  content_type: z.string().max(100).optional(),
  caption: z.string().max(300).optional(),
  sort_order: z.number().int().optional(),
});

export async function addMedia(input: z.infer<typeof addMediaInputSchema>) {
  const listing = await getListingRow(input.slug);
  let url: string;
  let storagePath: string | null = null;

  if (input.kind === "youtube") {
    if (!input.youtube_url) throw new Error("kind=youtube needs `youtube_url`.");
    url = input.youtube_url;
  } else if (input.storage_path) {
    storagePath = input.storage_path;
    url = publicObjectUrl(SALE_MEDIA_BUCKET, storagePath);
  } else if (input.base64 || input.source_url) {
    const file = input.base64
      ? {
          bytes: decodeBase64(input.base64),
          fileName: input.file_name ?? (input.kind === "image" ? "photo.jpg" : "video.mp4"),
          contentType: "",
        }
      : await fetchRemoteFile(input.source_url!);
    const fileName = input.file_name ?? file.fileName;
    storagePath = storagePathFor(listing.slug, fileName);
    await uploadToBucket(
      SALE_MEDIA_BUCKET,
      storagePath,
      file.bytes,
      input.content_type ?? (file.contentType || guessContentType(fileName))
    );
    url = publicObjectUrl(SALE_MEDIA_BUCKET, storagePath);
  } else {
    throw new Error("Provide one of: source_url, base64, storage_path (or youtube_url for kind=youtube).");
  }

  const { data, error } = await createAdminSupabase()
    .from("sale_media")
    .insert({
      listing_id: listing.id,
      kind: input.kind,
      url,
      storage_path: storagePath,
      caption: input.caption ?? "",
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Database error: ${error.message}`);

  refreshPages(listing.slug, listing.status);
  return { id: (data as { id: string }).id, kind: input.kind, url, listing: listingUrl(listing.slug) };
}

// ── sales_add_material ────────────────────────────────────────────────
export const addMaterialInputSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200).describe("What the checkbox says, e.g. \"Technical specification (PDF)\"."),
  description: z.string().max(300).optional(),
  category: z
    .enum(["specification", "brochure", "photos", "video", "survey", "document", "other"])
    .default("document"),
  link_url: z
    .string()
    .url()
    .optional()
    .describe("Keep as an external link (e.g. a Drive folder with 4K video) instead of copying a file."),
  source_url: z.string().url().optional().describe("https link to a file to copy into private storage. Max 50 MB."),
  base64: z.string().optional().describe("File content as base64 or a data: URL. Max 15 MB."),
  storage_path: z
    .string()
    .optional()
    .describe("Path returned by sales_create_upload_url (target=material) after you PUT the file there."),
  file_name: z.string().max(200).optional().describe("Download name, e.g. \"VanDutch-40-Brochure.pdf\"."),
  content_type: z.string().max(100).optional(),
  size_bytes: z.number().int().positive().optional(),
  sort_order: z.number().int().optional(),
});

export async function addMaterial(input: z.infer<typeof addMaterialInputSchema>) {
  const listing = await getListingRow(input.slug);
  let source: SaleMaterialRow["source"];
  let location: string;
  let fileName = input.file_name ?? "";
  let mimeType = input.content_type ?? "";
  let sizeBytes = input.size_bytes ?? null;

  if (input.link_url) {
    source = "url";
    location = input.link_url;
    fileName = fileName || input.title;
    mimeType = mimeType || "text/html";
  } else if (input.storage_path) {
    source = "storage";
    location = input.storage_path;
    fileName = fileName || location.split("/").pop() || "file";
  } else if (input.base64 || input.source_url) {
    const file = input.base64
      ? { bytes: decodeBase64(input.base64), fileName: fileName || "document.pdf", contentType: "" }
      : await fetchRemoteFile(input.source_url!);
    fileName = fileName || file.fileName;
    mimeType = mimeType || file.contentType;
    sizeBytes = file.bytes.byteLength;
    source = "storage";
    location = storagePathFor(listing.slug, fileName);
    await uploadToBucket(SALE_MATERIALS_BUCKET, location, file.bytes, mimeType || guessContentType(fileName));
  } else {
    throw new Error("Provide one of: link_url, source_url, base64, storage_path.");
  }

  const { data, error } = await createAdminSupabase()
    .from("sale_materials")
    .insert({
      listing_id: listing.id,
      title: input.title,
      description: input.description ?? "",
      category: input.category,
      source,
      location,
      file_name: fileName,
      mime_type: mimeType || guessContentType(fileName),
      size_bytes: sizeBytes,
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Database error: ${error.message}`);

  refreshPages(listing.slug, listing.status);
  return { id: (data as { id: string }).id, source, file_name: fileName, listing: listingUrl(listing.slug) };
}

// ── sales_create_upload_url ───────────────────────────────────────────
export const createUploadUrlInputSchema = z.object({
  slug: slugSchema,
  target: z
    .enum(["media", "material"])
    .describe("media = shown on the page (public); material = gated download (private)."),
  file_name: z.string().min(1).max(200),
  content_type: z.string().max(100).optional(),
});

export async function createUploadUrlTool(input: z.infer<typeof createUploadUrlInputSchema>) {
  const listing = await getListingRow(input.slug);
  const bucket = input.target === "media" ? SALE_MEDIA_BUCKET : SALE_MATERIALS_BUCKET;
  const contentType = input.content_type ?? guessContentType(input.file_name);
  const { signedUrl, path } = await createUploadUrl(bucket, storagePathFor(listing.slug, input.file_name));
  return {
    upload_url: signedUrl,
    storage_path: path,
    content_type: contentType,
    curl: `curl -X PUT -H "Content-Type: ${contentType}" --data-binary @"${input.file_name}" "${signedUrl}"`,
    next_step:
      input.target === "media"
        ? `After the upload, call sales_add_media with slug="${listing.slug}", kind="image" or "video", storage_path="${path}".`
        : `After the upload, call sales_add_material with slug="${listing.slug}", title, storage_path="${path}", file_name="${input.file_name}".`,
    expires: "The upload URL is valid for 2 hours.",
  };
}

// ── sales_remove_item ─────────────────────────────────────────────────
export const removeItemInputSchema = z.object({
  type: z.enum(["media", "material"]),
  id: z.string().uuid(),
});

export async function removeItem(input: z.infer<typeof removeItemInputSchema>) {
  const supabase = createAdminSupabase();
  const table = input.type === "media" ? "sale_media" : "sale_materials";
  const { data, error } = await supabase.from(table).delete().eq("id", input.id).select("*").maybeSingle();
  if (error) throw new Error(`Database error: ${error.message}`);
  if (!data) throw new Error(`No ${input.type} with id ${input.id}.`);

  if (input.type === "media") {
    const row = data as SaleMediaRow;
    if (row.storage_path) await removeFromBucket(SALE_MEDIA_BUCKET, row.storage_path);
  } else {
    const row = data as SaleMaterialRow;
    if (row.source === "storage") await removeFromBucket(SALE_MATERIALS_BUCKET, row.location);
  }

  const { data: listing } = await supabase
    .from("sale_listings")
    .select("slug, status")
    .eq("id", (data as { listing_id: string }).listing_id)
    .maybeSingle();
  if (listing) refreshPages((listing as SaleListingRow).slug, (listing as SaleListingRow).status);
  return { removed: input.id };
}

// ── sales_list_downloads ──────────────────────────────────────────────
export const listDownloadsInputSchema = z.object({
  slug: slugSchema.optional().describe("Only this listing; omit for all."),
  brokers_only: z.boolean().optional(),
  limit: z.number().int().min(1).max(500).default(50),
});

export async function listDownloads(input: z.infer<typeof listDownloadsInputSchema>) {
  let query = createAdminSupabase()
    .from("sale_download_requests")
    .select("created_at, listing_slug, email, is_broker, company, client_name, materials")
    .order("created_at", { ascending: false })
    .limit(input.limit);
  if (input.slug) query = query.eq("listing_slug", input.slug);
  if (input.brokers_only) query = query.eq("is_broker", true);
  const { data, error } = await query;
  if (error) throw new Error(`Database error: ${error.message}`);
  return { downloads: data ?? [] };
}

export const readOnly: ToolAnnotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };
export const writes: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: true };
export const destructive: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };
