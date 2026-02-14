import { describe, it, expect, vi, beforeEach } from "vitest";
import { yachts as staticYachts } from "@/data/yachts";

// Mock the Supabase server client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

// Chain builder helper
function setupChain(data: unknown[] | null, error: unknown = null) {
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq });
  mockOrder.mockReturnValue({ data, error });
  mockEq.mockReturnValue({
    order: mockOrder,
    single: mockSingle,
    data,
    error,
  });
  mockSingle.mockReturnValue({
    data: data && data.length > 0 ? data[0] : null,
    error,
  });
}

describe("yachts-db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllYachts", () => {
    it("falls back to static yachts when Supabase returns empty", async () => {
      setupChain([]);

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result.length).toBe(staticYachts.length);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].slug).toBe(staticYachts[0].slug);
    });

    it("falls back to static yachts when Supabase returns null", async () => {
      setupChain(null);

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result.length).toBe(staticYachts.length);
      expect(result.length).toBeGreaterThan(0);
    });

    it("falls back to static yachts on Supabase query error", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result.length).toBe(staticYachts.length);
      expect(result.length).toBeGreaterThan(0);
    });

    it("never returns empty array — static data always exists", async () => {
      // This is the key regression test:
      // No matter what Supabase does, fetchAllYachts must never return []
      setupChain(null, { message: "timeout" });

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("fetchFeaturedYachts", () => {
    it("falls back to static featured yachts on empty response", async () => {
      setupChain([]);

      const { fetchFeaturedYachts } = await import("../yachts-db");
      const result = await fetchFeaturedYachts();

      const staticFeatured = staticYachts.filter((y) => y.featured);
      expect(result.length).toBe(staticFeatured.length);
      expect(result.length).toBeGreaterThan(0);
    });

    it("falls back to static featured yachts on Supabase error", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchFeaturedYachts } = await import("../yachts-db");
      const result = await fetchFeaturedYachts();

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("fetchYachtBySlug", () => {
    it("falls back to static yacht when slug exists in static but not in DB", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: null });

      const { fetchYachtBySlug } = await import("../yachts-db");
      const result = await fetchYachtBySlug("monte-carlo-6");

      expect(result).not.toBeNull();
      expect(result!.slug).toBe("monte-carlo-6");
      expect(result!.name).toBe("Monte Carlo 6");
    });

    it("returns null for slug that does not exist anywhere", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: null });

      const { fetchYachtBySlug } = await import("../yachts-db");
      const result = await fetchYachtBySlug("nonexistent-yacht");

      expect(result).toBeNull();
    });

    it("falls back to static yacht on Supabase error", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: { message: "connection refused" } });

      const { fetchYachtBySlug } = await import("../yachts-db");
      const result = await fetchYachtBySlug("van-dutch-40");

      expect(result).not.toBeNull();
      expect(result!.slug).toBe("van-dutch-40");
    });
  });
});

describe("static yachts data integrity", () => {
  it("static yachts array is never empty", () => {
    expect(staticYachts.length).toBeGreaterThan(0);
  });

  it("all static yachts have required fields", () => {
    for (const yacht of staticYachts) {
      expect(yacht.slug).toBeTruthy();
      expect(yacht.name).toBeTruthy();
      expect(yacht.heroImage).toBeTruthy();
      expect(yacht.capacity).toBeGreaterThan(0);
      expect(yacht.length.feet).toBeGreaterThan(0);
    }
  });

  it("has at least one featured yacht", () => {
    const featured = staticYachts.filter((y) => y.featured);
    expect(featured.length).toBeGreaterThan(0);
  });

  it("all static yachts have unique slugs", () => {
    const slugs = staticYachts.map((y) => y.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
