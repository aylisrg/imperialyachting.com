import type { ClipId } from "@/data/clips";

/**
 * Clips per journal post (design/pages/blog @ c0f9dc1): one per card on
 * /blog, so no clip repeats on the index; the post page uses the same one as
 * its hero. A post without an entry gets the fallback.
 */
export const POST_CLIPS: Record<string, ClipId> = {
  "yacht-rental-dubai-price-guide-2026": "vd40-aerial",
  "how-many-hours-to-book-a-yacht-in-dubai": "moneta-golden",
  "dubai-harbour-vs-dubai-marina-yacht-departure": "harbour-sunset",
  "birthday-party-on-a-yacht-in-dubai-checklist": "ilia-onboard",
  "whats-included-in-a-yacht-charter-and-extras": "evo43-run",
  "book-a-yacht-in-dubai-with-chatgpt-or-claude": "route-skyline",
};

export const POST_FALLBACK_CLIP: ClipId = "harbour-traffic";

export function postClip(slug: string): ClipId {
  return POST_CLIPS[slug] ?? POST_FALLBACK_CLIP;
}

/**
 * The closing CTA clip of a post page. Design review #46: it must not repeat
 * the post's own hero clip or any related-post card, so it is the first
 * candidate the page does not already play.
 */
export const POST_CTA_CLIPS: readonly { clip: ClipId; alt: string }[] = [
  { clip: "route-canal", alt: "Dubai Water Canal from the water" },
  { clip: "vd40-skyline", alt: "Van Dutch 40 with the Dubai Marina skyline" },
  { clip: "hero-vd40-speed", alt: "Van Dutch 40 at speed" },
];

export function postCtaClip(slug: string, relatedSlugs: readonly string[]): { clip: ClipId; alt: string } {
  const used = new Set([postClip(slug), ...relatedSlugs.map(postClip)]);
  return POST_CTA_CLIPS.find((c) => !used.has(c.clip)) ?? POST_CTA_CLIPS[0];
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
