import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
} from "@/components/seo/schemas";

// Below-fold sections — lazy loaded to reduce initial JS bundle
const FleetPreview = dynamic(
  () => import("@/components/sections/FleetPreview").then((m) => m.FleetPreview),
);
const ServicesOverview = dynamic(
  () => import("@/components/sections/ServicesOverview").then((m) => m.ServicesOverview),
);
const WhyImperial = dynamic(
  () => import("@/components/sections/WhyImperial").then((m) => m.WhyImperial),
);
const TestimonialCarousel = dynamic(
  () => import("@/components/sections/TestimonialCarousel").then((m) => m.TestimonialCarousel),
);
const DestinationsSection = dynamic(
  () => import("@/components/sections/DestinationsSection").then((m) => m.DestinationsSection),
);
const CTASection = dynamic(
  () => import("@/components/sections/CTASection").then((m) => m.CTASection),
);
const FAQSection = dynamic(
  () => import("@/components/sections/FAQSection").then((m) => m.FAQSection),
);

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={websiteSchema()} />

      <Hero />
      <TrustBar />
      <FleetPreview />
      <ServicesOverview />
      <WhyImperial />
      <TestimonialCarousel />
      <DestinationsSection />
      <CTASection />
      <FAQSection />
    </>
  );
}
