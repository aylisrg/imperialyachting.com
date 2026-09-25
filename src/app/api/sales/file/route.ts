import fs from "node:fs";
import { NextResponse } from "next/server";
import { resolveBundledFile, verifyFileToken } from "@/lib/sales/file-token";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  zip: "application/zip",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
};

/**
 * GET /api/sales/file?t=<signed token>
 * Streams a sale material bundled with the site (private/sales/**). The token
 * is issued by POST /api/sales/download after the email gate and expires, so
 * the files are never reachable by a plain URL.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const payload = verifyFileToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "This download link has expired. Please request the materials again." },
      { status: 403 }
    );
  }

  const filePath = resolveBundledFile(payload.location);
  if (!filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = await fs.promises.readFile(filePath);
  const ext = payload.fileName.split(".").pop()?.toLowerCase() ?? "";
  const safeName = payload.fileName.replace(/[^\w.\- ]+/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
