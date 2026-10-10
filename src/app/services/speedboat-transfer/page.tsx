import type { Metadata } from "next";
import { SITE_CONFIG, SPEEDBOAT_TRANSFER } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { SpeedboatTransferContent } from "./SpeedboatTransferContent";

// Title, description and service markup — verbatim from SEO (IY-407): the price is per hour
// with VAT included, so the generic serviceSchema (one-off price) is not used here.
const TITLE = "Speedboat Transfer Dubai — Private Water Taxi, AED 1,050/hr | Imperial Yachting";
const DESCRIPTION =
  "Private speedboat transfer in Dubai from AED 1,050 per hour incl. VAT. Yacht-to-shore, island and waterfront hotel pickups from Dubai Harbour. Book in minutes.";
const URL = `${SITE_CONFIG.url}${SPEEDBOAT_TRANSFER.path}`;

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Speedboat Transfer Dubai",
  "serviceType": "Private speedboat transfer",
  "description": "Private point-to-point speedboat transfer in Dubai: yacht-to-shore, island and waterfront hotel pickups, operated by Imperial Yachting from Dubai Harbour.",
  "provider": {
    "@type": "Organization",
    "name": "Imperial Yachting",
    "url": "https://imperialyachting.com"
  },
  "areaServed": {
    "@type": "City",
    "name": "Dubai",
    "addressCountry": "AE"
  },
  "url": "https://imperialyachting.com/services/speedboat-transfer",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "AED",
    "price": "1050",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "1050",
      "priceCurrency": "AED",
      "unitCode": "HUR",
      "valueAddedTaxIncluded": true
    },
    "availability": "https://schema.org/InStock",
    "url": "https://transfer.imperialyachting.com"
  }
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: "/images/speedboat/van-dutch.jpg", width: 800, height: 533, alt: "Van Dutch speedboat in Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/speedboat/van-dutch.jpg"],
  },
};

export default function SpeedboatTransferPage() {
  return (
    <>
      <JsonLd data={SERVICE_SCHEMA} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Speedboat Transfer", url: SPEEDBOAT_TRANSFER.path },
        ])}
      />
      <SpeedboatTransferContent />
    </>
  );
}
