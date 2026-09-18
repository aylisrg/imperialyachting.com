import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";
import { services } from "@/data/services";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Our Services — Charter, Management, Cinematography & Branding",
  description:
    "Imperial Yachting services: luxury yacht charter, professional fleet management, yacht cinematography & content production, and Brandwave yacht branding in Dubai.",
  alternates: { canonical: `${SITE_CONFIG.url}/services` },
  openGraph: {
    title: "Our Services | Imperial Yachting",
    description:
      "Luxury yacht charter, fleet management, cinematography, and yacht branding in Dubai.",
    url: `${SITE_CONFIG.url}/services`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Imperial Yachting Services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services | Imperial Yachting",
    description: "Yacht charter, management, cinematography & branding in Dubai.",
    images: ["/og-image.jpg"],
  },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ])}
      />
      <JsonLd
        data={itemListSchema(
          "Imperial Yachting Services",
          services.map((service) => ({
            name: service.title,
            url: service.href,
          }))
        )}
      />
      <ServicesPageContent />
    </>
  );
}
