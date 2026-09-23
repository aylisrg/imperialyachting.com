import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookie-free Supabase client for public, read-only data (yachts,
 * destinations, sitemap). Unlike `createServerSupabase`, it never calls
 * `cookies()`, so it works inside `generateStaticParams`, at build time and
 * in ISR pages — calling `cookies()` there makes Next.js throw
 * DYNAMIC_SERVER_USAGE and the page returns 500.
 */
export function createPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
