import { describe, it, expect } from "vitest";
import { NAV_LINKS, HEADER_NAV_LINKS } from "../constants";

describe("Docs link placement", () => {
  it("is in the footer list (NAV_LINKS)", () => {
    expect(NAV_LINKS.some((l) => l.href === "/documents")).toBe(true);
  });

  it("is not in the header", () => {
    expect(HEADER_NAV_LINKS.some((l) => l.href === "/documents")).toBe(false);
    expect(HEADER_NAV_LINKS).toHaveLength(NAV_LINKS.length - 1);
  });
});
