export const revalidate = 3600;

import type { Metadata } from "next";
import { WakePage } from "@/components/wake/WakePage";
import { WakeFaq, WakeHero, WakeSection } from "@/components/wake/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { yachtProductSchema, faqSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { fleetFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllYachts } from "@/lib/yachts-db";
import { getLowestPrice } from "@/lib/pricing";
import { FleetGrid } from "./FleetGrid";

export const metadata: Metadata = {
  title: "Our Fleet: Luxury Yachts for Charter in Dubai",
  description:
    "Browse Imperial Yachting's premium fleet of motor yachts for charter in Dubai. Van Dutch, Monte Carlo, Evo. All-inclusive from AED 2,500/hr at Dubai Harbour.",
  alternates: { canonical: `${SITE_CONFIG.url}/fleet` },
  openGraph: {
    title: "Our Fleet | Imperial Yachting",
    description:
      "Browse our premium fleet of luxury motor yachts for charter in Dubai. All-inclusive crew, fuel & amenities from Dubai Harbour.",
    url: `${SITE_CONFIG.url}/fleet`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Imperial Yachting Fleet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Fleet | Imperial Yachting",
    description: "Premium motor yachts for charter in Dubai, all-inclusive from Dubai Harbour.",
    images: ["/og-image.jpg"],
  },
};

export default async function FleetPage() {
  const yachts = await fetchAllYachts();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Imperial Yachting Fleet",
    description:
      "Premium luxury motor yachts available for charter at Dubai Harbour",
    numberOfItems: yachts.length,
    itemListElement: yachts.map((yacht, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: yachtProductSchema(yacht),
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqSchema(fleetFAQ)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Yacht Charter Fleet Dubai", url: "/fleet" },
        ])}
      />

      <WakePage>
        <WakeHero
          clip="hero-vd40-speed"
          alt="Van Dutch 40 at speed off Dubai Harbour"
          crumb="Home / Fleet"
          short={false}
          title={<>Our<br />fleet.</>}
          lead="Premium motor yachts, exclusively owned and maintained to the highest standards. Berthed at Dubai Harbour Yacht Club, ready for your next unforgettable experience on the water."
        >
          <p className="cap note">Fleet Owner &mdash; Not a Broker</p>
        </WakeHero>

        <WakeSection>
          <FleetGrid
            yachts={yachts.map((yacht) => ({
              slug: yacht.slug,
              name: yacht.name,
              tagline: yacht.tagline,
              description: yacht.description,
              builder: yacht.builder,
              year: yacht.year,
              refit: yacht.refit,
              lengthFeet: yacht.length.feet,
              lengthMeters: yacht.length.meters,
              capacity: yacht.capacity,
              lowestPrice: getLowestPrice(yacht.pricing),
              heroImage: yacht.heroImage,
              images: yacht.images,
            }))}
          />
        </WakeSection>

        <WakeFaq
          title={<>Fleet<br />questions.</>}
          lead="Common questions about our yachts and charter options."
          items={fleetFAQ}
        />
      </WakePage>
    </>
  );
}
