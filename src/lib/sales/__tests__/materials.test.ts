import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SaleMaterialRow } from "@/lib/supabase/types";

const createSignedUrl = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  isAdminSupabaseConfigured: () => true,
  createAdminSupabase: () => ({
    storage: { from: () => ({ createSignedUrl: (...args: unknown[]) => createSignedUrl(...args) }) },
  }),
}));

import {
  buildMaterialSummaries,
  PHOTO_PACK_ID,
  resolveMaterials,
  VIDEO_PACK_ID,
  withDownloadName,
} from "@/lib/sales/materials";
import { mergeSaleListing } from "@/lib/sales/merge";
import { verifyFileToken } from "@/lib/sales/file-token";
import { fleetYacht, mediaRow, saleRow } from "./fixtures";

function material(overrides: Partial<SaleMaterialRow>): SaleMaterialRow {
  return {
    id: "mat-1",
    listing_id: "listing-1",
    title: "Technical specification (PDF)",
    description: "4 pages.",
    category: "specification",
    source: "bundled",
    location: "van-dutch-connect/technical-specification.pdf",
    file_name: "Spec.pdf",
    mime_type: "application/pdf",
    size_bytes: 1122467,
    active: true,
    sort_order: 0,
    created_at: "2026-09-25T00:00:00Z",
    ...overrides,
  };
}

const listing = mergeSaleListing(
  saleRow(),
  [mediaRow({ kind: "video", url: "https://x.supabase.co/storage/v1/object/public/sale-media/tour.mp4" })],
  fleetYacht()
);

beforeEach(() => {
  process.env.SALES_FILE_SECRET = "test-secret";
  createSignedUrl.mockReset();
});

describe("buildMaterialSummaries", () => {
  it("lists stored materials, then the photo and video packs, without exposing locations", () => {
    const items = buildMaterialSummaries(listing, [
      material({}),
      material({ id: "mat-2", title: "4K footage", source: "url", location: "https://drive.google.com/x" }),
    ]);

    expect(items.map((i) => i.id)).toEqual(["mat-1", "mat-2", PHOTO_PACK_ID, VIDEO_PACK_ID]);
    expect(items[1].kind).toBe("link");
    expect(items[2]).toMatchObject({ fileCount: 2, description: expect.stringContaining("2 photos") });
    expect(JSON.stringify(items)).not.toContain("drive.google.com");
    expect(JSON.stringify(items)).not.toContain("technical-specification.pdf");
  });
});

describe("resolveMaterials", () => {
  it("signs bundled files, forces downloads for gallery photos and keeps links as links", async () => {
    const resolved = await resolveMaterials(
      listing,
      [material({}), material({ id: "mat-2", title: "Drive", source: "url", location: "https://drive.google.com/x" })],
      ["mat-1", "mat-2", PHOTO_PACK_ID, "unknown"]
    );

    expect(resolved.map((r) => r.id)).toEqual(["mat-1", "mat-2", PHOTO_PACK_ID]);

    const pdf = resolved[0].files[0];
    expect(pdf.url).toMatch(/\/api\/sales\/file\?t=/);
    const token = decodeURIComponent(pdf.url.split("t=")[1]);
    expect(verifyFileToken(token)?.location).toBe("van-dutch-connect/technical-specification.pdf");

    expect(resolved[1].files[0]).toEqual({ name: "Drive", url: "https://drive.google.com/x", kind: "link" });

    const photos = resolved[2].files;
    expect(photos.map((f) => f.name)).toEqual([
      "vandutch-40-van-dutch-connect-photo-01.jpg",
      "vandutch-40-van-dutch-connect-photo-02.webp",
    ]);
    expect(photos[0].url).toContain("download=vandutch-40-van-dutch-connect-photo-01.jpg");
  });

  it("signs private storage objects and drops the ones that fail", async () => {
    createSignedUrl
      .mockResolvedValueOnce({ data: { signedUrl: "https://signed/brochure" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "not found" } });

    const resolved = await resolveMaterials(
      listing,
      [
        material({ id: "a", source: "storage", location: "slug/brochure.pdf", file_name: "Brochure.pdf" }),
        material({ id: "b", source: "storage", location: "slug/gone.pdf" }),
      ],
      ["a", "b", VIDEO_PACK_ID]
    );

    expect(createSignedUrl).toHaveBeenCalledWith("slug/brochure.pdf", 604800, { download: "Brochure.pdf" });
    expect(resolved.map((r) => r.id)).toEqual(["a", VIDEO_PACK_ID]);
    expect(resolved[1].files[0].name).toBe("vandutch-40-van-dutch-connect-video-01.mp4");
  });
});

describe("withDownloadName", () => {
  it("only rewrites Supabase public object URLs", () => {
    expect(withDownloadName("https://x.supabase.co/storage/v1/object/public/b/a.jpg", "a b.jpg")).toBe(
      "https://x.supabase.co/storage/v1/object/public/b/a.jpg?download=a+b.jpg"
    );
    expect(withDownloadName("https://example.com/a.jpg", "a.jpg")).toBe("https://example.com/a.jpg");
  });
});
