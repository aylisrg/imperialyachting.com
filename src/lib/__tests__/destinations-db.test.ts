import { describe, it, expect, vi, beforeEach } from "vitest";
import { destinations as staticDestinations } from "@/data/destinations";

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

// Sample DB row in snake_case format
const sampleRow = {
  id: 1,
  slug: "palm-jumeirah",
  name: "Palm Jumeirah",
  description: "Cruise around the iconic Palm Jumeirah.",
  short_description: "Short desc",
  sailing_time: "15-30 min",
  best_for: ["Sightseeing", "Photography"],
  image: "/media/destinations/palm.jpg",
  cover_image: "/media/destinations/palm-cover.jpg",
  gallery_images: ["/img1.jpg", "/img2.jpg"],
  highlights: ["Atlantis views", "Crystal clear waters"],
  category: "destination",
  duration: "1-2 hours",
  price_from: 1500,
  latitude: 25.1124,
  longitude: 55.138,
  map_label: "Palm Jumeirah",
  video_url: "https://youtube.com/watch?v=abc123",
  featured: true,
  what_included: ["Water", "Snacks"],
  itinerary: ["Board yacht", "Cruise to Palm"],
  sort_order: 1,
};

describe("destinations-db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllDestinations", () => {
    it("returns mapped destinations from Supabase", async () => {
      setupChain([sampleRow]);

      // Dynamic import to pick up mocks
      const { fetchAllDestinations } = await import("../destinations-db");
      const result = await fetchAllDestinations();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("palm-jumeirah");
      expect(result[0].name).toBe("Palm Jumeirah");
      expect(result[0].shortDescription).toBe("Short desc");
      expect(result[0].coverImage).toBe("/media/destinations/palm-cover.jpg");
      expect(result[0].galleryImages).toEqual(["/img1.jpg", "/img2.jpg"]);
      expect(result[0].priceFrom).toBe(1500);
      expect(result[0].featured).toBe(true);
      expect(result[0].category).toBe("destination");
    });

    it("falls back to static data when Supabase returns empty", async () => {
      setupChain([]);

      const { fetchAllDestinations } = await import("../destinations-db");
      const result = await fetchAllDestinations();

      expect(result).toEqual(staticDestinations);
    });

    it("falls back to static data when Supabase returns null", async () => {
      setupChain(null);

      const { fetchAllDestinations } = await import("../destinations-db");
      const result = await fetchAllDestinations();

      expect(result).toEqual(staticDestinations);
    });
  });

  describe("fetchDestinationBySlug", () => {
    it("returns a single destination by slug", async () => {
      setupChain([sampleRow]);

      const { fetchDestinationBySlug } = await import("../destinations-db");
      const result = await fetchDestinationBySlug("palm-jumeirah");

      expect(result).not.toBeNull();
      expect(result!.slug).toBe("palm-jumeirah");
      expect(result!.name).toBe("Palm Jumeirah");
    });

    it("falls back to static data when slug exists in static set", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: null });

      const { fetchDestinationBySlug } = await import("../destinations-db");
      const result = await fetchDestinationBySlug("palm-jumeirah");

      // Should fall back to static data
      expect(result).not.toBeNull();
      expect(result!.slug).toBe("palm-jumeirah");
    });

    it("returns null for nonexistent slug", async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockReturnValue({ data: null, error: null });

      const { fetchDestinationBySlug } = await import("../destinations-db");
      const result = await fetchDestinationBySlug("nonexistent-slug");

      expect(result).toBeNull();
    });
  });

  describe("fetchFeaturedDestinations", () => {
    it("returns only featured destinations from Supabase", async () => {
      const featuredRow = { ...sampleRow, featured: true };
      setupChain([featuredRow]);

      const { fetchFeaturedDestinations } = await import("../destinations-db");
      const result = await fetchFeaturedDestinations();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((d) => d.featured || d.slug === "palm-jumeirah")).toBe(true);
    });

    it("falls back to static featured data on empty response", async () => {
      setupChain([]);

      const { fetchFeaturedDestinations } = await import("../destinations-db");
      const result = await fetchFeaturedDestinations();

      const staticFeatured = staticDestinations.filter((d) => d.featured);
      expect(result).toEqual(staticFeatured);
    });
  });

  describe("mapDestination data transformation", () => {
    it("maps snake_case to camelCase correctly", async () => {
      setupChain([sampleRow]);

      const { fetchAllDestinations } = await import("../destinations-db");
      const result = await fetchAllDestinations();
      const d = result[0];

      // camelCase fields
      expect(d.shortDescription).toBe(sampleRow.short_description);
      expect(d.sailingTime).toBe(sampleRow.sailing_time);
      expect(d.coverImage).toBe(sampleRow.cover_image);
      expect(d.galleryImages).toEqual(sampleRow.gallery_images);
      expect(d.priceFrom).toBe(sampleRow.price_from);
      expect(d.mapLabel).toBe(sampleRow.map_label);
      expect(d.videoUrl).toBe(sampleRow.video_url);
      expect(d.whatIncluded).toEqual(sampleRow.what_included);
      expect(d.bestFor).toEqual(sampleRow.best_for);
    });

    it("handles null/missing fields with defaults", async () => {
      const sparseRow = {
        slug: "test",
        name: "Test",
        description: null,
        short_description: null,
        sailing_time: null,
        best_for: null,
        image: null,
        cover_image: null,
        gallery_images: null,
        highlights: null,
        category: null,
        duration: null,
        price_from: null,
        latitude: null,
        longitude: null,
        map_label: null,
        video_url: null,
        featured: null,
        what_included: null,
        itinerary: null,
        sort_order: 0,
      };

      setupChain([sparseRow]);

      const { fetchAllDestinations } = await import("../destinations-db");
      const result = await fetchAllDestinations();
      const d = result[0];

      expect(d.description).toBe("");
      expect(d.shortDescription).toBe("");
      expect(d.sailingTime).toBe("");
      expect(d.bestFor).toEqual([]);
      expect(d.image).toBe("");
      expect(d.coverImage).toBe("");
      expect(d.galleryImages).toEqual([]);
      expect(d.highlights).toEqual([]);
      expect(d.category).toBe("destination");
      expect(d.duration).toBe("");
      expect(d.priceFrom).toBeNull();
      expect(d.latitude).toBeNull();
      expect(d.longitude).toBeNull();
      expect(d.mapLabel).toBe("Test"); // falls back to name
      expect(d.videoUrl).toBe("");
      expect(d.featured).toBe(false);
      expect(d.whatIncluded).toEqual([]);
      expect(d.itinerary).toEqual([]);
    });
  });
});
