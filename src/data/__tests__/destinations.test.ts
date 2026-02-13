import { describe, it, expect } from "vitest";
import { destinations } from "../destinations";

const VALID_CATEGORIES = ["destination", "experience", "activity"];

// Dubai coast bounding box
const LAT_MIN = 25.05;
const LAT_MAX = 25.26;
const LNG_MIN = 55.08;
const LNG_MAX = 55.22;

describe("static destinations data", () => {
  it("contains exactly 5 destinations", () => {
    expect(destinations).toHaveLength(5);
  });

  it("has unique slugs", () => {
    const slugs = destinations.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(destinations.map((d) => [d.slug, d]))(
    "%s has required string fields",
    (_, d) => {
      expect(d.slug).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.description).toBeTruthy();
      expect(d.category).toBeTruthy();
    }
  );

  it("all categories are valid", () => {
    for (const d of destinations) {
      expect(VALID_CATEGORIES).toContain(d.category);
    }
  });

  it("all coordinates are within Dubai bounding box", () => {
    for (const d of destinations) {
      if (d.latitude !== null && d.longitude !== null) {
        expect(d.latitude).toBeGreaterThanOrEqual(LAT_MIN);
        expect(d.latitude).toBeLessThanOrEqual(LAT_MAX);
        expect(d.longitude).toBeGreaterThanOrEqual(LNG_MIN);
        expect(d.longitude).toBeLessThanOrEqual(LNG_MAX);
      }
    }
  });

  it("all destinations have coordinates", () => {
    for (const d of destinations) {
      expect(d.latitude).not.toBeNull();
      expect(d.longitude).not.toBeNull();
    }
  });

  it("has 4 featured destinations", () => {
    expect(destinations.filter((d) => d.featured)).toHaveLength(4);
  });

  it("array fields are arrays", () => {
    for (const d of destinations) {
      expect(Array.isArray(d.bestFor)).toBe(true);
      expect(Array.isArray(d.highlights)).toBe(true);
      expect(Array.isArray(d.whatIncluded)).toBe(true);
      expect(Array.isArray(d.itinerary)).toBe(true);
      expect(Array.isArray(d.galleryImages)).toBe(true);
    }
  });

  it("all destinations have a coverImage", () => {
    for (const d of destinations) {
      expect(d.coverImage).toBeTruthy();
    }
  });

  it("coverImage matches image for all static entries", () => {
    for (const d of destinations) {
      expect(d.coverImage).toBe(d.image);
    }
  });
});
