import { createServerSupabase } from "./supabase/server";
import type { Destination } from "@/types/common";
import type { DestinationRow } from "./supabase/types";
import { destinations as staticDestinations } from "@/data/destinations";

/**
 * Fetch all destinations from Supabase.
 * Falls back to static data if Supabase is unavailable or empty.
 */
export async function fetchAllDestinations(): Promise<Destination[]> {
  try {
    const supabase = await createServerSupabase();

    const { data: destinations } = await supabase
      .from("destinations")
      .select("*")
      .order("sort_order", { ascending: true });

    const rows = destinations as DestinationRow[] | null;

    if (!rows || rows.length === 0) return staticDestinations;

    return rows.map((d) => ({
      slug: d.slug,
      name: d.name,
      description: d.description || "",
      sailingTime: d.sailing_time || "",
      bestFor: d.best_for || [],
      image: d.image || "",
      highlights: d.highlights || [],
    }));
  } catch {
    return staticDestinations;
  }
}
