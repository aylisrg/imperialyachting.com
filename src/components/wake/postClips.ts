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

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
