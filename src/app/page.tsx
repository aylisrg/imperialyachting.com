import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { FleetPreview } from "@/components/sections/FleetPreview";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { WhyImperial } from "@/components/sections/WhyImperial";
import { TestimonialCarousel } from "@/components/sections/TestimonialCarousel";
import { DestinationsSection } from "@/components/sections/DestinationsSection";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
} from "@/components/seo/schemas";

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
