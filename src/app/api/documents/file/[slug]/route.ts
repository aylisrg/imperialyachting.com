import fs from "node:fs";
import { NextResponse } from "next/server";
import { isUnlocked } from "@/lib/documents-auth";
import { getDocumentBySlug } from "@/lib/documents";
import { getDocumentFilePath } from "@/lib/documents-files";

export const runtime = "nodejs";

/**
 * Streams a private document PDF, but only to visitors who have unlocked the
 * portal with the shared password. Without a valid session cookie the request
 * is refused, so the files are never reachable by direct URL.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const doc = getDocumentBySlug(slug);
  const filePath = getDocumentFilePath(slug);

  if (!doc || !filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const downloadName = `${doc.slug}.pdf`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
