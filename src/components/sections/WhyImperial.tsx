"use client";

import { motion } from "framer-motion";
import { Shield, Package, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const pillars = [
  {
    icon: Shield,
    title: "Owned Fleet",
    description:
      "We own every yacht in our fleet — we are not brokers. This means direct control over vessel quality, crew standards, and consistent service for every charter.",
  },
  {
    icon: Package,
    title: "All-Inclusive",
    description:
      "Every charter includes professional crew, fuel, refreshments, WiFi, water sports equipment, and premium amenities. No hidden fees, no surprises.",
  },
  {
    icon: MapPin,
    title: "Dubai Harbour",
    description:
      "Our fleet is berthed at Dubai Harbour Yacht Club, one of the city's most prestigious marinas, ideally located between Palm Jumeirah and Bluewaters Island.",
  },
];

const pillarVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function WhyImperial() {
  return (
    <section className="py-24 sm:py-32 bg-navy-950">
      <Container>
        <SectionHeading
          title="Why Imperial Yachting"
          subtitle="Three pillars that set us apart in Dubai's yacht charter industry."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={pillarVariants}
                className="text-center"
              >
                {/* Icon in gold circle */}
                <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-400/5 border border-gold-500/20">
                  <Icon className="w-7 h-7 text-gold-400" />
                </div>

                <h3 className="font-heading text-xl font-bold text-white">
                  {pillar.title}
                </h3>

                <p className="mt-3 text-white/50 leading-relaxed max-w-sm mx-auto">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
