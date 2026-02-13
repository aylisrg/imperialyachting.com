import { describe, it, expect } from "vitest";
import { destinationSchema } from "../schemas";
import type { Destination } from "@/types/common";

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
