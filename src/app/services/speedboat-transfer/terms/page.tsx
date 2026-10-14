import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG, SPEEDBOAT_TRANSFER } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import {
  speedboatTermsIntro as intro,
  speedboatTermsSections as sections,
  speedboatTermsLastUpdated as lastUpdated,
} from "@/data/speedboat-terms";

export const metadata: Metadata = {
  title: "Speedboat Transfer — Terms of Service",
  description: `Terms of service for Speedboat Transfer by ${SITE_CONFIG.name}: booking, payment, pick-up points, cancellation and refunds.`,
  alternates: { canonical: `${SITE_CONFIG.url}${SPEEDBOAT_TRANSFER.termsPath}` },
  openGraph: {
    title: `Speedboat Transfer — Terms of Service | ${SITE_CONFIG.name}`,
    url: `${SITE_CONFIG.url}${SPEEDBOAT_TRANSFER.termsPath}`,
  },
};

export default function SpeedboatTermsPage() {
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
              Speedboat Transfer — Terms of Service
            </h1>
            <p className="mt-4 text-white/40 text-sm">Last updated: {lastUpdated}</p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <div className="max-w-3xl">
            <p className="text-white/60 leading-relaxed mb-12">{intro}</p>

            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-sm text-white/55 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-16 text-sm text-white/45">
              <Link href={SPEEDBOAT_TRANSFER.path} className="text-gold-400 hover:text-gold-300">
                ← Back to Speedboat Transfer
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
