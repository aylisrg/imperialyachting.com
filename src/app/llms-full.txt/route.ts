import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";
import { buildLlmsFullTxt } from "@/lib/seo/llms";

export const revalidate = 3600;

const FALLBACK = buildLlmsFullTxt({ yachts: [], destinations: [] });

export async function GET() {
  let body: string;

  try {
    const [yachts, destinations] = await Promise.all([
      fetchAllYachts(),
      fetchAllDestinations(),
    ]);
    body = buildLlmsFullTxt({ yachts, destinations });
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
