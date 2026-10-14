import { describe, it, expect } from "vitest";
import { isWakeRoute } from "../routes";

describe("isWakeRoute", () => {
  it("covers the home page and the redesigned service pages", () => {
    for (const p of ["/", "/services", "/services/", "/services/charter", "/services/speedboat-transfer", "/services/yacht-management", "/services/cinematography", "/services/brandwave", "/fleet", "/fleet/van-dutch-40", "/fleet/monte-carlo-6/", "/contact", "/about", "/destinations", "/destinations/palm-jumeirah", "/destinations/dock-and-dine-dubai", "/blog", "/blog/some-post"]) {
      expect(isWakeRoute(p), p).toBe(true);
    }
  });
  it("keeps legal and admin pages on the legacy shell", () => {
    for (const p of ["/services/speedboat-transfer/terms", "/admin", "/terms"]) {
      expect(isWakeRoute(p), p).toBe(false);
    }
  });
});
