import { describe, it, expect } from "vitest";
import { SALES_CONTACT, SITE_CONFIG, contactForPath } from "@/lib/constants";

describe("contactForPath", () => {
  it("uses the sales line only inside /yachts-for-sale", () => {
    expect(contactForPath("/yachts-for-sale")).toBe(SALES_CONTACT);
    expect(contactForPath("/yachts-for-sale/vandutch-40-van-dutch-connect")).toBe(SALES_CONTACT);
    expect(contactForPath("/fleet/vd-40")).toBe(SITE_CONFIG);
    expect(contactForPath("/")).toBe(SITE_CONFIG);
    expect(contactForPath(null)).toBe(SITE_CONFIG);
  });
});
