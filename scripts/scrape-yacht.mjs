import { load } from "cheerio";

const SITE = "https://imperialyachting.com";

/**
 * Scrape a yacht detail page and return a structured object suitable
 * for the brochure renderer. We rely on:
 *   - JSON-LD Product schema for description + image list
 *   - DOM parsing for specs, amenities, included, charter rules, YouTube IDs
 */
export async function scrapeYacht(slug) {
  const res = await fetch(`${SITE}/fleet/${slug}`);
  if (!res.ok) throw new Error(`Failed to fetch /fleet/${slug}: ${res.status}`);
  const html = await res.text();
  const $ = load(html);

  // --- JSON-LD Product schema -------------------------------------------------
  let product = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item["@type"] === "Product") product = item;
      }
    } catch {
      // skip
    }
  });
  if (!product) throw new Error(`No Product JSON-LD on /fleet/${slug}`);

  const rawImages = Array.isArray(product.image) ? product.image : [product.image].filter(Boolean);
  // Route Supabase Storage URLs through the render API so we get correctly-sized
  // re-encoded JPEGs (the originals are 4K and trip @react-pdf's JPEG decoder).
  const images = rawImages.map((url) =>
    url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    ) + (url.includes("?") ? "&" : "?") + "width=1600&quality=80"
  );

  // --- Name / tagline / hero --------------------------------------------------
  const name = $("h1").first().text().trim() || product.name;
  const tagline = $("h1").first().next("p").text().trim() || "";
  const location = $('span:contains("Dubai Harbour"), span:contains("Marasi")').first().text().trim();

  // --- Quick specs bar (Length / Capacity / Builder / Year / Cabins / Location)
  const quickSpecs = {};
  $("section .grid > div").each((_, el) => {
    const label = $(el).find("p").first().text().trim();
    const value = $(el).find("p").last().text().trim();
    if (label && value && label !== value) quickSpecs[label] = value;
  });

  // --- Full specs table -------------------------------------------------------
  const specs = [];
  $("section").each((_, sec) => {
    const heading = $(sec).find("h2,h3").first().text().trim();
    if (heading === "Specifications") {
      $(sec)
        .find('div.grid > div, [class*="border-b"]')
        .each((_, row) => {
          const spans = $(row).find("span");
          if (spans.length >= 2) {
            const label = $(spans[0]).text().trim();
            const value = $(spans[1]).text().trim();
            if (label && value) specs.push({ label, value });
          }
        });
    }
  });

  // --- Amenities --------------------------------------------------------------
  const amenities = [];
  $("section").each((_, sec) => {
    const heading = $(sec).find("h2,h3").first().text().trim();
    if (heading === "Amenities") {
      $(sec)
        .find('div.grid > div span')
        .each((_, el) => {
          const t = $(el).text().trim();
          if (t) amenities.push(t);
        });
    }
  });

  // --- What's Included --------------------------------------------------------
  const included = [];
  $("section").each((_, sec) => {
    const heading = $(sec).find("h2,h3").first().text().trim();
    if (heading === "What's Included") {
      $(sec)
        .find('div.grid > div span')
        .each((_, el) => {
          const t = $(el).text().trim();
          if (t) included.push(t);
        });
    }
  });

  // --- YouTube video IDs ------------------------------------------------------
  const youtubeIds = new Set();
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtube-nocookie\.com\/embed\/|img\.youtube\.com\/vi\/)([A-Za-z0-9_-]{11})/g;
  let m;
  while ((m = ytRegex.exec(html)) !== null) youtubeIds.add(m[1]);

  // --- Description (clean from JSON-LD) ---------------------------------------
  const description = (product.description || "").trim();

  return {
    slug,
    name,
    tagline,
    description,
    location: location || quickSpecs["Location"] || "",
    quickSpecs,
    specs,
    amenities,
    included,
    images,
    youtubeIds: Array.from(youtubeIds),
    brand:
      typeof product.brand === "object"
        ? product.brand?.name || ""
        : product.brand || "",
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2] || "vd-40";
  scrapeYacht(slug).then((y) => {
    console.log(JSON.stringify(y, null, 2));
  });
}
