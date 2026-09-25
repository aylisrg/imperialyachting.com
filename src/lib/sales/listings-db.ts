import { createPublicSupabase } from "@/lib/supabase/public";
import { withRetry } from "@/lib/supabase/with-retry";
import { fetchYachtBySlug } from "@/lib/yachts-db";
import type { SaleListingRow, SaleMediaRow } from "@/lib/supabase/types";
import type { Yacht } from "@/types/yacht";
import type { SaleListing } from "@/types/sale";
import { mergeSaleListing } from "./merge";

/**
 * True for "the sale tables don't exist yet" (migration 008 not applied):
 * PostgREST reports PGRST205, Postgres 42P01. The section then renders empty
 * instead of failing the whole page.
 */
function isMissingTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /PGRST205|42P01|Could not find the table|does not exist/i.test(message);
}

async function fetchFleet(slug: string | null): Promise<Yacht | null> {
  if (!slug) return null;
  try {
    return await fetchYachtBySlug(slug);
  } catch (err) {
    // A fleet hiccup must not take the sale page down — it only loses the
    // borrowed photos/specs for this render.
    console.error(`[sales] fleet yacht "${slug}" unavailable:`, err);
    return null;
  }
}

async function fetchMedia(listingIds: string[]): Promise<SaleMediaRow[]> {
  if (listingIds.length === 0) return [];
  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("sale_media")
    .select("*")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[sales] sale_media query failed:", error.message);
    return [];
  }
  return (data ?? []) as SaleMediaRow[];
}

async function hydrate(rows: SaleListingRow[]): Promise<SaleListing[]> {
  const media = await fetchMedia(rows.map((r) => r.id));
  return Promise.all(
    rows.map(async (row) =>
      mergeSaleListing(
        row,
        media.filter((m) => m.listing_id === row.id),
        await fetchFleet(row.fleet_yacht_slug)
      )
    )
  );
}

/** Every live (non-draft) listing, available first, sold last. */
export async function fetchSaleListings(): Promise<SaleListing[]> {
  const supabase = createPublicSupabase();
  let rows: SaleListingRow[];
  try {
    rows =
      ((await withRetry(
        () =>
          supabase
            .from("sale_listings")
            .select("*")
            .neq("status", "draft")
            .order("sort_order", { ascending: true }),
        { label: "fetchSaleListings" }
      )) as SaleListingRow[] | null) ?? [];
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }

  const rank = { published: 0, under_offer: 1, sold: 2, draft: 3 } as const;
  return (await hydrate(rows)).sort((a, b) => rank[a.status] - rank[b.status]);
}

/** A single live listing, or null when it doesn't exist or is still a draft. */
export async function fetchSaleListingBySlug(slug: string): Promise<SaleListing | null> {
  const supabase = createPublicSupabase();
  let row: SaleListingRow | null;
  try {
    row = (await withRetry(
      () =>
        supabase
          .from("sale_listings")
          .select("*")
          .eq("slug", slug)
          .neq("status", "draft")
          .maybeSingle(),
      { label: `fetchSaleListingBySlug(${slug})` }
    )) as SaleListingRow | null;
  } catch (err) {
    if (isMissingTable(err)) return null;
    throw err;
  }

  if (!row) return null;
  const [listing] = await hydrate([row]);
  return listing;
}
