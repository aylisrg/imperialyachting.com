export const revalidate = 3600;

import dynamicImport from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  serviceAreaSchema,
} from "@/components/seo/schemas";
import { homeFAQ } from "@/data/faq";
import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";
import { getLowestPrice } from "@/lib/pricing";

// Below-fold sections — lazy loaded to reduce initial JS bundle
const FleetPreview = dynamicImport(
  () => import("@/components/sections/FleetPreview").then((m) => m.FleetPreview),
);
const ServicesOverview = dynamicImport(
  () => import("@/components/sections/ServicesOverview").then((m) => m.ServicesOverview),
);
const WhyImperial = dynamicImport(
  () => import("@/components/sections/WhyImperial").then((m) => m.WhyImperial),
);
const TestimonialCarousel = dynamicImport(
  () => import("@/components/sections/TestimonialCarousel").then((m) => m.TestimonialCarousel),
);
const DestinationsSection = dynamicImport(
  () => import("@/components/sections/DestinationsSection").then((m) => m.DestinationsSection),
);
const CTASection = dynamicImport(
  () => import("@/components/sections/CTASection").then((m) => m.CTASection),
);
const FAQSection = dynamicImport(
  () => import("@/components/sections/FAQSection").then((m) => m.FAQSection),
);

export default async function HomePage() {
  const [yachts, destinations] = await Promise.all([
    fetchAllYachts(),
    fetchAllDestinations(),
  ]);

  const fleetPreviewData = yachts.map((yacht) => ({
    slug: yacht.slug,
    name: yacht.name,
    tagline: yacht.tagline,
    lengthFeet: yacht.length.feet,
    lengthMeters: yacht.length.meters,
    capacity: yacht.capacity,
    location: yacht.location,
    heroImage: yacht.heroImage,
    lowestPrice: getLowestPrice(yacht.pricing),
  }));

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={serviceAreaSchema()} />
      <JsonLd data={faqSchema(homeFAQ)} />

      <Hero />
      <TrustBar />
      <FleetPreview yachts={fleetPreviewData} />
      <ServicesOverview />
      <WhyImperial />
      <TestimonialCarousel />
      <DestinationsSection destinations={destinations} />
      <CTASection />
      <FAQSection />
    </>
  );
}
