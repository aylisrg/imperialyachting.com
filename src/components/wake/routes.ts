/**
 * Routes rendered in the Wake redesign (issue #46). These pages bring their own
 * nav and footer (WakePage), so SiteShell must not add the legacy Header/Footer.
 * Each redesign PR adds its routes here; legal sub-pages (e.g. transfer terms) stay legacy.
 */
export const WAKE_ROUTES: readonly string[] = [
  "/",
  "/services",
  "/services/charter",
  "/services/speedboat-transfer",
  "/services/yacht-management",
  "/services/cinematography",
  "/services/brandwave",
  "/fleet",
  "/contact",
  "/about",
];

/** Dynamic route prefixes (e.g. "/fleet/" for yacht pages). */
export const WAKE_PREFIXES: readonly string[] = ["/fleet/"];

export function isWakeRoute(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (WAKE_ROUTES.includes(p)) return true;
  return WAKE_PREFIXES.some((pre) => p.startsWith(pre) && p.length > pre.length);
}
