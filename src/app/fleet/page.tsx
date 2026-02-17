export const revalidate = 3600;

import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { yachtProductSchema, faqSchema } from "@/components/seo/schemas";
import { fleetFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllYachts } from "@/lib/yachts-db";
import { FleetGrid } from "./FleetGrid";

export const metadata: Metadata = {
  title: "Our Fleet — Luxury Yachts for Charter in Dubai",
  description:
    "Browse Imperial Yachting's premium fleet of motor yachts for charter in Dubai. Van Dutch, Monte Carlo, Evo — all-inclusive from AED 2,500/hr at Dubai Harbour.",
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
    description: "Premium motor yachts for charter in Dubai — all-inclusive from Dubai Harbour.",
    images: ["/og-image.jpg"],
  },
};

function getLowestPrice(
  pricing: { hourly: number | null; daily: number | null; weekly: number | null; monthly: number | null }[]
): { amount: number; unit: string } | null {
  let result: { amount: number; unit: string } | null = null;
  for (const season of pricing) {
    const tiers: [number | null, string][] = [
      [season.hourly, "/hr"],
      [season.daily, "/day"],
      [season.weekly, "/week"],
      [season.monthly, "/month"],
    ];
    for (const [price, unit] of tiers) {
      if (price !== null && (result === null || price < result.amount)) {
        result = { amount: price, unit };
      }
    }
  }
  return result;
}

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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sea-500/[0.04] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="gold">Fleet Owner &mdash; Not a Broker</Badge>
            <h1 className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Our Fleet
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
              Premium motor yachts, exclusively owned and maintained to
              the highest standards. Berthed at Dubai Harbour Yacht Club, ready
              for your next unforgettable experience on the water.
            </p>
          </div>
        </Container>
      </section>

      {/* Fleet Grid */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
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
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading
              title="Fleet Questions"
              subtitle="Common questions about our yachts and charter options."
              align="center"
            />
            <FAQAccordion items={fleetFAQ} />
          </div>
        </Container>
      </section>
    </>
  );
}
