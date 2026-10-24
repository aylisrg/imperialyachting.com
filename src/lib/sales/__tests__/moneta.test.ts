import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { SaleMaterialRow } from "@/lib/supabase/types";
import { mergeSaleListing } from "@/lib/sales/merge";
import { MONETA_BROCHURE, MONETA_SLUG, withMonetaBrochure } from "@/lib/sales/moneta";
import { fleetYacht, saleRow } from "./fixtures";

function material(overrides: Partial<SaleMaterialRow> = {}): SaleMaterialRow {
  return {
    id: "old-moneta-brochure", listing_id: "listing-1", title: "MONETA brochure",
    description: "Old version", category: "brochure", source: "storage",
    location: "moneta/old.pdf", file_name: "Moneta.pdf", mime_type: "application/pdf",
    size_bytes: 100, active: true, sort_order: 10, created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const moneta = () => mergeSaleListing(saleRow({
  slug: MONETA_SLUG, name: "Moneta", model: "Monte Carlo 6", builder: "Monte Carlo Yachts",
  year_built: 2021, length_m: 18, beam_m: 4.88, draft_m: 1.3,
  description: "Italian yacht", spec_sections: [],
}), [], fleetYacht({ specs: [
  { label: "Builder", value: "Monte Carlo Yachts" },
  { label: "Year built", value: "2021" },
  { label: "Year / Refit", value: "2016 / 2023" },
  { label: "Length", value: "60 ft / 18 m" },
  { label: "LOA", value: "18 m" },
  { label: "Beam", value: "4.88 m" },
  { label: "Draft", value: "1.3 m" },
  { label: "Engines", value: "Twin Cummins 600 HP" },
] }));

describe("Moneta release facts", () => {
  it("corrects the sale listing and inherited specs without losing other specifications", () => {
    const listing = moneta();
    expect(listing).toMatchObject({ builder: "Beneteau", model: "Monte Carlo 6", yearBuilt: 2019,
      lengthM: 18.35, lengthFt: 60, beamM: 4.91, draftM: 1.17 });
    expect(listing.headline).toContain("Launched 2020");
    expect(listing.seoDescription).toContain("Built 2019, launched 2020");
    expect(listing.description).not.toContain("Italian");
    expect(listing.specSections.flatMap((s) => s.items)).toEqual(expect.arrayContaining([
      { label: "Builder", value: "Beneteau" }, { label: "Year built", value: "2019" },
      { label: "Year / Refit", value: "2019 / 2023" }, { label: "Length", value: "18.35 m / 60'2\"" },
      { label: "LOA", value: "18.35 m / 60'2\"" }, { label: "Beam", value: "4.91 m" },
      { label: "Draft", value: "1.17 m" }, { label: "Launched", value: "2020" },
      { label: "Engines", value: "Twin Cummins 600 HP" },
    ]));
    expect(listing.images).toHaveLength(2);
  });

  it("does not apply to another listing even when it is linked to the Moneta fleet yacht", () => {
    const listing = mergeSaleListing(saleRow(), [], fleetYacht());
    expect(listing.builder).toBe("VanDutch");
    expect(listing.yearBuilt).toBe(2010);
    expect(listing.lengthM).toBe(12);
  });
});

describe("Moneta bundled brochure replacement", () => {
  it("offers exactly one current brochure when the database has no old row", () => {
    expect(withMonetaBrochure(moneta(), [])).toEqual([expect.objectContaining({
      id: MONETA_BROCHURE.id, category: "brochure", source: "bundled",
      location: MONETA_BROCHURE.location, size_bytes: 13388979,
    })]);
  });

  it("reuses an identifiable brochure id while leaving source records untouched", () => {
    const old = material();
    const before = structuredClone(old);
    const rows = withMonetaBrochure(moneta(), [old, material({ id: "duplicate" })]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: old.id, source: "bundled", location: MONETA_BROCHURE.location,
      sort_order: old.sort_order, created_at: old.created_at });
    expect(old).toEqual(before);
  });

  it("preserves surveys, specifications and unidentifiable/general brochures", () => {
    const others = [
      material({ id: "survey", category: "survey" }),
      material({ id: "specification", category: "specification" }),
      material({ id: "general", title: "Brochure", file_name: "brochure.pdf", location: "monte-carlo-6-moneta/123-brochure.pdf" }),
      material({ id: "manufacturer", title: "Monte Carlo 6 brochure", file_name: "MC6.pdf", location: "monte-carlo-6-moneta/123-mc6.pdf" }),
    ];
    const rows = withMonetaBrochure(moneta(), [material(), ...others]);
    expect(rows.slice(1)).toEqual(others);
  });

  it("does not replace material rows for any other listing", () => {
    const rows = [material()];
    expect(withMonetaBrochure(mergeSaleListing(saleRow(), [], null), rows)).toBe(rows);
  });

  it("ships the exact owner-approved PDF outside public/", () => {
    const pdf = readFileSync(path.join(process.cwd(), "private/sales", MONETA_BROCHURE.location));
    expect(pdf.length).toBe(MONETA_BROCHURE.sizeBytes);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(createHash("sha256").update(pdf).digest("hex")).toBe(
      "b9bbdc6387a3d0c379dda4f73d4646857192c1f4dd5e0b9120a5cd4fb2500666"
    );
  });
});
