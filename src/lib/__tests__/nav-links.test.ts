import { describe, it, expect } from "vitest";
import { NAV_LINKS, HEADER_NAV_LINKS } from "../constants";

describe("Docs link placement", () => {
  it("is in the footer list (NAV_LINKS)", () => {
    expect(NAV_LINKS.some((l) => l.href === "/documents")).toBe(true);
  });

  it("is not in the header", () => {
    expect(HEADER_NAV_LINKS.some((l) => l.href === "/documents")).toBe(false);
    expect(HEADER_NAV_LINKS).toHaveLength(NAV_LINKS.length - 2);
  });
});

describe("Yacht Sales link placement", () => {
  it("is discoverable in the footer without expanding the header", () => {
    expect(NAV_LINKS.find((l) => l.href === "/yachts-for-sale")).toEqual({
      label: "Yacht Sales", href: "/yachts-for-sale", footerOnly: true,
    });
    expect(HEADER_NAV_LINKS.some((l) => l.href === "/yachts-for-sale")).toBe(false);
  });
});
