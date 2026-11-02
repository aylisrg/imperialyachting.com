import { describe, expect, it } from "vitest";
import { applyMonetaFleetYears, correctMonetaYearText } from "../moneta-years";
import { fleetYacht } from "../sales/__tests__/fixtures";
import { yachtProductSchema } from "@/components/seo/schemas";

describe("MONETA public year facts", () => {
  it.each([2016, 2019, 2021])("corrects stale %s fleet data without changing other facts", (year) => {
    const input = fleetYacht({ year, refit: 2023,
      tagline: "Built 2021", description: "Built in 2019 and launched in 2020.",
      specs: [{ label: "Year / Refit", value: `${year} / 2023` },
        { label: "Launch year", value: "2020" }, { label: "Engines", value: "Twin Cummins 600 HP" }],
    });
    const before = structuredClone(input);
    const result = applyMonetaFleetYears(input);
    expect(result).toMatchObject({ year: 2018, modelYear: 2019, refit: 2023 });
    expect(result.pricing).toBe(input.pricing);
    expect(result.images).toBe(input.images);
    expect(result.builder).toBe(input.builder);
    expect(result.length).toBe(input.length);
    expect(result.specs).toEqual([
      { label: "Year / Refit", value: "2018 / 2023" },
      { label: "Engines", value: "Twin Cummins 600 HP" },
      { label: "Year built", value: "2018" }, { label: "Model year", value: "2019" },
    ]);
    expect(result.description).toBe("Built in 2018 and launch date unconfirmed.");
    expect(input).toEqual(before);
    expect(applyMonetaFleetYears(result)).toEqual(result);
    const schema = yachtProductSchema(result);
    expect(schema.additionalProperty).toEqual(expect.arrayContaining([
      { "@type": "PropertyValue", name: "Year built", value: 2018 },
      { "@type": "PropertyValue", name: "Model year", value: 2019 },
    ]));
  });

  it("does not alter another yacht even if its name is Moneta", () => {
    const other = fleetYacht({ slug: "another-yacht" });
    expect(applyMonetaFleetYears(other)).toBe(other);
  });

  it("does not replace unrelated numbers, prices, refits or video years", () => {
    const text = "2019 video; 2021 survey; refit 2023; price AED 2021000; model year 2019";
    expect(correctMonetaYearText(text)).toBe(text);
  });
});
