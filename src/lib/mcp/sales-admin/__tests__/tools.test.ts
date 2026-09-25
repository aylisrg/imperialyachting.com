import { describe, it, expect, vi, beforeEach } from "vitest";
import { saleRow } from "@/lib/sales/__tests__/fixtures";

/**
 * Minimal chainable Supabase stand-in: every builder method returns the
 * builder, and awaiting it (or .single()/.maybeSingle()) resolves to the
 * next queued result for that table.
 */
const queued: Record<string, Array<{ data: unknown; error: unknown; count?: number }>> = {};
const calls: Array<{ table: string; op: string; args: unknown[] }> = [];

function builder(table: string) {
  const next = () => Promise.resolve(queued[table]?.shift() ?? { data: null, error: null });
  const b: Record<string, unknown> = {};
  for (const op of ["select", "insert", "update", "delete", "eq", "neq", "order", "limit", "in"]) {
    b[op] = (...args: unknown[]) => {
      calls.push({ table, op, args });
      return b;
    };
  }
  b.single = next;
  b.maybeSingle = next;
  b.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => next().then(resolve, reject);
  return b;
}

const createSignedUploadUrl = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  isAdminSupabaseConfigured: () => true,
  createAdminSupabase: () => ({
    from: (table: string) => builder(table),
    storage: {
      from: () => ({
        createSignedUploadUrl: (...args: unknown[]) => createSignedUploadUrl(...args),
      }),
    },
  }),
}));

const submitToIndexNow = vi.fn();
vi.mock("@/lib/seo/indexnow", () => ({
  submitToIndexNow: (...args: unknown[]) => submitToIndexNow(...args),
  saleListingUrls: (slug: string) => [`https://imperialyachting.com/yachts-for-sale/${slug}`],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  addMaterial,
  createUploadUrlTool,
  upsertListing,
  upsertListingInputSchema,
} from "../tools";

beforeEach(() => {
  for (const key of Object.keys(queued)) delete queued[key];
  calls.length = 0;
  vi.clearAllMocks();
});

describe("sales_upsert_listing", () => {
  it("creates a draft without pinging IndexNow", async () => {
    queued.sale_listings = [
      { data: null, error: null },
      { data: saleRow({ slug: "new-yacht", status: "draft" }), error: null },
    ];
    const result = await upsertListing(upsertListingInputSchema.parse({ slug: "new-yacht", name: "New" }));

    expect(result).toMatchObject({ created: true, status: "draft", url: "https://imperialyachting.com/yachts-for-sale/new-yacht" });
    const insert = calls.find((c) => c.op === "insert");
    expect(insert?.args[0]).toEqual({ slug: "new-yacht", name: "New" });
    expect(submitToIndexNow).not.toHaveBeenCalled();
  });

  it("requires a name when creating", async () => {
    queued.sale_listings = [{ data: null, error: null }];
    await expect(upsertListing(upsertListingInputSchema.parse({ slug: "new-yacht" }))).rejects.toThrow(/name/);
  });

  it("updates only the passed fields, stamps published_at and pings IndexNow", async () => {
    queued.sale_listings = [
      { data: saleRow({ status: "draft", published_at: null }), error: null },
      { data: saleRow({ status: "published" }), error: null },
    ];
    await upsertListing(
      upsertListingInputSchema.parse({ slug: "vandutch-40-van-dutch-connect", status: "published", price_amount: 950000 })
    );

    const update = calls.find((c) => c.op === "update")?.args[0] as Record<string, unknown>;
    expect(Object.keys(update).sort()).toEqual(["price_amount", "published_at", "slug", "status"]);
    expect(submitToIndexNow).toHaveBeenCalledWith(["https://imperialyachting.com/yachts-for-sale/vandutch-40-van-dutch-connect"]);
  });

  it("rejects slugs that aren't kebab-case", () => {
    expect(() => upsertListingInputSchema.parse({ slug: "Van Dutch" })).toThrow();
  });
});

describe("sales_add_material", () => {
  it("stores an external link without copying anything", async () => {
    queued.sale_listings = [{ data: saleRow(), error: null }];
    queued.sale_materials = [{ data: { id: "mat-9" }, error: null }];

    const result = await addMaterial({
      slug: "vandutch-40-van-dutch-connect",
      title: "4K drone footage",
      category: "video",
      link_url: "https://drive.google.com/drive/folders/abc",
    });

    expect(result).toMatchObject({ id: "mat-9", source: "url" });
    expect(calls.find((c) => c.table === "sale_materials" && c.op === "insert")?.args[0]).toMatchObject({
      listing_id: "listing-1",
      source: "url",
      location: "https://drive.google.com/drive/folders/abc",
    });
  });

  it("explains what is missing when no file source is given", async () => {
    queued.sale_listings = [{ data: saleRow(), error: null }];
    await expect(
      addMaterial({ slug: "vandutch-40-van-dutch-connect", title: "x", category: "document" })
    ).rejects.toThrow(/link_url, source_url, base64, storage_path/);
  });

  it("fails clearly for an unknown listing", async () => {
    queued.sale_listings = [{ data: null, error: null }];
    await expect(
      addMaterial({ slug: "nope-yacht", title: "x", category: "document", link_url: "https://a.b" })
    ).rejects.toThrow(/No listing with slug "nope-yacht"/);
  });
});

describe("sales_create_upload_url", () => {
  it("returns a signed PUT url and the follow-up call", async () => {
    queued.sale_listings = [{ data: saleRow(), error: null }];
    createSignedUploadUrl.mockResolvedValue({
      data: { signedUrl: "https://x.supabase.co/upload?token=t", path: "vandutch-40-van-dutch-connect/1-tour.mp4" },
      error: null,
    });

    const result = await createUploadUrlTool({
      slug: "vandutch-40-van-dutch-connect",
      target: "material",
      file_name: "Tour.mp4",
    });

    expect(result.storage_path).toBe("vandutch-40-van-dutch-connect/1-tour.mp4");
    expect(result.curl).toContain('-H "Content-Type: video/mp4"');
    expect(result.next_step).toContain("sales_add_material");
  });
});
