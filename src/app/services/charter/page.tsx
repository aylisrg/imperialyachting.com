import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, serviceSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { charterFAQ } from "@/data/faq";
import { CharterPageContent } from "./CharterPageContent";
import { fetchAllYachts } from "@/lib/yachts-db";
import { getFullDayCharter } from "@/lib/day-charters";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yacht Charter Dubai — Hourly, Daily & Weekly Rentals",
  description:
    "See VAT-inclusive day charters and four-outing packages in Dubai, with exclusive multi-day charters by request.",
  alternates: { canonical: `${SITE_CONFIG.url}/services/charter` },
  openGraph: {
    title: "Yacht Charter Dubai | Imperial Yachting",
    description:
      "Private day charters and four outings within 30 days, with overnight and exclusive itineraries on request.",
    url: `${SITE_CONFIG.url}/services/charter`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Yacht Charter Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yacht Charter Dubai | Imperial Yachting",
    description: "Private day and four-outing yacht charters in Dubai. Prices include VAT.",
    images: ["/og-image.jpg"],
  },
};

export default async function CharterPage() {
  const fleetSlugs: Record<string, string> = {};
  try {
    for (const yacht of await fetchAllYachts()) {
      const charter = getFullDayCharter(yacht.slug);
      if (charter) fleetSlugs[charter.slug] = yacht.slug;
    }
  } catch {
    // Keep the fixed package table available if the fleet read fails.
  }
  return (
    <>
      <JsonLd data={faqSchema(charterFAQ)} />
      <JsonLd
        data={serviceSchema({
          name: "Luxury Yacht Charter Dubai",
          description:
            "Fixed VAT-inclusive day charters and non-exclusive four-outing packages within 30 days. Exclusive multi-day charters on request.",
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
      <CharterPageContent fleetSlugs={fleetSlugs} />
    </>
  );
}
