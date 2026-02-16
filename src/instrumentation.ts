/**
 * Next.js instrumentation — runs once when the server starts.
 * Validates that Supabase is configured and reachable.
 */
export async function register() {
  // Only run on the server (not during edge runtime or client builds)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error(
        "\n╔══════════════════════════════════════════════════════════╗\n" +
        "║  SUPABASE NOT CONFIGURED                                ║\n" +
        "║                                                          ║\n" +
        "║  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_ ║\n" +
        "║  KEY must be set. The fleet and destinations pages will   ║\n" +
        "║  not load.                                               ║\n" +
        "╚══════════════════════════════════════════════════════════╝\n"
      );
      return;
    }

    // Ping Supabase to verify connectivity
    try {
      const res = await fetch(`${url}/rest/v1/yachts?select=id&limit=1`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) {
        console.error(
          `\n[instrumentation] Supabase health check FAILED: HTTP ${res.status}\n` +
          `  URL: ${url}\n` +
          `  Check your Supabase project status and API keys.\n`
        );
        return;
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length === 0) {
        console.warn(
          "\n[instrumentation] WARNING: Supabase is reachable but the yachts table is EMPTY.\n" +
          "  Run supabase/seed.sql to populate initial data, or add yachts via /admin.\n"
        );
      } else {
        console.log("[instrumentation] Supabase connection verified — yachts table has data.");
      }
    } catch (err) {
      console.error(
        `\n[instrumentation] Could not reach Supabase at ${url}\n` +
        `  Error: ${err instanceof Error ? err.message : String(err)}\n` +
        `  Fleet pages may fail until connectivity is restored.\n`
      );
    }
  }
}
