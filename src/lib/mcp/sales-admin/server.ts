import type { McpServer } from "@modelcontextprotocol/server";
import type { z } from "zod";
import {
  addMaterial,
  addMaterialInputSchema,
  addMedia,
  addMediaInputSchema,
  createUploadUrlInputSchema,
  createUploadUrlTool,
  destructive,
  getListing,
  getListingInputSchema,
  listDownloads,
  listDownloadsInputSchema,
  listListings,
  listListingsInputSchema,
  readOnly,
  removeItem,
  removeItemInputSchema,
  upsertListing,
  upsertListingInputSchema,
  writes,
} from "./tools";
import type { ToolAnnotations } from "../tools/types";

interface AdminTool<S extends z.ZodObject> {
  name: string;
  title: string;
  description: string;
  inputSchema: S;
  annotations: ToolAnnotations;
  run: (input: z.infer<S>) => Promise<unknown>;
}

function tool<S extends z.ZodObject>(def: AdminTool<S>): AdminTool<S> {
  return def;
}

const TOOLS = [
  tool({
    name: "sales_list_listings",
    title: "List sale listings",
    description: "All yachts-for-sale listings including drafts: slug, status, price, download count and public URL.",
    inputSchema: listListingsInputSchema,
    annotations: readOnly,
    run: () => listListings(),
  }),
  tool({
    name: "sales_get_listing",
    title: "Get sale listing",
    description: "Full listing record with its page media, downloadable materials (ids for sales_remove_item) and download count.",
    inputSchema: getListingInputSchema,
    annotations: readOnly,
    run: getListing,
  }),
  tool({
    name: "sales_upsert_listing",
    title: "Create or update sale listing",
    description:
      "Creates a listing (name required) or updates the given fields of an existing one. Only pass fields you want to change. " +
      "Link fleet_yacht_slug to reuse the charter yacht's photos, videos and specs. Publishing pings IndexNow and refreshes sitemap/llms.txt.",
    inputSchema: upsertListingInputSchema,
    annotations: writes,
    run: upsertListing,
  }),
  tool({
    name: "sales_add_media",
    title: "Add photo/video to listing page",
    description:
      "Adds a photo, video file or YouTube link shown on the listing page (public, indexable). Files come from source_url " +
      "(copied into storage, Drive/Dropbox links OK, ≤50 MB), base64 (≤15 MB) or storage_path from sales_create_upload_url for bigger files.",
    inputSchema: addMediaInputSchema,
    annotations: writes,
    run: addMedia,
  }),
  tool({
    name: "sales_add_material",
    title: "Add downloadable material",
    description:
      "Adds an item to the email-gated material pack (brochure, spec sheet, survey, video…). Use link_url to keep an external link, " +
      "or source_url / base64 / storage_path to store a private file served via expiring signed links.",
    inputSchema: addMaterialInputSchema,
    annotations: writes,
    run: addMaterial,
  }),
  tool({
    name: "sales_create_upload_url",
    title: "Get a direct upload URL",
    description:
      "For large files (videos, hi-res packs): returns a signed PUT URL and a ready curl command. Upload the file, then register it with " +
      "sales_add_media (target=media) or sales_add_material (target=material) using the returned storage_path.",
    inputSchema: createUploadUrlInputSchema,
    annotations: writes,
    run: createUploadUrlTool,
  }),
  tool({
    name: "sales_remove_item",
    title: "Remove media or material",
    description: "Deletes a page media item or a downloadable material by id (see sales_get_listing), including its stored file.",
    inputSchema: removeItemInputSchema,
    annotations: destructive,
    run: removeItem,
  }),
  tool({
    name: "sales_list_downloads",
    title: "Who downloaded materials",
    description: "Download log, newest first: email, broker flag, company, registered client, materials taken.",
    inputSchema: listDownloadsInputSchema,
    annotations: readOnly,
    run: listDownloads,
  }),
];

/** Registers the owner-only sales tools. Mounted only on the token-protected /api/mcp/sales. */
export function registerSalesAdminServer(server: McpServer): void {
  for (const def of TOOLS) {
    server.registerTool(
      def.name,
      {
        title: def.title,
        description: def.description,
        inputSchema: def.inputSchema,
        annotations: def.annotations,
      },
      async (input: unknown) => {
        try {
          const result = await (def.run as (i: unknown) => Promise<unknown>)(input);
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { content: [{ type: "text" as const, text: message }], isError: true };
        }
      }
    );
  }
}

export const SALES_ADMIN_TOOL_NAMES = TOOLS.map((t) => t.name);
