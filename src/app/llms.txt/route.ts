import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";
import { buildLlmsTxt } from "@/lib/seo/llms";

export const revalidate = 3600;

const FALLBACK = buildLlmsTxt({ yachts: [], destinations: [] });

export async function GET() {
  let body: string;

  try {
    const [yachts, destinations] = await Promise.all([
      fetchAllYachts(),
      fetchAllDestinations(),
    ]);
    body = buildLlmsTxt({ yachts, destinations });
  } catch (error) {
    console.error("[llms.txt] Failed to build document:", error);
    body = FALLBACK;
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
