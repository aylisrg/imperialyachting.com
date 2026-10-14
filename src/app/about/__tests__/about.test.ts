import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ABOUT_CREW_CLIPS, aboutCrew } from "../crew";
import { isClipId } from "@/data/clips";
import { isWakeRoute } from "@/components/wake/routes";

const src = fs.readFileSync(path.resolve(__dirname, "../AboutPageContent.tsx"), "utf8");

describe("/about (Wake redesign)", () => {
  it("is a Wake route", () => {
    expect(isWakeRoute("/about")).toBe(true);
  });

  it("shows the two people on board, each with a known clip", () => {
    expect(aboutCrew.map((m) => m.name)).toEqual(["Ilia Sergeenko", "Mikhail Sazanov"]);
    for (const id of Object.values(ABOUT_CREW_CLIPS)) expect(isClipId(id), id).toBe(true);
  });

  it("uses only clips from the manifest", () => {
    for (const m of src.matchAll(/clip="([a-z0-9-]+)"/g)) expect(isClipId(m[1]), m[1]).toBe(true);
  });

  it("names the real berth: Evo 43 lies at Marasi Bay, not only Dubai Harbour", () => {
    expect(src).toContain('"Dubai Harbour · Marasi Bay"');
  });

  it("loads the crew posters eagerly so the tiles are never blank on mobile", () => {
    expect(src).toMatch(/className="about-crew" eager/);
  });

  it("carries no placeholder partners or invented figures", () => {
    expect(src).not.toMatch(/Partner Logo|1,200\+|5,000\+/);
  });
});
