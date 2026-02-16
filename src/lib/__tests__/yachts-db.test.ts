import { describe, it, expect, vi, beforeEach } from "vitest";

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
function setupChain(data: unknown[] | null, error: { message: string } | null = null) {
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

describe("yachts-db (retry + throw on persistent failure)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllYachts", () => {
    it("returns empty array when DB has no yachts (legitimate empty)", async () => {
      setupChain([]);

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result).toEqual([]);
    });

    it("throws on persistent Supabase error after retries", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchAllYachts } = await import("../yachts-db");

      await expect(fetchAllYachts()).rejects.toThrow("connection refused");
    }, 15000);

    it("throws on persistent timeout after retries", async () => {
      setupChain(null, { message: "timeout" });

      const { fetchAllYachts } = await import("../yachts-db");

      await expect(fetchAllYachts()).rejects.toThrow("timeout");
    }, 15000);
  });

  describe("fetchFeaturedYachts", () => {
    it("returns empty array when no featured yachts exist", async () => {
      setupChain([]);

      const { fetchFeaturedYachts } = await import("../yachts-db");
      const result = await fetchFeaturedYachts();

      expect(result).toEqual([]);
    });

    it("throws on persistent Supabase error after retries", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchFeaturedYachts } = await import("../yachts-db");

      await expect(fetchFeaturedYachts()).rejects.toThrow("connection refused");
    }, 15000);
  });

  describe("fetchYachtBySlug", () => {
    it("returns null when yacht genuinely doesn't exist", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: null });

      const { fetchYachtBySlug } = await import("../yachts-db");
      const result = await fetchYachtBySlug("nonexistent-yacht");

      expect(result).toBeNull();
    });

    it("throws on persistent Supabase error after retries", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: { message: "connection refused" } });

      const { fetchYachtBySlug } = await import("../yachts-db");

      await expect(fetchYachtBySlug("monte-carlo-6")).rejects.toThrow("connection refused");
    }, 15000);
  });
});
