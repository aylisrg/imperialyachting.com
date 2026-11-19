import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, serviceSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { charterFAQ } from "@/data/faq";
import { CharterPageContent } from "./CharterPageContent";

export const metadata: Metadata = {
  title: "Yacht Charter Dubai — Hourly, Daily & Weekly Rentals",
  description:
    "Eight-hour private yacht charters from Dubai Harbour. See VAT-inclusive yacht prices, what is included and longer charters by request.",
  alternates: { canonical: `${SITE_CONFIG.url}/services/charter` },
  openGraph: {
    title: "Yacht Charter Dubai | Imperial Yachting",
    description:
      "Eight-hour private yacht charters from Dubai Harbour, with overnight and extended itineraries on request.",
    url: `${SITE_CONFIG.url}/services/charter`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Yacht Charter Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yacht Charter Dubai | Imperial Yachting",
    description: "Eight-hour private yacht charters from Dubai Harbour. Prices include VAT.",
    images: ["/og-image.jpg"],
  },
};

export default function CharterPage() {
  return (
    <>
      <JsonLd data={faqSchema(charterFAQ)} />
      <JsonLd
        data={serviceSchema({
          name: "Luxury Yacht Charter Dubai",
          description:
            "Eight-hour private yacht charters from Dubai Harbour, with captain, crew, water and standard-route fuel. Longer itineraries on request.",
          url: `${SITE_CONFIG.url}/services/charter`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Yacht Charter Dubai", url: "/services/charter" },
        ])}
      />
      <CharterPageContent />
    </>
  );
}
