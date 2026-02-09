"use client";

import { motion } from "framer-motion";
import {
  Video,
  Plane,
  PartyPopper,
  Film,
  Instagram,
  Clapperboard,
  Camera,
  Aperture,
  Cpu,
  MonitorPlay,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

const cinematographyServices = [
  {
    icon: Plane,
    title: "Drone Footage",
    description:
      "Cinematic aerial shots of yachts, marinas, and Dubai's coastline using professional-grade drones with 4K+ capability.",
  },
  {
    icon: PartyPopper,
    title: "Event Filming",
    description:
      "Full coverage of yacht events, parties, corporate gatherings, and celebrations with multi-camera setups.",
  },
  {
    icon: Film,
    title: "Yacht Promo Videos",
    description:
      "High-production promotional videos showcasing your yacht's features, interiors, and sailing experience.",
  },
  {
    icon: Instagram,
    title: "Social Media Content",
    description:
      "Scroll-stopping reels, stories, and short-form content optimized for Instagram, TikTok, and YouTube.",
  },
  {
    icon: Clapperboard,
    title: "Brand Videos",
    description:
      "Brand storytelling and corporate films for yacht companies, luxury brands, and maritime businesses.",
  },
];

const equipment = [
  { icon: Camera, label: "Cinema-grade cameras" },
  { icon: Plane, label: "Licensed drone operators" },
  { icon: Aperture, label: "Professional lighting rigs" },
  { icon: Cpu, label: "Post-production editing" },
  { icon: MonitorPlay, label: "Color grading & VFX" },
  { icon: Video, label: "Stabilized gimbal systems" },
];

const portfolioPlaceholders = [
  {
    title: "Monte Carlo 6 Promo",
    category: "Yacht Promo",
    gradient: "from-gold-500/20 to-sea-500/20",
  },
  {
    title: "Corporate Event Highlight",
    category: "Event Film",
    gradient: "from-sea-500/20 to-navy-700/40",
  },
  {
    title: "Dubai Marina Aerial",
    category: "Drone Footage",
    gradient: "from-navy-700/40 to-gold-500/20",
  },
  {
    title: "Sunset Charter Reel",
    category: "Social Content",
    gradient: "from-gold-600/20 to-gold-300/10",
  },
  {
    title: "Van Dutch 40 Showcase",
    category: "Yacht Promo",
    gradient: "from-sea-600/20 to-sea-400/10",
  },
  {
    title: "Brand Story — Imperial Yachting",
    category: "Brand Video",
    gradient: "from-gold-500/15 to-navy-600/30",
  },
];

export function CinematographyPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sea-500/[0.06] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
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
            <Badge variant="gold">Cinematographic Bureau</Badge>
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
            Yacht Cinematography &{" "}
            <span className="text-gold-gradient">Content Production</span>
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
            Professional film production, drone footage, and content creation
            for yachts, brands, and events. Powered by Imperial Yachting&apos;s
            in-house Cinematographic Bureau.
          </motion.p>
        </Container>
      </section>

      {/* Services */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Our Services"
            subtitle="Full-spectrum video production tailored for the luxury yachting and marine industry."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinematographyServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={cardVariants}
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
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Equipment & Capabilities */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Equipment & Capabilities"
            subtitle="Professional-grade tools and expertise for exceptional results."
            align="center"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {equipment.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.06,
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
                  className="text-center"
                >
                  <div className="mx-auto w-12 h-12 rounded-xl bg-sea-500/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-sea-400" />
                  </div>
                  <p className="text-sm text-white/60 leading-snug">
                    {item.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Portfolio Placeholder */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Our Work"
            subtitle="A selection of recent projects from our Cinematographic Bureau."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioPlaceholders.map((project, i) => (
              <motion.div
                key={project.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Gradient placeholder background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.gradient} bg-navy-800`}
                />
                <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/20 transition-colors duration-500" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <Video className="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-navy-950/80 to-transparent">
                  <span className="text-xs text-gold-400 font-medium tracking-wider uppercase">
                    {project.category}
                  </span>
                  <h3 className="mt-1 font-heading text-base font-bold text-white">
                    {project.title}
                  </h3>
                </div>
              </motion.div>
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
            Ready to Create Something Stunning?
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Share your vision and our production team will craft a proposal
            tailored to your project.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/contact">
              Send an Inquiry
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
