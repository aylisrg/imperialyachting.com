import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { NAMED_PARTNERS } from "../partners";
import { isClipId } from "@/data/clips";
import { isWakeRoute } from "@/components/wake/routes";
import { HOME_FLEET } from "@/data/home";

const src = fs.readFileSync(path.resolve(__dirname, "../PartnersContent.tsx"), "utf8");

describe("/partners (Wake redesign, new page)", () => {
  it("is a Wake route and in the menu", () => {
    expect(isWakeRoute("/partners")).toBe(true);
    expect(fs.readFileSync(path.resolve(__dirname, "../../../components/home/HomeChrome.tsx"), "utf8")).toContain('href: "/partners"');
  });

  it("names no partners until they agree, and then shows no partners block at all", () => {
    expect(NAMED_PARTNERS).toEqual([]);
    expect(src).toMatch(/partners\.length \? \(\s*<WakeSection id="partners-list">/);
    expect(src).not.toMatch(/once they agree to be named|w-empty/);
  });

  it("uses only manifest clips", () => {
    for (const m of src.matchAll(/clip(?:=|:\s*)"([a-z0-9-]+)"/g)) expect(isClipId(m[1]), m[1]).toBe(true);
  });

  it("makes no commission or invented-figure claims", () => {
    expect(src).not.toMatch(/commission|1,200\+|5,000\+/i);
  });

  it("lists the fleet from the fleet data", async () => {
    const { fleetLines } = await import("../lines");
    expect(fleetLines()).toHaveLength(HOME_FLEET.length);
    expect(fleetLines()[1]).toBe("Moneta · Monte Carlo 6 · 18 m · up to 18 guests · Dubai Harbour");
  });
});

describe("/partners berth and metadata (design review #46)", () => {
  const page = fs.readFileSync(path.resolve(__dirname, "../page.tsx"), "utf8");
  it("names both berths: Evo 43 lies at Marasi Bay", () => {
    expect(src).toContain("Base<b>Dubai Harbour · Marasi Bay</b>");
    expect(page).not.toMatch(/fleet owner at Dubai Harbour\./);
    expect(page.match(/Marasi Bay/g)?.length).toBe(3);
  });
  it("has no em dash in the page copy or metadata", () => {
    expect(src + page).not.toContain("\u2014");
  });
});
