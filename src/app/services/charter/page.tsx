import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
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
      <CharterPageContent />
    </>
  );
}
