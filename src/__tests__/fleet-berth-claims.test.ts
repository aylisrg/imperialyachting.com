import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// The EVO 43 lies at Marasi Bay (src/data/home.ts), so no copy may claim the
// whole fleet is at Dubai Harbour.
const BANNED = [
  /(?:our|owned|premium|whole|entire)\s+(?:owned\s+)?fleet(?: of [a-z ]+)?\s+(?:at|from)\s+Dubai Harbour(?!\s+and Marasi)/i,
  /Our fleet is berthed at Dubai Harbour/i,
  /All Imperial Yachting vessels are berthed at Dubai Harbour/i,
  /fleet, lying Dubai Harbour/i,
  /Every route starts at (?:our home berth, )?Dubai Harbour/i,
  /from our Dubai Harbour berth/i,
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return n === "__tests__" ? [] : files(p);
    return /\.(tsx?|mdx?)$/.test(n) ? [p] : [];
  });
}

describe("fleet berth copy", () => {
  it("no text claims the whole fleet is at Dubai Harbour", () => {
    const hits: string[] = [];
    for (const f of files(join(process.cwd(), "src"))) {
      const t = readFileSync(f, "utf8");
      for (const re of BANNED) if (re.test(t)) hits.push(`${f}: ${re}`);
    }
    expect(hits).toEqual([]);
  });
});
