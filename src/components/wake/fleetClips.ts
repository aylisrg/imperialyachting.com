/**
 * Existing clips per yacht slug (posters in public/media/home/posters, clips at
 * NEXT_PUBLIC_CLIP_BASE_URL). A yacht without an entry falls back to its Supabase photo.
 */
export const FLEET_CLIPS: Record<string, { card: string; hero: string; band: string }> = {
  "van-dutch-40": { card: "vd40-aerial", hero: "hero-vd40-speed", band: "vd40-aerial" },
  "monte-carlo-6": { card: "moneta-golden", hero: "moneta-golden", band: "ilia-onboard" },
  "evo-43": { card: "evo43-run", hero: "evo43-run", band: "misha-onboard" },
};

export function fleetClips(slug: string) {
  return FLEET_CLIPS[slug] ?? null;
}
