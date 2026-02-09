"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Wrench,
  Users,
  Ship,
  BarChart3,
  Calendar,
  GraduationCap,
  Megaphone,
  MapPin,
  Handshake,
  ClipboardCheck,
  Rocket,
  Phone,
  Mail,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { managementFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const valueProps = [
  {
    icon: TrendingUp,
    title: "Revenue Generation",
    description:
      "Maximize your yacht's earning potential through our optimized charter management, dynamic pricing, and extensive B2B booking network.",
  },
  {
    icon: Wrench,
    title: "Full Maintenance",
    description:
      "Comprehensive maintenance scheduling and oversight, ensuring your vessel is always in peak condition and ready for charter.",
  },
  {
    icon: Users,
    title: "Crew Management",
    description:
      "Professional crew recruitment, training, and management. We handle everything from hiring to ongoing performance standards.",
  },
];

const managementServices = [
  {
    icon: Ship,
    title: "Charter Management",
    description:
      "End-to-end charter operations including booking management, guest coordination, and itinerary planning to keep your yacht booked and profitable.",
  },
  {
    icon: BarChart3,
    title: "Accounting & Reporting",
    description:
      "Transparent financial reporting with monthly statements, expense tracking, and revenue analytics so you always know how your asset performs.",
  },
  {
    icon: Calendar,
    title: "Maintenance Scheduling",
    description:
      "Proactive maintenance planning including annual surveys, engine servicing, hull cleaning, and equipment inspections to protect your investment.",
  },
  {
    icon: GraduationCap,
    title: "Crew Hiring & Training",
    description:
      "Recruitment of experienced, licensed crew members with ongoing training in safety, hospitality, and vessel-specific operations.",
  },
  {
    icon: Megaphone,
    title: "Marketing & Listings",
    description:
      "Professional photography, multi-platform listing management, social media marketing, and SEO to drive charter demand year-round.",
  },
  {
    icon: MapPin,
    title: "Berth Management",
    description:
      "Securing and managing premium berth locations at Dubai Harbour and handling all marina coordination and port authority requirements.",
  },
];

const processSteps = [
  {
    number: 1,
    title: "Consultation",
    description:
      "We assess your yacht, understand your goals, and outline a tailored management strategy.",
    icon: Handshake,
  },
  {
    number: 2,
    title: "Onboarding",
    description:
      "Vessel inspection, crew setup, marketing materials, and listing activation across all channels.",
    icon: ClipboardCheck,
  },
  {
    number: 3,
    title: "Operations",
    description:
      "Full-service management with regular reporting, optimized scheduling, and ongoing maintenance.",
    icon: Calendar,
  },
  {
    number: 4,
    title: "Growth",
    description:
      "Continuous optimization of pricing, marketing, and operations to maximize your returns.",
    icon: Rocket,
  },
];

export function YachtManagementPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold-500/[0.05] rounded-full blur-[120px] -translate-y-1/3 -translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sea-500/[0.04] rounded-full blur-[100px] translate-y-1/3 translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            <Badge variant="gold">Yacht Management</Badge>
          </motion.div>

          <motion.h1
            className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            Maximize Your{" "}
            <span className="text-gold-gradient">Yacht&apos;s Potential</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            Comprehensive fleet management for yacht owners in Dubai. From
            charter revenue optimization to crew and maintenance, we handle
            everything.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            <Button variant="primary" size="lg" href="/contact">
              Schedule a Consultation
            </Button>
            <Button variant="secondary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Value Proposition */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Why Partner With Us"
            subtitle="Three pillars of professional yacht management that protect and grow your investment."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {valueProps.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <motion.div
                  key={prop.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={cardVariants}
                  className="glass-card rounded-2xl p-8 sm:p-10 text-center hover:border-gold-500/30 transition-all duration-500"
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-gold-400" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white">
                    {prop.title}
                  </h3>
                  <p className="mt-3 text-white/50 leading-relaxed">
                    {prop.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Services Breakdown */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Management Services"
            subtitle="A detailed breakdown of what our full-service yacht management includes."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={cardVariants}
                  className="glass-card rounded-xl p-6 hover:border-gold-500/20 transition-all duration-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/50 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Revenue Potential */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Badge variant="gold">Revenue Potential</Badge>

              <h2 className="mt-6 font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Turn Your Yacht Into a Performing Asset
              </h2>

              <p className="mt-6 text-white/50 leading-relaxed text-lg">
                Well-managed yachts in the 40-60ft range can generate{" "}
                <span className="text-gold-400 font-semibold">
                  AED 150,000 - 350,000 per month
                </span>{" "}
                during peak season (October through April). Our management team
                optimizes pricing across seasons and maintains high occupancy
                through our B2B network and direct marketing channels.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6">
                {[
                  { label: "Peak Season Revenue", value: "AED 350K+/mo" },
                  { label: "Average Occupancy", value: "75%+" },
                  { label: "Owner Net Margin", value: "60-70%" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: i * 0.1,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1] as [
                            number,
                            number,
                            number,
                            number,
                          ],
                        },
                      },
                    }}
                  >
                    <p className="font-heading text-2xl sm:text-3xl font-bold text-gold-400">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-white/40">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* How We Work */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="How We Work"
            subtitle="From initial consultation to ongoing growth optimization."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {processSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={cardVariants}
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
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Management FAQ"
            subtitle="Common questions about our yacht management services."
            align="center"
          />

          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={managementFAQ} />
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
            Schedule a Consultation
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Let us show you how Imperial Yachting can maximize your yacht&apos;s
            potential in Dubai&apos;s charter market.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/contact">
              Get in Touch
            </Button>
            <Button variant="secondary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
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
