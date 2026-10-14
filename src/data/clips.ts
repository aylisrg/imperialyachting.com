/**
 * The video clips the redesign (#46) plays. Each is four files on the clip
 * server (NEXT_PUBLIC_CLIP_BASE_URL; on the VPS that is nginx serving
 * /srv/imperialyachting/videos/, flat, no subfolders):
 *
 *   <id>-960.webm  <id>-960.mp4  <id>-1920.webm  <id>-1920.mp4
 *
 * 12 clips × 4 = the 48 files on the server. A poster per clip stays local in
 * public/media/home/posters/<id>.jpg. Every clip a page names must be listed
 * here (src/data/__tests__/clips.test.ts checks the source tree), so a typo
 * or a clip the server does not have fails CI instead of showing a poster
 * forever.
 */
export const CLIP_IDS = [
  "hero-vd40-speed",
  "vd40-aerial",
  "vd40-skyline",
  "moneta-golden",
  "evo43-run",
  "harbour-sunset",
  "harbour-traffic",
  "route-canal",
  "route-skyline",
  "ilia-harbour",
  "ilia-onboard",
  "misha-onboard",
] as const;

export type ClipId = (typeof CLIP_IDS)[number];

export const CLIP_WIDTHS = [960, 1920] as const;
export const CLIP_FORMATS = ["webm", "mp4"] as const;

/** Every file name the clip server must hold, in a stable order. */
export function clipFiles(ids: readonly string[] = CLIP_IDS): string[] {
  return ids.flatMap((id) => CLIP_WIDTHS.flatMap((w) => CLIP_FORMATS.map((f) => `${id}-${w}.${f}`)));
}

export function isClipId(id: string): id is ClipId {
  return (CLIP_IDS as readonly string[]).includes(id);
}

/**
 * THE SERVER LIST: the 48 files in /srv/imperialyachting/videos/ on the VPS
 * (flat, served at /videos/<clip>-<1920|960>.<mp4|webm>), as the design team
 * delivered them. The one place the real file names live; clips.test.ts
 * checks there are 48, that they are flat names, and that every file a page
 * asks for (clipFiles()) is here. When the server changes, update this list
 * from `ls -1 /srv/imperialyachting/videos/`.
 */
export const SERVER_VIDEO_FILES: readonly string[] = [
  "evo43-run-1920.mp4",
  "evo43-run-1920.webm",
  "evo43-run-960.mp4",
  "evo43-run-960.webm",
  "harbour-sunset-1920.mp4",
  "harbour-sunset-1920.webm",
  "harbour-sunset-960.mp4",
  "harbour-sunset-960.webm",
  "harbour-traffic-1920.mp4",
  "harbour-traffic-1920.webm",
  "harbour-traffic-960.mp4",
  "harbour-traffic-960.webm",
  "hero-vd40-speed-1920.mp4",
  "hero-vd40-speed-1920.webm",
  "hero-vd40-speed-960.mp4",
  "hero-vd40-speed-960.webm",
  "ilia-harbour-1920.mp4",
  "ilia-harbour-1920.webm",
  "ilia-harbour-960.mp4",
  "ilia-harbour-960.webm",
  "ilia-onboard-1920.mp4",
  "ilia-onboard-1920.webm",
  "ilia-onboard-960.mp4",
  "ilia-onboard-960.webm",
  "misha-onboard-1920.mp4",
  "misha-onboard-1920.webm",
  "misha-onboard-960.mp4",
  "misha-onboard-960.webm",
  "moneta-golden-1920.mp4",
  "moneta-golden-1920.webm",
  "moneta-golden-960.mp4",
  "moneta-golden-960.webm",
  "route-canal-1920.mp4",
  "route-canal-1920.webm",
  "route-canal-960.mp4",
  "route-canal-960.webm",
  "route-skyline-1920.mp4",
  "route-skyline-1920.webm",
  "route-skyline-960.mp4",
  "route-skyline-960.webm",
  "vd40-aerial-1920.mp4",
  "vd40-aerial-1920.webm",
  "vd40-aerial-960.mp4",
  "vd40-aerial-960.webm",
  "vd40-skyline-1920.mp4",
  "vd40-skyline-1920.webm",
  "vd40-skyline-960.mp4",
  "vd40-skyline-960.webm",
];

/** Files a page asks for that the server list does not have (empty = all wired). */
export function missingOnServer(server: readonly string[] = SERVER_VIDEO_FILES): string[] {
  const have = new Set(server);
  return clipFiles().filter((f) => !have.has(f));
}
