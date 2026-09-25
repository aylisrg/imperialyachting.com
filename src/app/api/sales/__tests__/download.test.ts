import { describe, it, expect, vi, beforeEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";
import { mergeSaleListing } from "@/lib/sales/merge";
import { saleRow } from "@/lib/sales/__tests__/fixtures";

const fetchSaleListingBySlug = vi.fn();
vi.mock("@/lib/sales/listings-db", () => ({
  fetchSaleListingBySlug: (...args: unknown[]) => fetchSaleListingBySlug(...args),
}));

const fetchSaleMaterialRows = vi.fn();
const resolveMaterials = vi.fn();
vi.mock("@/lib/sales/materials", () => ({
  fetchSaleMaterialRows: (...args: unknown[]) => fetchSaleMaterialRows(...args),
  resolveMaterials: (...args: unknown[]) => resolveMaterials(...args),
}));

const mockInsert = vi.fn();
const mockCount = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  isAdminSupabaseConfigured: () => true,
  createAdminSupabase: () => ({
    from: () => ({
      insert: (...args: unknown[]) => mockInsert(...args),
      select: () => ({ eq: () => ({ eq: () => mockCount() }) }),
    }),
  }),
}));

const notifySaleDownload = vi.fn();
vi.mock("@/lib/notify", () => ({
  notifySaleDownload: (...args: unknown[]) => notifySaleDownload(...args),
}));

const listing = mergeSaleListing(saleRow(), [], null);
const pdf = { name: "Spec.pdf", url: "https://imperialyachting.com/api/sales/file?t=x", kind: "file" as const };

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("https://imperialyachting.com/api/sales/download", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip, "x-vercel-ip-country": "DE" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  slug: listing.slug,
  email: "Broker@Example.com",
  materialIds: ["mat-1"],
  isBroker: true,
  company: "Blue Water Brokers",
  clientName: "Mr. K",
};

describe("POST /api/sales/download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStateForTests();
    fetchSaleListingBySlug.mockResolvedValue(listing);
    fetchSaleMaterialRows.mockResolvedValue([]);
    resolveMaterials.mockResolvedValue([{ id: "mat-1", title: "Spec", files: [pdf] }]);
    mockInsert.mockResolvedValue({ error: null });
    mockCount.mockResolvedValue({ count: 2 });
    notifySaleDownload.mockResolvedValue(undefined);
  });

  it("rejects an invalid email or empty selection", async () => {
    const { POST } = await import("../download/route");
    expect((await POST(makeRequest({ ...validBody, email: "nope" }))).status).toBe(400);
    expect((await POST(makeRequest({ ...validBody, materialIds: [] }))).status).toBe(400);
    expect(notifySaleDownload).not.toHaveBeenCalled();
  });

  it("returns links, logs the download and notifies the owner", async () => {
    const { POST } = await import("../download/route");
    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, files: [pdf] });

    expect(resolveMaterials).toHaveBeenCalledWith(listing, [], ["mat-1"], "https://imperialyachting.com");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        listing_slug: listing.slug,
        email: "broker@example.com",
        is_broker: true,
        company: "Blue Water Brokers",
        client_name: "Mr. K",
        materials: [{ id: "mat-1", title: "Spec" }],
      })
    );
    expect(notifySaleDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        listingTitle: listing.title,
        email: "broker@example.com",
        clientName: "Mr. K",
        previousDownloads: 2,
        country: "DE",
      })
    );
  });

  it("ignores broker fields when the requester is not a broker", async () => {
    const { POST } = await import("../download/route");
    await POST(makeRequest({ ...validBody, isBroker: false }));
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ is_broker: false, company: null, client_name: null })
    );
  });

  it("still serves the files when logging fails", async () => {
    mockInsert.mockRejectedValue(new Error("db down"));
    const { POST } = await import("../download/route");
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(notifySaleDownload).toHaveBeenCalled();
  });

  it("returns 404 for unknown or sold listings", async () => {
    const { POST } = await import("../download/route");
    fetchSaleListingBySlug.mockResolvedValueOnce(null);
    expect((await POST(makeRequest(validBody))).status).toBe(404);
    fetchSaleListingBySlug.mockResolvedValueOnce({ ...listing, status: "sold" });
    expect((await POST(makeRequest(validBody))).status).toBe(404);
  });

  it("returns 400 when nothing selected can be served", async () => {
    resolveMaterials.mockResolvedValue([]);
    const { POST } = await import("../download/route");
    expect((await POST(makeRequest(validBody))).status).toBe(400);
  });

  it("silently drops honeypot submissions", async () => {
    const { POST } = await import("../download/route");
    const res = await POST(makeRequest({ ...validBody, website: "spam" }));
    expect(await res.json()).toEqual({ ok: true, files: [] });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(notifySaleDownload).not.toHaveBeenCalled();
  });

  it("rate-limits by IP", async () => {
    const { POST } = await import("../download/route");
    for (let i = 0; i < 10; i++) await POST(makeRequest(validBody, "9.9.9.9"));
    expect((await POST(makeRequest(validBody, "9.9.9.9"))).status).toBe(429);
  });
});
