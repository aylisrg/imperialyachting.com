"use client";

import {
  Palette,
  PaintBucket,
  BarChart3,
  Crown,
  Globe,
  Share2,
  Search,
  Lightbulb,
  Target,
  Rocket,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_CONFIG } from "@/lib/constants";

const brandwaveServices = [
  {
    icon: Palette,
    title: "Brand Identity",
    description:
      "Complete visual identity design for yacht companies and maritime businesses — logo, typography, color systems, and brand guidelines.",
  },
  {
    icon: PaintBucket,
    title: "Yacht Wrapping",
    description:
      "Custom yacht wrapping and exterior branding. Premium vinyl graphics that transform your vessel into a floating showcase.",
  },
  {
    icon: BarChart3,
    title: "Digital Campaigns",
    description:
      "Performance-driven digital advertising on Google, Meta, and LinkedIn targeting luxury yacht clientele in the UAE and internationally.",
  },
  {
    icon: Crown,
    title: "Luxury Positioning",
    description:
      "Strategic brand positioning in the luxury yachting market. We craft narratives that resonate with high-net-worth audiences.",
  },
  {
    icon: Globe,
    title: "Website & SEO",
    description:
      "Bespoke website design and search engine optimization to establish your digital presence and drive qualified leads.",
  },
  {
    icon: Share2,
    title: "Social Media",
    description:
      "End-to-end social media management including content strategy, production, community management, and influencer partnerships.",
  },
];

const processSteps = [
  {
    number: 1,
    title: "Discovery",
    description:
      "Deep dive into your brand, audience, competitive landscape, and business objectives.",
    icon: Search,
  },
  {
    number: 2,
    title: "Strategy",
    description:
      "Develop a comprehensive branding and marketing roadmap tailored to your goals.",
    icon: Lightbulb,
  },
  {
    number: 3,
    title: "Creation",
    description:
      "Design and produce all brand assets, content, and campaign materials.",
    icon: Target,
  },
  {
    number: 4,
    title: "Launch",
    description:
      "Deploy campaigns, monitor performance, and iterate for continuous improvement.",
    icon: Rocket,
  },
];

const portfolioPlaceholders = [
  {
    title: "Yacht Charter Rebrand",
    category: "Brand Identity",
    gradient: "from-gold-500/20 to-gold-300/10",
  },
  {
    title: "Marina Club Wrapping",
    category: "Yacht Wrapping",
    gradient: "from-sea-500/20 to-sea-400/10",
  },
  {
    title: "Luxury Charter Campaign",
    category: "Digital Campaign",
    gradient: "from-navy-700/40 to-gold-500/20",
  },
  {
    title: "Premium Fleet Website",
    category: "Website Design",
    gradient: "from-gold-600/20 to-navy-600/30",
  },
];

export function BrandwavePageContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold-500/[0.06] rounded-full blur-[120px] -translate-y-1/3 -translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sea-500/[0.04] rounded-full blur-[100px] translate-y-1/3 translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="animate-hero-1">
            <Badge variant="gold">Brandwave</Badge>
          </div>

          <h1
            className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto animate-hero-2"
          >
            Yacht Branding &{" "}
            <span className="text-gold-gradient">Marketing Services</span>
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-hero-3"
          >
            Brandwave is Imperial Yachting&apos;s creative division dedicated to
            elevating yacht brands through identity design, digital marketing,
            and luxury positioning.
          </p>
        </Container>
      </section>

      {/* Services */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="What We Do"
            subtitle="Full-service branding and marketing for the luxury yachting industry."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandwaveServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <Reveal
                  key={service.title}
                  delay={i * 100}
                  className="glass-card rounded-2xl p-8 hover:border-gold-500/30 transition-all duration-500"
                >
                  <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold-500/10 text-gold-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">
                    {service.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Our Process"
            subtitle="A proven four-step approach to building powerful yacht brands."
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

      {/* Portfolio Placeholder */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Selected Work"
            subtitle="A glimpse into projects delivered by the Brandwave team."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {portfolioPlaceholders.map((project, i) => (
              <Reveal
                key={project.title}
                delay={i * 100}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Gradient placeholder */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.gradient} bg-navy-800`}
                />
                <div className="absolute inset-0 bg-navy-950/30 group-hover:bg-navy-950/10 transition-colors duration-500" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy-950/80 to-transparent">
                  <span className="text-xs text-gold-400 font-medium tracking-wider uppercase">
                    {project.category}
                  </span>
                  <h3 className="mt-1 font-heading text-lg font-bold text-white">
                    {project.title}
                  </h3>
                </div>
              </Reveal>
            ))}
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
            Elevate Your Yacht Brand
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Let Brandwave create a brand identity and marketing strategy that
            sets you apart in the luxury yachting market.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/contact">
              Request a Consultation
            </Button>
            <Button variant="secondary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
