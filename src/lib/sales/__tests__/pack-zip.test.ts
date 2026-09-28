import { describe, it, expect, vi, beforeEach } from "vitest";
import { unzipSync, strFromU8 } from "fflate";

const list = vi.fn();
const upload = vi.fn();
const remove = vi.fn();
const createSignedUrl = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: () => ({
    storage: { from: () => ({ list, upload, remove, createSignedUrl }) },
  }),
}));

import { getPackZipUrl, packKey } from "@/lib/sales/pack-zip";

const sources = [
  { name: "vd-photo-01.jpg", url: "https://cdn/1.jpg" },
  { name: "vd-photo-02.jpg", url: "https://cdn/2.jpg" },
];
const opts = {
  bucket: "sale-materials",
  slug: "vd",
  kind: "photos" as const,
  sources,
  downloadName: "vd-photos.zip",
  ttlSeconds: 60,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => new Response(`bytes of ${url}`))
  );
  upload.mockResolvedValue({ error: null });
  remove.mockResolvedValue({ error: null });
  createSignedUrl.mockResolvedValue({ data: { signedUrl: "https://signed/zip" }, error: null });
});

describe("getPackZipUrl", () => {
  it("builds the archive once, drops stale versions and returns a signed link", async () => {
    list.mockResolvedValue({ data: [{ name: "photos-pack-old.zip" }], error: null });

    const url = await getPackZipUrl(opts);

    expect(url).toBe("https://signed/zip");
    const [path, archive, options] = upload.mock.calls[0];
    expect(path).toBe(`vd/photos-pack-${packKey(sources)}.zip`);
    expect(options).toMatchObject({ contentType: "application/zip" });
    const files = unzipSync(archive as Uint8Array);
    expect(Object.keys(files).sort()).toEqual(["vd-photo-01.jpg", "vd-photo-02.jpg"]);
    expect(strFromU8(files["vd-photo-01.jpg"])).toBe("bytes of https://cdn/1.jpg");
    expect(remove).toHaveBeenCalledWith(["vd/photos-pack-old.zip"]);
    expect(createSignedUrl).toHaveBeenCalledWith(path, 60, { download: "vd-photos.zip" });
  });

  it("reuses an existing archive for the same gallery", async () => {
    list.mockResolvedValue({ data: [{ name: `photos-pack-${packKey(sources)}.zip` }], error: null });
    await getPackZipUrl(opts);
    expect(upload).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("gets a new key when the gallery changes", () => {
    expect(packKey(sources)).not.toBe(packKey([sources[1], sources[0]]));
  });

  it("throws when a photo can't be fetched, so callers can fall back", async () => {
    list.mockResolvedValue({ data: [], error: null });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));
    await expect(getPackZipUrl(opts)).rejects.toThrow(/HTTP 404/);
    expect(upload).not.toHaveBeenCalled();
  });
});
