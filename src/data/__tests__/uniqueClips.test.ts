import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Design review on #46: a page must not play the same clip twice. This reads
 * the clip ids a page names literally (clip="..." and clip: "...") and fails
 * on any repeat. Pages that pick clips at runtime have their own test.
 */
const PAGES = [
  "src/app/about/AboutPageContent.tsx",
  "src/app/destinations/dock-and-dine-dubai/DockAndDineContent.tsx",
  "src/app/blog/WakeBlog.tsx",
];

function literalClips(file: string): string[] {
  const src = fs.readFileSync(path.resolve(__dirname, "../../..", file), "utf8");
  return [...src.matchAll(/clip(?:=|:\s*)"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

describe("each Wake page plays every clip at most once", () => {
  for (const file of PAGES) {
    it(file, () => {
      const clips = literalClips(file);
      const dupes = clips.filter((c, i) => clips.indexOf(c) !== i);
      expect(dupes, `${file} repeats ${dupes.join(", ")}`).toEqual([]);
    });
  }
});
