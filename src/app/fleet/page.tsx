import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { yachtProductSchema, faqSchema } from "@/components/seo/schemas";
import { yachts } from "@/data/yachts";
import { fleetFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { FleetGrid } from "./FleetGrid";

export const metadata: Metadata = {
  title: "Our Fleet",
  description:
    "Explore Imperial Yachting's premium fleet of luxury motor yachts available for charter in Dubai. From the 60ft Monte Carlo 6 to the iconic Van Dutch 40, find your perfect vessel at Dubai Harbour.",
  openGraph: {
    title: "Our Fleet | Imperial Yachting",
    description:
      "Explore Imperial Yachting's premium fleet of luxury motor yachts available for charter in Dubai.",
    url: `${SITE_CONFIG.url}/fleet`,
  },
};

function getLowestDailyPrice(
  pricing: { daily: number | null }[]
): number | null {
  return pricing.reduce<number | null>((min, season) => {
    if (season.daily === null) return min;
    if (min === null) return season.daily;
    return season.daily < min ? season.daily : min;
  }, null);
}


export default function FleetPage() {
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
              Three premium motor yachts, exclusively owned and maintained to
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
              lowestPrice: getLowestDailyPrice(yacht.pricing),
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
