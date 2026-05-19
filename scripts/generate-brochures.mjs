import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { scrapeYacht } from "./scrape-yacht.mjs";
import { BrochureDoc } from "./brochure-pdf.jsx";

const SLUGS = process.argv.slice(2);
const DEFAULTS = ["vd-40", "monte-carlo-6", "evo4"];
const targets = SLUGS.length ? SLUGS : DEFAULTS;

const outDir = resolve("brochures");
await mkdir(outDir, { recursive: true });

for (const slug of targets) {
  console.log(`→ Scraping ${slug}...`);
  const yacht = await scrapeYacht(slug);
  const file = resolve(outDir, `${slug}.pdf`);
  console.log(`  rendering ${file}`);
  await renderToFile(React.createElement(BrochureDoc, { yacht }), file);
  console.log(`  ✓ ${slug}.pdf (${yacht.images.length} photos, ${yacht.youtubeIds.length} videos)`);
}
console.log("Done.");
