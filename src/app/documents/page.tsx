import type { Metadata } from "next";
import { getDocumentsViewer } from "@/lib/documents-auth";
import { getDocumentsWithAvailability } from "@/lib/documents-files";
import {
  DocumentsPortal,
  type AccessNotice,
} from "@/components/documents/DocumentsPortal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, organizationSchema } from "@/components/seo/schemas";
import { SITE_CONFIG } from "@/lib/constants";

const PAGE_TITLE = "Company Documents — Trade License, Ejari & Registration";
const PAGE_DESCRIPTION = `Official documents of ${SITE_CONFIG.legalName}, Dubai: trade license ${SITE_CONFIG.license}, Ejari, certificate of incorporation and company card. Verify our licensing and download the PDFs with an email sign-in link.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_CONFIG.url}/documents` },
  openGraph: {
    title: `${SITE_CONFIG.name} — Company Documents`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_CONFIG.url}/documents`,
    type: "website",
    siteName: SITE_CONFIG.name,
  },
};

// Reads the session cookie to decide what to unlock — render per request.
export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ access?: string | string[] }>;
}) {
  const [viewer, { access }] = await Promise.all([getDocumentsViewer(), searchParams]);

  let notice: AccessNotice | null = null;
  if (access === "granted" && viewer) notice = "granted";
  else if (access === "expired" && !viewer) notice = "expired";

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Company Documents", url: "/documents" },
        ])}
      />
      <DocumentsPortal
        documents={getDocumentsWithAvailability()}
        viewer={viewer}
        notice={notice}
      />
    </>
  );
}
