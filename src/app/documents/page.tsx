import type { Metadata } from "next";
import { isUnlocked } from "@/lib/documents-auth";
import { getDocumentsWithAvailability } from "@/lib/documents-files";
import { DocumentsGate } from "@/components/documents/DocumentsGate";
import { DocumentsPortal } from "@/components/documents/DocumentsPortal";

export const metadata: Metadata = {
  title: "Confidential Documents",
  description:
    "Password-protected corporate documents for Imperial Yachting partners and charter clients.",
  robots: { index: false, follow: false },
};

// Reads cookies to decide gate vs. portal — render per request, never cache.
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  if (!(await isUnlocked())) {
    return <DocumentsGate />;
  }

  const documents = getDocumentsWithAvailability();
  return <DocumentsPortal documents={documents} />;
}
