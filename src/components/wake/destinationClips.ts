import type { ClipId } from "@/data/clips";

/**
 * Clips per destination slug (design/pages/destinations @ c0f9dc1). The card
 * clip is the one on /destinations; hero and band are used on the route page.
 * A destination without an entry (e.g. one added later in Supabase) gets the
 * fallback, so a new route never renders without media.
 */
export const DESTINATION_CLIPS: Record<string, { card: ClipId; hero: ClipId; band: ClipId }> = {
  "dubai-harbour": { card: "harbour-sunset", hero: "harbour-sunset", band: "harbour-traffic" },
  "palm-jumeirah": { card: "moneta-golden", hero: "moneta-golden", band: "vd40-aerial" },
  "dubai-marina": { card: "vd40-skyline", hero: "vd40-skyline", band: "route-skyline" },
  "world-islands": { card: "evo43-run", hero: "evo43-run", band: "route-canal" },
  "ain-dubai": { card: "harbour-traffic", hero: "harbour-traffic", band: "vd40-aerial" },
};

export const DESTINATION_FALLBACK: { card: ClipId; hero: ClipId; band: ClipId } = {
  card: "route-canal", hero: "route-canal", band: "route-skyline",
};

export function destinationClips(slug: string) {
  return DESTINATION_CLIPS[slug] ?? DESTINATION_FALLBACK;
}
