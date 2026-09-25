import { describe, it, expect } from "vitest";
import { saleListingSchema } from "@/components/seo/schemas";
import { mergeSaleListing } from "@/lib/sales/merge";
import { saleRow } from "@/lib/sales/__tests__/fixtures";

describe("saleListingSchema", () => {
  it("describes the yacht as a used Product with every spec as a property", () => {
    const schema = saleListingSchema(mergeSaleListing(saleRow(), [], null));
    expect(schema).toMatchObject({
      "@type": "Product",
      name: "VanDutch 40 “Van Dutch Connect” for sale",
      brand: { name: "VanDutch" },
      model: "VanDutch 40",
      productionDate: "2010",
      itemCondition: "https://schema.org/UsedCondition",
      additionalProperty: [{ "@type": "PropertyValue", name: "Beam", value: "3.50 m" }],
    });
  });

  it("omits the Offer for price on application and adds it when priced", () => {
    expect(saleListingSchema(mergeSaleListing(saleRow(), [], null))).not.toHaveProperty("offers");
    const priced = saleListingSchema(mergeSaleListing(saleRow({ price_amount: 900000, status: "under_offer" }), [], null));
    expect(priced.offers).toMatchObject({
      price: 900000,
      priceCurrency: "AED",
      availability: "https://schema.org/LimitedAvailability",
    });
  });
});
