import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { PartnersContent } from "./PartnersContent";

export const metadata: Metadata = {
  title: "Partners — Work with Imperial Yachting, Dubai Harbour",
  description:
    "For travel agents, concierges, event and production teams and service providers: work directly with the fleet owner at Dubai Harbour. Terms on request.",
  alternates: { canonical: `${SITE_CONFIG.url}/partners` },
  openGraph: {
    title: `Partners | ${SITE_CONFIG.name}`,
    description: "Work directly with the fleet owner at Dubai Harbour. Terms for agents and service providers on request.",
    url: `${SITE_CONFIG.url}/partners`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Partners, Imperial Yachting" }],
  },
};

export default function PartnersPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Partners", url: "/partners" }])} />
      <PartnersContent />
    </>
  );
}
