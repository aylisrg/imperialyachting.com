import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CLIP_IDS, SERVER_VIDEO_FILES, clipFiles, isClipId, missingOnServer } from "../clips";
import { HOME_FLEET, HOME_HERO_CLIP } from "../home";

const ROOT = path.resolve(__dirname, "../../..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : sourceFiles(p);
    return /\.(tsx?|jsx?)$/.test(e.name) ? [p] : [];
  });
}

describe("clip manifest", () => {
  it("is 12 clips, 48 files, all unique", () => {
    expect(new Set(CLIP_IDS).size).toBe(12);
    const files = clipFiles();
    expect(files).toHaveLength(48);
    expect(new Set(files).size).toBe(48);
    expect(files.slice(0, 4)).toEqual([
      "hero-vd40-speed-960.webm", "hero-vd40-speed-960.mp4",
      "hero-vd40-speed-1920.webm", "hero-vd40-speed-1920.mp4",
    ]);
  });

  it("has a local poster for every clip, and no orphan posters", () => {
    const posters = fs.readdirSync(path.join(ROOT, "public/media/home/posters"))
      .filter((f) => f.endsWith(".jpg")).map((f) => f.replace(/\.jpg$/, "")).sort();
    expect(posters).toEqual([...CLIP_IDS].sort());
  });

  it("covers every clip the data names", () => {
    expect(isClipId(HOME_HERO_CLIP)).toBe(true);
    for (const y of HOME_FLEET) expect(isClipId(y.clip), y.clip).toBe(true);
  });

  it("covers every clip=\"…\" / clip: \"…\" literal in src", () => {
    const named = new Set<string>();
    for (const f of sourceFiles(path.join(ROOT, "src"))) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/\bclip(?:=|:\s*)"([a-z0-9-]+)"/g)) named.add(m[1]);
    }
    expect(named.size).toBeGreaterThan(0);
    for (const id of named) expect(isClipId(id), id).toBe(true);
  });

  it("uses every clip somewhere, so the 48 files are all wired in", () => {
    const src = sourceFiles(path.join(ROOT, "src")).filter((f) => !f.endsWith(path.join("data", "clips.ts")))
      .map((f) => fs.readFileSync(f, "utf8")).join("\n");
    for (const id of CLIP_IDS) expect(src.includes(`"${id}"`), id).toBe(true);
  });
});

describe("server list (SERVER_VIDEO_FILES in src/data/clips.ts)", () => {
  const filled = SERVER_VIDEO_FILES.length > 0;

  it.skipIf(!filled)("has exactly 48 flat, unique video file names", () => {
    expect(SERVER_VIDEO_FILES).toHaveLength(48);
    expect(new Set(SERVER_VIDEO_FILES).size).toBe(48);
    for (const f of SERVER_VIDEO_FILES) expect(f, f).toMatch(/^[a-z0-9-]+-(960|1920)\.(webm|mp4)$/);
  });

  it.skipIf(!filled)("holds every file a page asks for", () => {
    expect(missingOnServer()).toEqual([]);
  });

  it("missingOnServer reports what a list lacks", () => {
    const all = clipFiles();
    expect(missingOnServer(all)).toEqual([]);
    expect(missingOnServer(all.slice(1))).toEqual([all[0]]);
  });
});
