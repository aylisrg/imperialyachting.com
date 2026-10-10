import fs from "node:fs";
import { NextResponse, after } from "next/server";
import { getDocumentsViewer } from "@/lib/documents-auth";
import { accessContextFromRequest, recordDownload } from "@/lib/documents-access";
import { getDocumentBySlug } from "@/lib/documents";
import { getDocumentFilePath } from "@/lib/documents-files";

export const runtime = "nodejs";

/**
 * Streams a private document PDF, but only to visitors who confirmed their
 * email through a sign-in link. Without a valid session cookie the request is
 * refused, so the files are never reachable by direct URL. Each download is
 * logged against the visitor's email.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const viewer = await getDocumentsViewer();
  if (!viewer) {
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

  const ctx = accessContextFromRequest(request);
  after(() => recordDownload(viewer.email, doc.slug, ctx));

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
