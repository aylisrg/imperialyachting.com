"use client";

import {

  Clock,
  Anchor,
  Users,
  Wifi,
  Music,
  Waves,
  UtensilsCrossed,
  MapPin,
  MessageSquare,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,

  Phone,
  Mail,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { charterTypes } from "@/data/services";
import { charterFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";

const inclusions = [
  { icon: Users, label: "Professional captain & crew" },
  { icon: Anchor, label: "Fuel for standard routes" },
  { icon: Waves, label: "Water sports equipment" },
  { icon: Wifi, label: "Onboard WiFi" },
  { icon: Music, label: "Premium sound system" },
  { icon: UtensilsCrossed, label: "Ice, towels & soft drinks" },
];

const destinations = [
  {
    name: "Palm Jumeirah",
    description: "Cruise along the iconic palm-shaped island and its luxury resorts.",
  },
  {
    name: "Dubai Marina Skyline",
    description: "Take in the stunning high-rise views from the water.",
  },
  {
    name: "Ain Dubai & Bluewaters",
    description: "Pass the world's largest observation wheel up close.",
  },
  {
    name: "World Islands",
    description: "Venture out to the man-made archipelago for open-water views.",
  },
];

const processSteps = [
  {
    number: 1,
    title: "Inquire",
    description: "Share your dates, group size, and preferences.",
    icon: MessageSquare,
  },
  {
    number: 2,
    title: "Customize",
    description: "We recommend the perfect yacht and itinerary.",
    icon: SlidersHorizontal,
  },
  {
    number: 3,
    title: "Confirm",
    description: "Secure your booking with a simple confirmation.",
    icon: CheckCircle2,
  },
  {
    number: 4,
    title: "Experience",
    description: "Board at Dubai Harbour and enjoy your cruise.",
    icon: Sparkles,
  },
];

export function CharterPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-sea-500/[0.06] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-500/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="animate-hero-1">
            <Badge variant="gold">Yacht Charter</Badge>
          </div>

          <h1
            className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto animate-hero-2"
          >
            Unforgettable Yacht{" "}
            <span className="text-gold-gradient">Experiences in Dubai</span>
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-hero-3"
          >
            All-inclusive, crewed luxury yacht charters on our privately owned
            fleet. Sunset cruises, celebrations, and corporate events departing
            from Dubai Harbour.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-hero-4"
          >
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              Book via WhatsApp
            </Button>
            <Button variant="secondary" size="lg" href="/fleet">
              View Fleet
            </Button>
          </div>
        </Container>
      </section>

      {/* Charter Types */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Charter Options"
            subtitle="Flexible packages tailored to your schedule and occasion."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {charterTypes.map((type, i) => (
              <Reveal
                key={type.title}
                delay={i * 100}
                className="glass-card rounded-2xl p-6 sm:p-8 hover:border-gold-500/30 transition-all duration-500"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gold-500/60" />
                  <span className="text-sm text-white/40">{type.duration}</span>
                </div>

                <h3 className="font-heading text-lg font-bold text-white">
                  {type.title}
                </h3>

                <p className="mt-3 text-sm text-white/50 leading-relaxed">
                  {type.description}
                </p>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <span className="text-xs text-white/30 uppercase tracking-wider">
                    Starting from
                  </span>
                  <p className="mt-1 font-heading text-xl font-bold text-gold-400">
                    {type.priceFrom}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="What's Included"
            subtitle="Every charter comes fully equipped for an exceptional day on the water."
            align="center"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {inclusions.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.label}
                  delay={i * 60}
                  className="text-center"
                >
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <p className="text-sm text-white/60 leading-snug">
                    {item.label}
                  </p>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <p className="mt-10 text-center text-white/40 text-sm">
              Additional catering, decorations, and water sports can be arranged
              upon request.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Popular Routes */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Popular Routes"
            subtitle="Iconic Dubai destinations accessible from our Dubai Harbour berth."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {destinations.map((dest, i) => (
              <Reveal
                key={dest.name}
                delay={i * 100}
                className="flex items-start gap-4 glass-card rounded-xl p-6"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sea-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-sea-400" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    {dest.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/50 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Booking Process */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Booking Process"
            subtitle="Four simple steps to your dream charter."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {processSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <Reveal
                  key={step.number}
                  delay={i * 100}
                  className="text-center"
                >
                  <div className="relative mx-auto w-16 h-16 rounded-full bg-navy-800 border-2 border-gold-500/30 flex items-center justify-center mb-5">
                    <StepIcon className="w-6 h-6 text-gold-400" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold-500 text-navy-950 text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Charter FAQ"
            subtitle="Common questions about our yacht charter services."
            align="center"
          />

          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={charterFAQ} />
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
            Book Your Charter Today
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Whether it&apos;s a sunset cruise or a week-long adventure, our team
            is ready to plan your perfect experience.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Send Inquiry
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="flex items-center gap-2 hover:text-gold-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {SITE_CONFIG.phone}
            </a>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="flex items-center gap-2 hover:text-gold-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {SITE_CONFIG.email}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
