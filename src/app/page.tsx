export const revalidate = 3600;

import dynamicImport from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
} from "@/components/seo/schemas";
import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";

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
