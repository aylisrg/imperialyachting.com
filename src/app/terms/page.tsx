import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import { termsSections as sections, termsLastUpdated as lastUpdated } from "@/data/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service and charter conditions for ${SITE_CONFIG.name}. Review our booking, cancellation, liability, and payment terms.`,
  openGraph: {
    title: `Terms of Service | ${SITE_CONFIG.name}`,
    description: `Terms of service and charter conditions for ${SITE_CONFIG.name}. Review our booking, cancellation, liability, and payment terms.`,
    url: `${SITE_CONFIG.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="gold-line mb-8" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="mt-4 text-white/40 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <div className="max-w-3xl">
            <p className="text-white/60 leading-relaxed mb-12">
              Please read these Terms of Service carefully before booking a
              charter or using any services provided by{" "}
              {SITE_CONFIG.legalName}. By making a booking or engaging our
              services, you acknowledge that you have read, understood, and
              agree to be bound by these Terms.
            </p>

            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-white/55 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
