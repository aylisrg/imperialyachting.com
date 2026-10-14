/**
 * Existing clips per yacht slug (posters in public/media/home/posters, clips at
 * NEXT_PUBLIC_CLIP_BASE_URL). A yacht without an entry falls back to its Supabase photo.
 * card is used on /fleet; hero, band and cta are used on /fleet/[slug] and never repeat there.
 */
export const FLEET_CLIPS: Record<string, { card: string; hero: string; band: string; cta: string }> = {
  "van-dutch-40": { card: "vd40-aerial", hero: "hero-vd40-speed", band: "vd40-skyline", cta: "route-skyline" },
  "monte-carlo-6": { card: "moneta-golden", hero: "moneta-golden", band: "ilia-onboard", cta: "harbour-sunset" },
  "evo-43": { card: "evo43-run", hero: "evo43-run", band: "misha-onboard", cta: "route-canal" },
};

export function fleetClips(slug: string) {
  return FLEET_CLIPS[slug] ?? null;
}
