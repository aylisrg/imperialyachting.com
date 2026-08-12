import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/seo/schemas";
import { GolfOnTheYachtContent } from "./GolfOnTheYachtContent";
import { GOLF_FAQ } from "./golf-faq";

const PAGE_URL = `${SITE_CONFIG.url}/destinations/golf-on-the-yacht`;

export const metadata: Metadata = {
  title: "Golf on the Yacht — Tee Off at Sea in Dubai",
  description:
    "Play golf from a luxury yacht in Dubai: tee off from the stern platform of a Van Dutch 40 or Monte Carlo 6 with a floating green and 24 eco balls that dissolve in seawater. Add-on from AED 750.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `Golf on the Yacht — Tee Off at Sea | ${SITE_CONFIG.name}`,
    description:
      "Dubai's only golf-at-sea experience: floating green, premium club, and 24 water-soluble eco golf balls. Available aboard Van Dutch 40 and Monte Carlo 6 from AED 750.",
    url: PAGE_URL,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Golf on the Yacht — Tee Off at Sea in Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golf on the Yacht — Tee Off at Sea in Dubai",
    description:
      "Floating green, premium club, 24 eco balls that dissolve in seawater. Dubai's only golf-at-sea experience, from AED 750.",
    images: ["/og-image.jpg"],
  },
};

export default function GolfOnTheYachtPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Golf on the Yacht — Dubai",
          description:
            "Golf-at-sea experience aboard a luxury yacht: stern-platform tee box, floating green target, premium club, and 24 water-soluble eco golf balls that fully dissolve in seawater. Available as an add-on aboard Van Dutch 40 and Monte Carlo 6 from Dubai Harbour.",
          url: PAGE_URL,
          priceFrom: 750,
        })}
      />
      <JsonLd data={faqSchema(GOLF_FAQ)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
          { name: "Golf on the Yacht", url: "/destinations/golf-on-the-yacht" },
        ])}
      />
      <GolfOnTheYachtContent />
    </>
  );
}
