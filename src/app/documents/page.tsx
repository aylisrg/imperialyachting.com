import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { DocumentsPageClient } from "@/components/pages/DocumentsPageClient";

export const metadata: Metadata = {
  title: "Documents & Resources",
  description:
    "Company registration, banking details, and guest documentation for Imperial Yachting partners and charter clients.",
  openGraph: {
    title: `Documents & Resources | ${SITE_CONFIG.name}`,
    description:
      "Company registration, banking details, and guest documentation for partners and charter clients.",
    url: `${SITE_CONFIG.url}/documents`,
  },
  robots: { index: true, follow: true },
};

export default function DocumentsPage() {
  return <DocumentsPageClient />;
}
