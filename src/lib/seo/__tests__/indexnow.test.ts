import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  submitToIndexNow,
  yachtUrls,
  destinationUrls,
} from "@/lib/seo/indexnow";

describe("indexnow", () => {
  const originalKey = process.env.INDEXNOW_KEY;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) {
      delete process.env.INDEXNOW_KEY;
    } else {
      process.env.INDEXNOW_KEY = originalKey;
    }
  });

  it("skips without network call when INDEXNOW_KEY is unset", async () => {
    delete process.env.INDEXNOW_KEY;

    const result = await submitToIndexNow(["https://imperialyachting.com/fleet"]);

    expect(result).toEqual({ ok: false, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts deduped urls to the IndexNow endpoint when key is set", async () => {
    process.env.INDEXNOW_KEY = "test-key-1234567890";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    const result = await submitToIndexNow([
      "https://imperialyachting.com/fleet/a",
      "https://imperialyachting.com/fleet/a",
      "https://imperialyachting.com/fleet",
    ]);

    expect(result).toEqual({ ok: true, status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.indexnow.org/indexnow");
    const body = JSON.parse(options.body as string);
    expect(body.host).toBe("imperialyachting.com");
    expect(body.key).toBe("test-key-1234567890");
    expect(body.keyLocation).toBe(
      "https://imperialyachting.com/test-key-1234567890.txt"
    );
    expect(body.urlList).toEqual([
      "https://imperialyachting.com/fleet/a",
      "https://imperialyachting.com/fleet",
    ]);
  });

  it("caps the url list at 10000 entries", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    const urls = Array.from(
      { length: 10005 },
      (_, i) => `https://imperialyachting.com/fleet/${i}`
    );

    await submitToIndexNow(urls);

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body as string);
    expect(body.urlList).toHaveLength(10000);
  });

  it("returns ok:false with status when the API responds with an error", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    fetchMock.mockResolvedValue({ ok: false, status: 422 });

    const result = await submitToIndexNow(["https://imperialyachting.com/fleet"]);

    expect(result).toEqual({ ok: false, status: 422 });
  });

  it("never throws when fetch rejects", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await submitToIndexNow(["https://imperialyachting.com/fleet"]);

    expect(result).toEqual({ ok: false });
  });

  it("skips when the deduped url list is empty", async () => {
    process.env.INDEXNOW_KEY = "test-key";

    const result = await submitToIndexNow([]);

    expect(result).toEqual({ ok: false, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds yacht urls", () => {
    expect(yachtUrls("majesty-140")).toEqual([
      "https://imperialyachting.com/fleet/majesty-140",
      "https://imperialyachting.com/fleet",
    ]);
  });

  it("builds destination urls", () => {
    expect(destinationUrls("palm-jumeirah")).toEqual([
      "https://imperialyachting.com/destinations/palm-jumeirah",
      "https://imperialyachting.com/destinations",
    ]);
  });
});
