import { describe, expect, it } from "vitest";
import { getRequestCountry, normalizeCountry } from "../country";

const h = (init: Record<string, string>) => new Headers(init);

describe("getRequestCountry", () => {
  it("returns null with no country headers", () => {
    expect(getRequestCountry(h({}), {})).toBeNull();
  });
  it("ignores cf-ipcountry when TRUST_CF_IPCOUNTRY is off", () => {
    expect(getRequestCountry(h({ "cf-ipcountry": "AE" }), {})).toBeNull();
    expect(getRequestCountry(h({ "cf-ipcountry": "AE" }), { TRUST_CF_IPCOUNTRY: "0" })).toBeNull();
  });
  it("uses cf-ipcountry when TRUST_CF_IPCOUNTRY=1", () => {
    expect(
      getRequestCountry(h({ "cf-ipcountry": "ae", "x-vercel-ip-country": "DE" }), { TRUST_CF_IPCOUNTRY: "1" }),
    ).toBe("AE");
  });
  it("falls back to x-vercel-ip-country", () => {
    expect(getRequestCountry(h({ "cf-ipcountry": "AE", "x-vercel-ip-country": "DE" }), {})).toBe("DE");
  });
  it("falls back to the COUNTRY_HEADER env header", () => {
    expect(getRequestCountry(h({ "x-geoip-country": "RU" }), { COUNTRY_HEADER: "X-GeoIP-Country" })).toBe("RU");
  });
  it.each(["XX", "T1", "", "USA", "1A"])("skips invalid cf value %j and falls back", (v) => {
    expect(
      getRequestCountry(h({ "cf-ipcountry": v, "x-vercel-ip-country": "DE" }), { TRUST_CF_IPCOUNTRY: "1" }),
    ).toBe("DE");
    expect(getRequestCountry(h({ "cf-ipcountry": v }), { TRUST_CF_IPCOUNTRY: "1" })).toBeNull();
  });
});

describe("normalizeCountry", () => {
  it("uppercases valid codes and rejects others", () => {
    expect(normalizeCountry(" gb ")).toBe("GB");
    expect(normalizeCountry("xx")).toBeNull();
    expect(normalizeCountry(null)).toBeNull();
  });
});
