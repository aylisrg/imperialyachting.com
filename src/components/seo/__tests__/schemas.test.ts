import { describe, it, expect } from "vitest";
import {
  destinationSchema,
  organizationSchema,
  localBusinessSchema,
  serviceAreaSchema,
  websiteSchema,
  serviceSchema,
  yachtProductSchema,
  extractYouTubeId,
  videoObjectSchema,
  itemListSchema,
  breadcrumbSchema,
  reviewSchemas,
} from "../schemas";
import type { Destination } from "@/types/common";
import type { Yacht } from "@/types/yacht";

const baseYacht: Yacht = {
  slug: "test-yacht",
  name: "Test Yacht",
  tagline: "A fine test vessel",
  description: "A yacht used for schema tests.",
  builder: "Test Builder",
  year: 2022,
  length: { feet: 60, meters: 18.3 },
  capacity: 12,
  location: "Dubai Harbour",
  images: ["/media/test-yacht/1.jpg"],
  heroImage: "/media/test-yacht/hero.jpg",
  specs: [],
  amenities: [],
  pricing: [
    {
      season: "Low Season",
      period: "May - Sep",
      hourly: 2000,
      daily: null,
      weekly: 30000,
      monthly: null,
      validFrom: "2026-05-01",
      validTo: "2026-09-30",
      isWeekend: false,
    },
    {
      season: "High Season",
      period: "Oct - Apr",
      hourly: 2500,
      daily: 15000,
      weekly: null,
      monthly: 90000,
      isWeekend: true,
    },
  ],
  included: [],
  featured: false,
  youtubeShorts: [],
  youtubeVideo: "",
  showVideos: false,
  dailyRules: "",
  weeklyRules: "",
  minHoursWeekday: 2,
  minHoursWeekend: 4,
};

const baseDestination: Destination = {
  slug: "palm-jumeirah",
  name: "Palm Jumeirah",
  description: "Cruise around the iconic Palm Jumeirah, the world's largest man-made island.",
  shortDescription: "Cruise the world's largest man-made island.",
  sailingTime: "15-30 min",
  bestFor: ["Sightseeing", "Photography"],
  image: "/media/destinations/palm.jpg",
  coverImage: "/media/destinations/palm.jpg",
  galleryImages: [],
  highlights: ["Atlantis views"],
  category: "destination",
  duration: "1-2 hours",
  priceFrom: null,
  latitude: 25.1124,
  longitude: 55.138,
  mapLabel: "Palm Jumeirah",
  videoUrl: "",
  featured: true,
  whatIncluded: [],
  itinerary: [],
};

describe("destinationSchema", () => {
  it("returns valid JSON-LD with @context and @type", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("TouristDestination");
  });

  it("includes destination name and description", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.name).toBe("Palm Jumeirah");
    expect(schema.description).toBe("Cruise the world's largest man-made island.");
  });

  it("builds correct URL for destination page", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.url).toBe("https://imperialyachting.com/destinations/palm-jumeirah");
  });

  it("includes geo coordinates when lat/lng provided", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 25.1124,
      longitude: 55.138,
    });
  });

  it("omits geo when lat/lng are null", () => {
    const noGeo = { ...baseDestination, latitude: null, longitude: null };
    const schema = destinationSchema(noGeo);
    expect(schema.geo).toBeUndefined();
  });

  it("includes offers when priceFrom is set", () => {
    const withPrice = { ...baseDestination, priceFrom: 2000 };
    const schema = destinationSchema(withPrice);
    expect(schema.offers).toBeDefined();
    expect(schema.offers!["@type"]).toBe("Offer");
    expect(schema.offers!.priceCurrency).toBe("AED");
    expect(schema.offers!.price).toBe(2000);
  });

  it("omits offers when priceFrom is null", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.offers).toBeUndefined();
  });

  it("maps bestFor to touristType", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.touristType).toEqual(["Sightseeing", "Photography"]);
  });

  it("includes provider organization", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.provider).toBeDefined();
    expect(schema.provider["@type"]).toBe("Organization");
    expect(schema.provider.name).toBe("Imperial Yachting");
  });

  it("prepends site URL to relative cover image", () => {
    const schema = destinationSchema(baseDestination);
    expect(schema.image).toBe("https://imperialyachting.com/media/destinations/palm.jpg");
  });

  it("preserves absolute cover image URL", () => {
    const withAbsUrl = {
      ...baseDestination,
      coverImage: "https://cdn.example.com/image.jpg",
    };
    const schema = destinationSchema(withAbsUrl);
    expect(schema.image).toBe("https://cdn.example.com/image.jpg");
  });
});

describe("organizationSchema", () => {
  it("carries an @id so other nodes can reference it", () => {
    const schema = organizationSchema();
    expect(schema["@id"]).toBe("https://imperialyachting.com/#organization");
  });
});

describe("websiteSchema", () => {
  it("publisher resolves to the Organization @id", () => {
    const schema = websiteSchema();
    expect(schema.publisher).toEqual({
      "@id": "https://imperialyachting.com/#organization",
    });
  });
});

describe("serviceSchema", () => {
  it("provider resolves to the Organization @id", () => {
    const schema = serviceSchema({
      name: "Yacht Charter",
      description: "Charter service",
      url: "https://imperialyachting.com/services/charter",
    });
    expect(schema.provider["@id"]).toBe("https://imperialyachting.com/#organization");
  });
});

describe("localBusinessSchema", () => {
  it("has a single @id and a review array", () => {
    const schema = localBusinessSchema();
    expect(schema["@id"]).toBe("https://imperialyachting.com/#localbusiness");
    expect(Array.isArray(schema.review)).toBe(true);
    expect(schema.review.length).toBeGreaterThan(0);
  });

  it("includes areaServed, serviceArea and hasOfferCatalog (merged from serviceAreaSchema)", () => {
    const schema = localBusinessSchema();
    expect(schema.areaServed).toBeDefined();
    expect(schema.serviceArea["@type"]).toBe("GeoCircle");
    expect(schema.hasOfferCatalog["@type"]).toBe("OfferCatalog");
  });

  it("references the parent Organization", () => {
    const schema = localBusinessSchema();
    expect(schema.parentOrganization).toEqual({
      "@id": "https://imperialyachting.com/#organization",
    });
  });

  it("computes reviewCount as at least 6", () => {
    const schema = localBusinessSchema();
    expect(schema.aggregateRating.reviewCount).toBeGreaterThanOrEqual(6);
  });
});

describe("serviceAreaSchema (deprecated alias)", () => {
  it("returns the same shape as localBusinessSchema", () => {
    expect(serviceAreaSchema()).toEqual(localBusinessSchema());
  });
});

describe("reviewSchemas", () => {
  it("builds Review nodes referencing the LocalBusiness", () => {
    const reviews = reviewSchemas([
      { name: "Jane D.", role: "Guest", text: "Great trip", rating: 5, date: "2026-01" },
    ]);
    expect(reviews).toHaveLength(1);
    expect(reviews[0]["@type"]).toBe("Review");
    expect(reviews[0].author).toEqual({ "@type": "Person", name: "Jane D." });
    expect(reviews[0].reviewRating.ratingValue).toBe(5);
    expect(reviews[0].reviewBody).toBe("Great trip");
    expect(reviews[0].datePublished).toBe("2026-01");
    expect(reviews[0].itemReviewed).toEqual({
      "@id": "https://imperialyachting.com/#localbusiness",
    });
  });
});

describe("yachtProductSchema", () => {
  it("computes lowPrice from the lowest hourly rate when hourly pricing exists", () => {
    const schema = yachtProductSchema(baseYacht);
    expect(schema.offers).toBeDefined();
    expect(schema.offers!["@type"]).toBe("AggregateOffer");
    expect(schema.offers!.lowPrice).toBe(2000);
  });

  it("computes highPrice as the max across all units", () => {
    const schema = yachtProductSchema(baseYacht);
    expect(schema.offers!.highPrice).toBe(90000);
  });

  it("computes offerCount as the number of non-null pricing entries", () => {
    const schema = yachtProductSchema(baseYacht);
    // Low season: hourly + weekly = 2, High season: hourly + daily + monthly = 3
    expect(schema.offers!.offerCount).toBe(5);
  });

  it("falls back to lowest daily price when no hourly pricing exists", () => {
    const yachtNoHourly: Yacht = {
      ...baseYacht,
      pricing: [
        {
          season: "Only Season",
          period: "All year",
          hourly: null,
          daily: 12000,
          weekly: 70000,
          monthly: null,
        },
      ],
    };
    const schema = yachtProductSchema(yachtNoHourly);
    expect(schema.offers!.lowPrice).toBe(12000);
  });

  it("propagates validFrom/validThrough from season pricing onto sub-offers", () => {
    const schema = yachtProductSchema(baseYacht);
    const subOffers = schema.offers!.offers as Array<Record<string, unknown>>;
    const lowSeasonHourly = subOffers.find(
      (o) => o.name === "Low Season — hourly"
    )!;
    expect(lowSeasonHourly.validFrom).toBe("2026-05-01");
    expect(lowSeasonHourly.validThrough).toBe("2026-09-30");
  });

  it("falls back to end-of-year validThrough when validTo is absent", () => {
    const schema = yachtProductSchema(baseYacht);
    const subOffers = schema.offers!.offers as Array<Record<string, unknown>>;
    const highSeasonHourly = subOffers.find(
      (o) => o.name === "High Season — hourly"
    )!;
    expect(highSeasonHourly.validFrom).toBeUndefined();
    expect(typeof highSeasonHourly.validThrough).toBe("string");
  });

  it("attaches minHoursWeekend as eligibleQuantity on weekend hourly offers", () => {
    const schema = yachtProductSchema(baseYacht);
    const subOffers = schema.offers!.offers as Array<Record<string, unknown>>;
    const highSeasonHourly = subOffers.find(
      (o) => o.name === "High Season — hourly"
    )!;
    expect(highSeasonHourly.eligibleQuantity).toEqual({
      "@type": "QuantitativeValue",
      minValue: 4,
      unitCode: "HUR",
    });
  });

  it("attaches a VideoObject under subjectOf when youtubeVideo is set", () => {
    const yachtWithVideo: Yacht = {
      ...baseYacht,
      youtubeVideo: "https://www.youtube.com/watch?v=abc123",
    };
    const schema = yachtWithVideo && yachtProductSchema(yachtWithVideo);
    expect(schema.subjectOf).toBeDefined();
    expect(schema.subjectOf!["@type"]).toBe("VideoObject");
    expect(schema.subjectOf!.embedUrl).toBe("https://www.youtube.com/embed/abc123");
  });

  it("omits subjectOf when there is no youtube video", () => {
    const schema = yachtProductSchema(baseYacht);
    expect(schema.subjectOf).toBeUndefined();
  });
});

describe("extractYouTubeId", () => {
  it("extracts the id from a full watch URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=abc123")).toBe("abc123");
  });

  it("extracts the id from a youtu.be short link", () => {
    expect(extractYouTubeId("https://youtu.be/abc123")).toBe("abc123");
  });

  it("returns a bare id unchanged", () => {
    expect(extractYouTubeId("abc123")).toBe("abc123");
  });
});

describe("videoObjectSchema", () => {
  it("normalises a YouTube URL into embedUrl and thumbnailUrl", () => {
    const video = videoObjectSchema({
      source: "https://youtu.be/abc123",
      name: "Yacht Tour",
    });
    expect(video["@type"]).toBe("VideoObject");
    expect(video.embedUrl).toBe("https://www.youtube.com/embed/abc123");
    expect(video.thumbnailUrl).toBe("https://i.ytimg.com/vi/abc123/hqdefault.jpg");
    expect(video.uploadDate).toBeDefined();
  });
});

describe("itemListSchema", () => {
  it("assigns sequential positions and absolute URLs", () => {
    const schema = itemListSchema("Destinations", [
      { name: "Palm Jumeirah", url: "/destinations/palm-jumeirah" },
      { name: "Ain Dubai", url: "/destinations/ain-dubai" },
    ]);
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].url).toBe(
      "https://imperialyachting.com/destinations/palm-jumeirah"
    );
    expect(schema.itemListElement[1].position).toBe(2);
  });
});

describe("breadcrumbSchema", () => {
  it("builds absolute URLs for relative paths", () => {
    const schema = breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Fleet", url: "/fleet" },
    ]);
    expect(schema.itemListElement[0].item).toBe("https://imperialyachting.com/");
    expect(schema.itemListElement[1].item).toBe("https://imperialyachting.com/fleet");
  });

  it("preserves already-absolute URLs", () => {
    const schema = breadcrumbSchema([
      { name: "External", url: "https://example.com" },
    ]);
    expect(schema.itemListElement[0].item).toBe("https://example.com");
  });
});
