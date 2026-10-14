import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { FLEET_CLIPS, fleetClips } from "../fleetClips";
import { HOME_FLEET } from "@/data/home";

describe("fleetClips", () => {
  it("has a clip for every yacht on the home page", () => {
    for (const y of HOME_FLEET) expect(fleetClips(y.href.replace("/fleet/", "")), y.href).not.toBeNull();
  });
  it("only uses clips that ship a poster", () => {
    for (const c of Object.values(FLEET_CLIPS)) {
      for (const id of [c.card, c.hero, c.band]) {
        expect(existsSync(path.join(process.cwd(), "public/media/home/posters", `${id}.jpg`)), id).toBe(true);
      }
    }
  });
  it("returns null for unknown yachts (photo fallback)", () => {
    expect(fleetClips("new-boat")).toBeNull();
  });
});
