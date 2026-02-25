import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, serviceSchema, breadcrumbSchema } from "@/components/seo/schemas";
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
      <JsonLd
        data={serviceSchema({
          name: "Yacht Management Dubai",
          description:
            "Full-service yacht management in Dubai by Imperial Yachting. Services include charter revenue optimisation, crew recruitment and training, scheduled maintenance, financial reporting, berth management at Dubai Harbour, and marketing across B2B and direct channels.",
          url: `${SITE_CONFIG.url}/services/yacht-management`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Yacht Management Dubai", url: "/services/yacht-management" },
        ])}
      />
      <YachtManagementPageContent />
    </>
  );
}
