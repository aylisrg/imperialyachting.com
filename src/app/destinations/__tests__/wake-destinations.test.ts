import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { destinations } from "@/data/destinations";
import { MARINAS } from "@/data/dockAndDine";
import { isClipId } from "@/data/clips";
import { isWakeRoute } from "@/components/wake/routes";
import { DESTINATION_CLIPS, DESTINATION_FALLBACK, destinationClips } from "@/components/wake/destinationClips";
import type { Destination } from "@/types/common";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");

describe("Destinations (Wake redesign)", () => {
  it("are Wake routes, including sub-pages and Dock & Dine", () => {
    for (const p of ["/destinations", "/destinations/palm-jumeirah", "/destinations/dock-and-dine-dubai"]) expect(isWakeRoute(p), p).toBe(true);
  });

  it("every destination in the data has clips, all from the manifest", () => {
    for (const d of destinations) expect(DESTINATION_CLIPS[d.slug], d.slug).toBeDefined();
    for (const c of [...Object.values(DESTINATION_CLIPS), DESTINATION_FALLBACK]) for (const id of Object.values(c)) expect(isClipId(id), id).toBe(true);
    expect(destinationClips("a-route-added-later")).toBe(DESTINATION_FALLBACK);
  });

  it("page sources name only manifest clips", () => {
    for (const f of ["WakeDestinations.tsx", "[slug]/WakeDestinationDetail.tsx", "dock-and-dine-dubai/DockAndDineContent.tsx"]) {
      for (const m of read(f).matchAll(/clip="([a-z0-9-]+)"/g)) expect(isClipId(m[1]), `${f}: ${m[1]}`).toBe(true);
    }
  });

  it("Dock & Dine keeps the full directory of 20 marinas", () => {
    expect(MARINAS).toHaveLength(20);
    expect(new Set(MARINAS.map((m) => m.name)).size).toBe(20);
  });
});

describe("destinationFacts", async () => {
  const { destinationFacts } = await import("../[slug]/facts");
  const palm = destinations.find((d) => d.slug === "palm-jumeirah") as Destination;

  it("reads the strip from the data", () => {
    expect(destinationFacts(palm)).toEqual([
      { label: "From Dubai Harbour", value: "15-30 min" },
      { label: "Duration", value: "1-2 hours" },
      { label: "Distance", value: "4 NM" },
      { label: "Best for", value: "Sunset cruise" },
    ]);
  });

  it("leaves out what the data does not have", () => {
    const bare = { ...palm, sailingTime: "", duration: "", distanceNM: undefined, bestFor: [] } as Destination;
    expect(destinationFacts(bare)).toEqual([]);
  });
});

describe("routeCountTitle", async () => {
  const { routeCountTitle } = await import("../count");
  it("spells the count", () => {
    expect(routeCountTitle(5)).toBe("Five routes.");
    expect(routeCountTitle(1)).toBe("One route.");
    expect(routeCountTitle(12)).toBe("12 routes.");
  });
});
