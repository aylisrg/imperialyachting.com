import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";
import { buildLlmsFullTxt } from "@/lib/seo/llms";
import { fetchSaleListings } from "@/lib/sales/listings-db";
import type { SaleListing } from "@/types/sale";

export const revalidate = 3600;

const FALLBACK = buildLlmsFullTxt({ yachts: [], destinations: [] });

export async function GET() {
  let body: string;

  try {
    const [yachts, destinations] = await Promise.all([
      fetchAllYachts(),
      fetchAllDestinations(),
    ]);
    // Sales are optional: a failure there must not blank the whole file.
    const sales: SaleListing[] = await fetchSaleListings().catch(() => []);
    body = buildLlmsFullTxt({ yachts, destinations, sales });
  } catch (error) {
    console.error("[llms-full.txt] Failed to build document:", error);
    body = FALLBACK;
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
