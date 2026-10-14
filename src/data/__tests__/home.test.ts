import { describe, expect, it } from "vitest";
import { HOME_FLEET, HOME_CLIP_BASE, builtRefit } from "../home";

describe("home data", () => {
  it("defaults clip base to /videos", () => {
    expect(HOME_CLIP_BASE).toBe("/videos");
  });
  it("has verified fleet capacities", () => {
    const by = Object.fromEntries(HOME_FLEET.map((y) => [y.slug, y]));
    expect(by["monte-carlo-6"].guests).toBe(18);
    expect(by["evo-43"].guests).toBe(12);
    expect(by["evo-43"].berth).toBe("Marasi Bay");
  });
  it("formats built/refit", () => {
    expect(builtRefit({ built: 2010, refit: 2024 })).toBe("2010 / 2024");
    expect(builtRefit({ built: 2016, refit: null })).toBe("2016");
    expect(builtRefit({ built: null, refit: 2023 })).toBeNull();
  });
});
