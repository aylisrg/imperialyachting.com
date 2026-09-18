import { describe, it, expect } from "vitest";
import { buildLlmsTxt, buildLlmsFullTxt } from "@/lib/seo/llms";
import type { Yacht } from "@/types/yacht";
import type { Destination } from "@/types/common";

const fixtureYachts: Yacht[] = [
  {
    slug: "monte-carlo-6",
    name: "Monte Carlo 6",
    tagline: "Flagship luxury",
    description: "Our flagship 60ft motor yacht with a full sundeck and E-Foil.",
    builder: "Beneteau",
    year: 2022,
    length: { feet: 60, meters: 18.3 },
    capacity: 18,
    location: "Dubai Harbour",
    images: [],
    heroImage: "/hero.jpg",
    specs: [],
    amenities: [{ icon: "wifi", label: "WiFi" }],
    pricing: [
      {
        season: "Summer",
        period: "May-Sep",
        hourly: 2500,
        daily: 12000,
        weekly: null,
        monthly: null,
      },
    ],
    included: ["Captain & crew", "Fuel"],
    featured: true,
    youtubeShorts: [],
    youtubeVideo: "",
    showVideos: false,
    dailyRules: "",
    weeklyRules: "",
  },
];

const fixtureDestinations: Destination[] = [
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    description: "Cruise around the iconic Palm Jumeirah with views of Atlantis.",
    shortDescription: "Iconic Palm Jumeirah cruise",
    sailingTime: "15-30 min",
    bestFor: ["Sightseeing"],
    image: "/img.jpg",
    coverImage: "/img.jpg",
    galleryImages: [],
    highlights: ["Atlantis views", "Crystal clear waters"],
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
  },
];

describe("buildLlmsTxt", () => {
  it("includes site name, fleet, destinations, and required sections", () => {
    const out = buildLlmsTxt({ yachts: fixtureYachts, destinations: fixtureDestinations });

    expect(out).toContain("# Imperial Yachting");
    expect(out).toContain("Monte Carlo 6");
    expect(out).toContain("from AED 2,500/hr");
    expect(out).toContain("Palm Jumeirah");
    expect(out).toContain("## Fleet");
    expect(out).toContain("## Destinations & Experiences");
    expect(out).toContain("## Services");
    expect(out).toContain("## Booking & Payment");
    expect(out).toContain("50%");
    expect(out).toContain("48 hours");
    expect(out).toContain("## For AI agents");
    expect(out).toContain("/api/mcp");
    expect(out).toContain("/ai");
    expect(out).toContain("## Contact");
  });

  it("falls back gracefully when no data is available", () => {
    const out = buildLlmsTxt({ yachts: [], destinations: [] });
    expect(out).toContain("temporarily unavailable");
  });

  it("lists extras when provided", () => {
    const out = buildLlmsTxt({
      yachts: fixtureYachts,
      destinations: fixtureDestinations,
      extras: [{ name: "Jet Ski", price: 500, unit: "hour" }],
    });
    expect(out).toContain("Jet Ski");
    expect(out).toContain("AED 500/hour");
  });
});

describe("buildLlmsFullTxt", () => {
  it("includes full descriptions, pricing tables, amenities, and FAQ", () => {
    const out = buildLlmsFullTxt({ yachts: fixtureYachts, destinations: fixtureDestinations });

    expect(out).toContain("Our flagship 60ft motor yacht");
    expect(out).toContain("Seasonal pricing");
    expect(out).toContain("Summer");
    expect(out).toContain("Captain & crew");
    expect(out).toContain("WiFi");
    expect(out).toContain("Atlantis views");
    expect(out).toContain("## FAQ");
    expect(out).toContain("Dubai Harbour Yacht Club");
  });
});
