import "server-only";

import fs from "node:fs";
import path from "node:path";
import { COMPANY_DOCUMENTS, type CompanyDocument } from "@/lib/documents";

/**
 * Server-only helpers for resolving the private document files. The PDFs are
 * stored in `private/documents/` at the project root — deliberately outside
 * `/public` so they are never served statically. They are bundled into the
 * serverless function via `outputFileTracingIncludes` in next.config.ts.
 */

const DOCUMENTS_DIR = path.join(process.cwd(), "private", "documents");

/** Absolute path to a document file, or null if the slug is unknown. */
export function getDocumentFilePath(slug: string): string | null {
  const doc = COMPANY_DOCUMENTS.find((d) => d.slug === slug);
  if (!doc) return null;
  // filename comes from our own static catalog, but guard against traversal.
  const safeName = path.basename(doc.filename);
  return path.join(DOCUMENTS_DIR, safeName);
}

export function documentFileExists(doc: CompanyDocument): boolean {
  try {
    return fs.existsSync(path.join(DOCUMENTS_DIR, path.basename(doc.filename)));
  } catch {
    return false;
  }
}

export interface DocumentWithAvailability extends CompanyDocument {
  available: boolean;
}

/** The full catalog annotated with whether each file is present on disk. */
export function getDocumentsWithAvailability(): DocumentWithAvailability[] {
  return COMPANY_DOCUMENTS.map((doc) => ({
    ...doc,
    available: documentFileExists(doc),
  }));
}
