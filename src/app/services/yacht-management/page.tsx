import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { managementFAQ } from "@/data/faq";
import { YachtManagementPageContent } from "./YachtManagementPageContent";

export const metadata: Metadata = {
  title: "Yacht Management Services Dubai — Fleet & Revenue Management",
  description:
    "Professional yacht management in Dubai by Imperial Yachting. Charter revenue optimization, crew management, maintenance, accounting & berth management.",
  alternates: { canonical: `${SITE_CONFIG.url}/services/yacht-management` },
  openGraph: {
    title: "Yacht Management Services Dubai | Imperial Yachting",
    description:
      "Professional yacht management — revenue optimization, crew, maintenance & berth management.",
    url: `${SITE_CONFIG.url}/services/yacht-management`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Yacht Management Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yacht Management Dubai | Imperial Yachting",
    description: "Professional yacht management — revenue, crew & maintenance in Dubai.",
    images: ["/og-image.jpg"],
  },
};

export default function YachtManagementPage() {
  return (
    <>
      <JsonLd data={faqSchema(managementFAQ)} />
      <YachtManagementPageContent />
    </>
  );
}
