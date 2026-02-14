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

describe("yachts-db (DB-only, no static fallback)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllYachts", () => {
    it("returns empty array when Supabase returns empty", async () => {
      setupChain([]);

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result).toEqual([]);
    });

    it("returns empty array when Supabase returns null", async () => {
      setupChain(null);

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result).toEqual([]);
    });

    it("returns empty array on Supabase query error", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result).toEqual([]);
    });

    it("returns empty array on timeout error", async () => {
      setupChain(null, { message: "timeout" });

      const { fetchAllYachts } = await import("../yachts-db");
      const result = await fetchAllYachts();

      expect(result).toEqual([]);
    });
  });

  describe("fetchFeaturedYachts", () => {
    it("returns empty array on empty response", async () => {
      setupChain([]);

      const { fetchFeaturedYachts } = await import("../yachts-db");
      const result = await fetchFeaturedYachts();

      expect(result).toEqual([]);
    });

    it("returns empty array on Supabase error", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchFeaturedYachts } = await import("../yachts-db");
      const result = await fetchFeaturedYachts();

      expect(result).toEqual([]);
    });
  });

  describe("fetchYachtBySlug", () => {
    it("returns null when yacht not found in DB", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: null });

      const { fetchYachtBySlug } = await import("../yachts-db");
      const result = await fetchYachtBySlug("nonexistent-yacht");

      expect(result).toBeNull();
    });

    it("returns null on Supabase error", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: { message: "connection refused" } });

      const { fetchYachtBySlug } = await import("../yachts-db");
      const result = await fetchYachtBySlug("monte-carlo-6");

      expect(result).toBeNull();
    });
  });
});
