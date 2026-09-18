import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Yacht } from "@/types/yacht";
import type { Destination } from "@/types/common";
import type { Extra } from "@/types/booking";

const fetchAllYachts = vi.fn();
const fetchYachtBySlug = vi.fn();
vi.mock("@/lib/yachts-db", () => ({
  fetchAllYachts: (...args: unknown[]) => fetchAllYachts(...args),
  fetchYachtBySlug: (...args: unknown[]) => fetchYachtBySlug(...args),
}));

const fetchAllDestinations = vi.fn();
vi.mock("@/lib/destinations-db", () => ({
  fetchAllDestinations: (...args: unknown[]) => fetchAllDestinations(...args),
}));

const fetchActiveExtras = vi.fn();
vi.mock("@/lib/booking/extras-db", () => ({
  fetchActiveExtras: (...args: unknown[]) => fetchActiveExtras(...args),
}));

const bigYacht: Yacht = {
  slug: "monte-carlo-6",
  name: "Monte Carlo 6",
  tagline: "Dubai's flagship flybridge motor yacht",
  description: "A spacious 60ft flybridge motor yacht for large groups.",
  builder: "Beneteau",
  year: 2021,
  length: { feet: 60, meters: 18.3 },
  capacity: 18,
  cabins: 3,
  location: "Dubai Harbour Yacht Club",
  images: ["/media/mc6-hero.jpg", "/media/mc6-2.jpg"],
  heroImage: "/media/mc6-hero.jpg",
  specs: [{ label: "Engines", value: "2x Volvo Penta IPS" }],
  amenities: [{ icon: "wifi", label: "WiFi" }],
  pricing: [
    {
      season: "Summer",
      period: "Weekday",
      hourly: 1200,
      daily: null,
      weekly: null,
      monthly: null,
      validFrom: null,
      validTo: null,
      isWeekend: false,
    },
  ],
  included: ["Professional crew", "Fuel", "Soft drinks"],
  featured: true,
  youtubeShorts: [],
  youtubeVideo: "https://youtube.com/watch?v=abc123",
  showVideos: true,
  dailyRules: "Minimum 4 hours on weekends.",
  weeklyRules: "Minimum 7 days for weekly rate.",
  minHoursWeekday: 2,
  minHoursWeekend: 4,
  bookingEnabled: true,
};

const smallYacht: Yacht = {
  ...bigYacht,
  slug: "van-dutch-40",
  name: "Van Dutch 40",
  capacity: 8,
  cabins: undefined,
  featured: false,
  pricing: [
    {
      season: "Summer",
      period: "Weekday",
      hourly: 500,
      daily: null,
      weekly: null,
      monthly: null,
      validFrom: null,
      validTo: null,
      isWeekend: false,
    },
  ],
  minHoursWeekday: undefined,
  minHoursWeekend: undefined,
  bookingEnabled: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listYachts", () => {
  it("returns all yachts with no filters", async () => {
    fetchAllYachts.mockResolvedValue([bigYacht, smallYacht]);
    const { listYachts } = await import("../tools/list-yachts");

    const { structured } = await listYachts({});
    expect(structured.yachts).toHaveLength(2);
  });

  it("filters by minimum guest count", async () => {
    fetchAllYachts.mockResolvedValue([bigYacht, smallYacht]);
    const { listYachts } = await import("../tools/list-yachts");

    const { structured } = await listYachts({ guests: 10 });
    expect(structured.yachts.map((y) => y.slug)).toEqual(["monte-carlo-6"]);
  });

  it("filters by max hourly rate", async () => {
    fetchAllYachts.mockResolvedValue([bigYacht, smallYacht]);
    const { listYachts } = await import("../tools/list-yachts");

    const { structured } = await listYachts({ maxHourlyRate: 600 });
    expect(structured.yachts.map((y) => y.slug)).toEqual(["van-dutch-40"]);
  });

  it("filters by featuredOnly", async () => {
    fetchAllYachts.mockResolvedValue([bigYacht, smallYacht]);
    const { listYachts } = await import("../tools/list-yachts");

    const { structured } = await listYachts({ featuredOnly: true });
    expect(structured.yachts.map((y) => y.slug)).toEqual(["monte-carlo-6"]);
  });

  it("applies fallback minimum hours when unset", async () => {
    fetchAllYachts.mockResolvedValue([smallYacht]);
    const { listYachts } = await import("../tools/list-yachts");

    const { structured } = await listYachts({});
    expect(structured.yachts[0].minHoursWeekday).toBe(2);
    expect(structured.yachts[0].minHoursWeekend).toBe(4);
  });

  it("returns an absolute heroImage URL", async () => {
    fetchAllYachts.mockResolvedValue([bigYacht]);
    const { listYachts } = await import("../tools/list-yachts");

    const { structured } = await listYachts({});
    expect(structured.yachts[0].heroImage).toMatch(/^https?:\/\//);
  });
});

describe("getYacht", () => {
  it("returns the full detail card when found", async () => {
    fetchYachtBySlug.mockResolvedValue(bigYacht);
    const { getYacht } = await import("../tools/get-yacht");

    const { structured } = await getYacht({ slug: "monte-carlo-6" });
    expect(structured.found).toBe(true);
    expect(structured.yacht?.name).toBe("Monte Carlo 6");
    expect(structured.yacht?.pricing).toHaveLength(1);
    expect(structured.yacht?.images.length).toBeLessThanOrEqual(8);
  });

  it("returns found:false with valid slugs when not found", async () => {
    fetchYachtBySlug.mockResolvedValue(null);
    fetchAllYachts.mockResolvedValue([bigYacht, smallYacht]);
    const { getYacht } = await import("../tools/get-yacht");

    const { structured, text } = await getYacht({ slug: "nonexistent" });
    expect(structured.found).toBe(false);
    expect(structured.validSlugs).toEqual(["monte-carlo-6", "van-dutch-40"]);
    expect(text).toContain("monte-carlo-6");
  });

  it("sanitizes the description field", async () => {
    fetchYachtBySlug.mockResolvedValue({
      ...bigYacht,
      description: "<script>alert(1)</script>Nice yacht",
    });
    const { getYacht } = await import("../tools/get-yacht");

    const { structured } = await getYacht({ slug: "monte-carlo-6" });
    expect(structured.yacht?.description).not.toContain("<script>");
    expect(structured.yacht?.description).toContain("Nice yacht");
  });
});

describe("listDestinations", () => {
  const destination: Destination = {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    description: "Cruise around the iconic Palm Jumeirah.",
    shortDescription: "Iconic palm-shaped island.",
    sailingTime: "15-30 min",
    bestFor: ["Sightseeing"],
    image: "/img.jpg",
    coverImage: "/cover.jpg",
    galleryImages: [],
    highlights: ["Atlantis views"],
    category: "destination",
    duration: "1-2 hours",
    priceFrom: 1500,
    latitude: 25.11,
    longitude: 55.13,
    mapLabel: "Palm Jumeirah",
    videoUrl: "",
    featured: true,
    whatIncluded: [],
    itinerary: [],
  };

  const activity: Destination = {
    ...destination,
    slug: "wakeboarding",
    name: "Wakeboarding",
    category: "activity",
  };

  it("returns all destinations with no filter", async () => {
    fetchAllDestinations.mockResolvedValue([destination, activity]);
    const { listDestinations } = await import("../tools/list-destinations");

    const { structured } = await listDestinations({});
    expect(structured.destinations).toHaveLength(2);
  });

  it("filters by category", async () => {
    fetchAllDestinations.mockResolvedValue([destination, activity]);
    const { listDestinations } = await import("../tools/list-destinations");

    const { structured } = await listDestinations({ category: "activity" });
    expect(structured.destinations.map((d) => d.slug)).toEqual(["wakeboarding"]);
  });
});

describe("listExtras", () => {
  const extra: Extra = {
    id: "extra-1",
    slug: "champagne",
    name: "Champagne bottle",
    description: "Chilled bottle of champagne.",
    price: 450,
    unit: "per_booking",
    category: "drinks",
    image: "",
    active: true,
    sortOrder: 1,
  };

  it("returns mapped extras on success", async () => {
    fetchActiveExtras.mockResolvedValue([extra]);
    const { listExtras } = await import("../tools/list-extras");

    const { structured } = await listExtras();
    expect(structured.extras).toEqual([
      {
        slug: "champagne",
        name: "Champagne bottle",
        description: "Chilled bottle of champagne.",
        price: 450,
        unit: "per_booking",
        category: "drinks",
      },
    ]);
    expect(structured.note).toBeUndefined();
  });

  it("degrades to an empty list with a note when the DB throws", async () => {
    fetchActiveExtras.mockRejectedValue(new Error("connection refused"));
    const { listExtras } = await import("../tools/list-extras");

    const { structured } = await listExtras();
    expect(structured.extras).toEqual([]);
    expect(structured.note).toBeTruthy();
  });
});

describe("getBookingTerms", () => {
  it("returns the documented commercial terms", async () => {
    const { getBookingTerms } = await import("../tools/get-booking-terms");

    const { structured, text } = await getBookingTerms();
    expect(structured.currency).toBe("AED");
    expect(structured.depositRate).toBe(0.5);
    expect(structured.balanceDueHoursBefore).toBe(48);
    expect(structured.minHours).toEqual({ weekday: 2, weekend: 4 });
    expect(structured.cancellation.length).toBeGreaterThan(0);
    expect(structured.contact.email).toContain("@");
    expect(text).toContain("AED");
  });
});
