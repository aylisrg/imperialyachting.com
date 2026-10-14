import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** The redesign links Docs (/documents) from its footer, not from the top menu. */
const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../../..", p), "utf8");

describe("Docs link in the redesign", () => {
  it("is in the home footer", () => {
    const footer = read("src/app/page.tsx").match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
    expect(footer).toContain('<Link href="/documents">Docs</Link>');
  });

  it("is not in the redesign's top menu", () => {
    expect(read("src/components/home/HomeChrome.tsx")).not.toContain("/documents");
  });
});
