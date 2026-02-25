import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, serviceSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { charterFAQ } from "@/data/faq";
import { CharterPageContent } from "./CharterPageContent";

export const metadata: Metadata = {
  title: "Yacht Charter Dubai — Hourly, Daily & Weekly Rentals",
  description:
    "Luxury yacht charter in Dubai from AED 2,500/hr. Day, weekly & monthly charters on our owned fleet from Dubai Harbour. All-inclusive crew, fuel & amenities.",
  alternates: { canonical: `${SITE_CONFIG.url}/services/charter` },
  openGraph: {
    title: "Yacht Charter Dubai | Imperial Yachting",
    description:
      "Charter luxury yachts in Dubai — hourly, daily & weekly. All-inclusive from Dubai Harbour.",
    url: `${SITE_CONFIG.url}/services/charter`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Yacht Charter Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yacht Charter Dubai | Imperial Yachting",
    description: "Luxury yacht charter from AED 2,500/hr — all-inclusive from Dubai Harbour.",
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
            "All-inclusive crewed yacht charter from Dubai Harbour. Choose from the Monte Carlo 6 (60ft, 18 guests), Van Dutch 40 (40ft, 10 guests) or EVO 43 (43ft, 12 guests). Rates from AED 2,500/hr including captain, crew, fuel and amenities.",
          url: `${SITE_CONFIG.url}/services/charter`,
          priceFrom: 2500,
          priceCurrency: "AED",
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
