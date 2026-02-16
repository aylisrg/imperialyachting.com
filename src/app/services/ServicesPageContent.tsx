"use client";

import {
  Ship,
  Settings,
  Video,
  Palette,
  ArrowRight,
  MessageSquare,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/data/services";
import { SITE_CONFIG } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ship: Ship,
  settings: Settings,
  video: Video,
  palette: Palette,
};

const processSteps = [
  {
    number: 1,
    title: "Inquire",
    description:
      "Reach out via WhatsApp, email, or our contact form with your preferred dates and requirements.",
    icon: MessageSquare,
  },
  {
    number: 2,
    title: "Customize",
    description:
      "Our team crafts a tailored proposal with yacht selection, itinerary, and all the details.",
    icon: SlidersHorizontal,
  },
  {
    number: 3,
    title: "Confirm",
    description:
      "Review your bespoke package, confirm the booking, and we handle all the preparation.",
    icon: CheckCircle2,
  },
  {
    number: 4,
    title: "Experience",
    description:
      "Step aboard and enjoy a flawless luxury yacht experience on the waters of Dubai.",
    icon: Sparkles,
  },
];

export function ServicesPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sea-500/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="animate-hero-1">
            <Badge variant="gold">Our Services</Badge>
          </div>

          <h1
            className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto animate-hero-2"
          >
            Comprehensive{" "}
            <span className="text-gold-gradient">Yacht Services</span>
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-hero-3"
          >
            From luxury charters and fleet management to cinematography and
            branding, Imperial Yachting delivers end-to-end solutions for the
            yachting industry.
          </p>
        </Container>
      </section>

      {/* Service Cards Grid */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="What We Offer"
            subtitle="Four pillars of excellence covering every aspect of the luxury yachting experience."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] ?? Ship;

              return (
                <Reveal key={service.title} delay={i * 120}>
                  <Link
                    href={service.href}
                    className="group block h-full glass-card rounded-2xl p-8 sm:p-10 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-500"
                  >
                    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-white/50 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-gold-400 text-sm font-medium">
                      <span className="group-hover:underline underline-offset-4">
                        Learn more
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>

                    {service.externalUrl && (
                      <div className="mt-3 flex items-center gap-2 text-white/40 text-xs font-medium">
                        <ExternalLink className="w-3 h-3" />
                        <span>brandwave.imperialyachting.com</span>
                      </div>
                    )}
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Booking Process Timeline */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="How It Works"
            subtitle="From your first inquiry to stepping aboard, we make the process seamless."
            align="center"
          />

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line (desktop) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-500/40 via-gold-500/20 to-transparent hidden sm:block -translate-x-px" />

            <div className="space-y-12 sm:space-y-16">
              {processSteps.map((step, i) => {
                const StepIcon = step.icon;
                const isEven = i % 2 === 0;

                return (
                  <Reveal key={step.number} delay={i * 100}>
                    <div
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                        }`}
                    >
                      {/* Content */}
                      <div
                        className={`flex-1 ${isEven ? "sm:text-right" : "sm:text-left"
                          }`}
                      >
                        <span className="text-gold-500/60 text-sm font-medium tracking-wider uppercase">
                          Step {step.number}
                        </span>
                        <h3 className="mt-1 font-heading text-xl font-bold text-white">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-white/50 leading-relaxed max-w-sm inline-block">
                          {step.description}
                        </p>
                      </div>

                      {/* Number circle */}
                      <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-navy-800 border-2 border-gold-500/40 flex items-center justify-center shadow-lg shadow-navy-950/50">
                        <StepIcon className="w-6 h-6 text-gold-400" />
                      </div>

                      {/* Spacer for alternating layout */}
                      <div className="flex-1 hidden sm:block" />
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="gold-line mx-auto mb-8" />

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">
            Ready to Get Started?
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Tell us about your vision and let our team create the perfect yacht
            experience for you.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Send Inquiry
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
