import { NextResponse } from "next/server";

/**
 * Serves the IndexNow key verification file expected at
 * `https://<host>/<key>.txt`. `next.config.ts` rewrites that path to this
 * route. Only responds when the requested key matches `INDEXNOW_KEY` and is
 * at least 8 characters long, otherwise 404s so unrelated `.txt` requests
 * (robots.txt, llms.txt, etc.) are never affected.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const configuredKey = process.env.INDEXNOW_KEY;

  if (!configuredKey || configuredKey.length < 8 || key !== configuredKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(configuredKey, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
