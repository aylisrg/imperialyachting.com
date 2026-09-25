import { describe, it, expect } from "vitest";
import {
  formatSalePrice,
  mergeSaleListing,
  parseFaq,
  parseSpecSections,
  saleTitle,
} from "@/lib/sales/merge";
import { fleetYacht, mediaRow, saleRow } from "./fixtures";

describe("mergeSaleListing", () => {
  it("uses listing values and builds the display title", () => {
    const listing = mergeSaleListing(saleRow(), [], null);
    expect(listing.title).toBe("VanDutch 40 “Van Dutch Connect”");
    expect(listing.yearBuilt).toBe(2010);
    expect(listing.lengthM).toBe(12);
    expect(listing.lengthFt).toBe(39);
    expect(listing.specSections).toHaveLength(1);
    expect(listing.seoTitle).toBe("VanDutch 40 “Van Dutch Connect” for Sale in Dubai");
  });

  it("fills every empty field from the linked fleet yacht", () => {
    const row = saleRow({
      name: "Moneta",
      model: "Monte Carlo 6",
      builder: null,
      year_built: null,
      refit_year: null,
      length_m: null,
      guests: null,
      cabins: null,
      description: null,
      features: [],
      spec_sections: [],
      fleet_yacht_slug: "monte-carlo-6",
    });
    const listing = mergeSaleListing(row, [], fleetYacht());

    expect(listing.builder).toBe("Monte Carlo Yachts");
    expect(listing.yearBuilt).toBe(2016);
    expect(listing.refitYear).toBe(2023);
    expect(listing.lengthM).toBe(18);
    expect(listing.lengthFt).toBe(60);
    expect(listing.guests).toBe(18);
    expect(listing.cabins).toBe(3);
    expect(listing.description).toBe("Fleet description.");
    expect(listing.features).toEqual(["WiFi"]);
    expect(listing.specSections).toEqual([
      { title: "Specifications", items: [{ label: "Engines", value: "Twin Cummins 600 HP" }] },
    ]);
  });

  it("puts hero and own media before fleet photos, without duplicates, and skips empty videos", () => {
    const fleet = fleetYacht();
    const listing = mergeSaleListing(
      saleRow({ hero_image: fleet.images[1] }),
      [
        mediaRow({ id: "m2", url: "https://cdn/own.jpg", sort_order: 2 }),
        mediaRow({ id: "m3", kind: "video", url: "https://cdn/tour.mp4", sort_order: 1 }),
        mediaRow({ id: "m4", kind: "youtube", url: "https://youtu.be/iqY2Ss8-hBM", sort_order: 3 }),
      ],
      fleet
    );

    expect(listing.images).toEqual([fleet.images[1], "https://cdn/own.jpg", fleet.images[0]]);
    expect(listing.heroImage).toBe(fleet.images[1]);
    expect(listing.videos.map((v) => [v.kind, v.url])).toEqual([
      ["file", "https://cdn/tour.mp4"],
      ["youtube", "https://youtu.be/iqY2Ss8-hBM"],
      ["youtube", "https://youtube.com/shorts/SUycrsk56tY"],
    ]);
  });
});

describe("parsers and formatting", () => {
  it("drops malformed spec sections and FAQ items", () => {
    expect(
      parseSpecSections([
        { title: "Ok", items: [{ label: "A", value: "1" }, { label: "B" }] },
        { title: "Empty", items: [] },
        "junk",
      ])
    ).toEqual([{ title: "Ok", items: [{ label: "A", value: "1" }] }]);
    expect(parseFaq([{ question: "Q", answer: "A" }, { question: "no answer" }, null])).toEqual([
      { question: "Q", answer: "A" },
    ]);
    expect(parseSpecSections(null)).toEqual([]);
  });

  it("does not repeat the model when the name already contains it", () => {
    expect(saleTitle("Monte Carlo 6", "Monte Carlo 6 Moneta")).toBe("Monte Carlo 6 Moneta");
    expect(saleTitle("", "Moneta")).toBe("Moneta");
  });

  it("formats price on application and amounts", () => {
    expect(formatSalePrice({ amount: null, currency: "AED" })).toBe("Price on application");
    expect(formatSalePrice({ amount: 1250000, currency: "AED" })).toBe("AED 1,250,000");
  });
});
