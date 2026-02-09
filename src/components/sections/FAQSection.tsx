import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { homeFAQ } from "@/data/faq";

export function FAQSection() {
  return (
    <section className="py-24 sm:py-32 bg-navy-950">
      <JsonLd data={faqSchema(homeFAQ)} />

      <Container>
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about chartering a yacht in Dubai with Imperial Yachting."
            align="center"
          />

          <FAQAccordion items={homeFAQ} />
        </div>
      </Container>
    </section>
  );
}
