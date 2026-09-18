import { createServerSupabase } from "@/lib/supabase/server";
import { withRetry } from "@/lib/supabase/with-retry";
import type { ExtraRow } from "@/lib/supabase/types";
import type { Extra } from "@/types/booking";
import { mapExtraFromDB } from "./mappers";

/**
 * Fetch all active extras (add-on services), ordered for display.
 * Public read — allowed by RLS (`active = true`). Retries on transient
 * failures. Throws on persistent failure — never silently returns empty.
 */
export async function fetchActiveExtras(): Promise<Extra[]> {
  const supabase = await createServerSupabase();

  const extras = await withRetry(
    () =>
      supabase
        .from("extras")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    { label: "fetchActiveExtras" }
  );

  if (!extras || (extras as unknown[]).length === 0) return [];

  return (extras as ExtraRow[]).map(mapExtraFromDB);
}
