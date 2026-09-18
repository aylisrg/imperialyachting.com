import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase server client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

function setupChain(data: unknown[] | null, error: { message: string } | null = null) {
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ order: mockOrder });
  mockOrder.mockReturnValue({ data, error });
}

describe("extras-db (retry + throw on persistent failure)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchActiveExtras", () => {
    it("returns empty array when no active extras exist (legitimate empty)", async () => {
      setupChain([]);

      const { fetchActiveExtras } = await import("../booking/extras-db");
      const result = await fetchActiveExtras();

      expect(result).toEqual([]);
    });

    it("maps DB rows (snake_case) to camelCase Extra objects", async () => {
      setupChain([
        {
          id: "extra-1",
          slug: "champagne",
          name: "Champagne bottle",
          description: "Chilled bottle of champagne served on board.",
          price: 450,
          unit: "per_booking",
          category: "drinks",
          image: "",
          active: true,
          sort_order: 80,
        },
      ]);

      const { fetchActiveExtras } = await import("../booking/extras-db");
      const result = await fetchActiveExtras();

      expect(result).toEqual([
        {
          id: "extra-1",
          slug: "champagne",
          name: "Champagne bottle",
          description: "Chilled bottle of champagne served on board.",
          price: 450,
          unit: "per_booking",
          category: "drinks",
          image: "",
          active: true,
          sortOrder: 80,
        },
      ]);
      expect(mockEq).toHaveBeenCalledWith("active", true);
      expect(mockOrder).toHaveBeenCalledWith("sort_order", { ascending: true });
    });

    it("throws on persistent Supabase error after retries", async () => {
      setupChain(null, { message: "connection refused" });

      const { fetchActiveExtras } = await import("../booking/extras-db");

      await expect(fetchActiveExtras()).rejects.toThrow("connection refused");
    }, 15000);
  });
});
