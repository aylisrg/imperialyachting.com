// Source: design/prototype/content/fleet.json (design/design-code @ 858bc96, issue #46).
// Verified data only; null fields are not rendered.
export interface HomeYacht {
  slug: string;
  name: string;
  hull: string;
  builder: string;
  model?: string;
  loa: string | null;
  guests: number | null;
  built: number | null;
  refit: number | null;
  berth: string | null;
  clip: string;
  /** Existing yacht detail page with the booking widget. */
  href: string;
}

export const HOME_FLEET: HomeYacht[] = [
  { slug: "vd-40", name: "Van Dutch 40", hull: "DT 2035", builder: "Van Dutch", loa: "12 m", guests: 10, built: 2010, refit: 2024, berth: "Dubai Harbour", clip: "vd40-aerial", href: "/fleet/van-dutch-40" },
  { slug: "monte-carlo-6", name: "Moneta", hull: "DT 2720", builder: "Monte Carlo Yachts", model: "Monte Carlo 6", loa: "18 m", guests: 18, built: 2016, refit: 2023, berth: "Dubai Harbour", clip: "moneta-golden", href: "/fleet/monte-carlo-6" },
  { slug: "evo-43", name: "Evo 43", hull: "DP 4069", builder: "Evo", loa: "13 m", guests: 12, built: null, refit: null, berth: "Marasi Bay", clip: "evo43-run", href: "/fleet/evo-43" },
];

export const HOME_HERO_CLIP = "hero-vd40-speed";
/**
 * Base URL for the video clips (<id>-960|1920.webm|mp4). One setting: point
 * NEXT_PUBLIC_CLIP_BASE_URL at a CDN to move clips off the app server.
 */
export const HOME_CLIP_BASE = (process.env.NEXT_PUBLIC_CLIP_BASE_URL || "/videos").replace(/\/+$/, "");
/** Posters stay local so next/image can serve AVIF/WebP without remotePatterns. */
export const HOME_POSTER_BASE = "/media/home/posters";

export function builtRefit(y: Pick<HomeYacht, "built" | "refit">): string | null {
  if (!y.built) return null;
  return y.refit ? `${y.built} / ${y.refit}` : String(y.built);
}
