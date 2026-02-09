"use client";

import { motion } from "framer-motion";
import { Ship, Settings, Video, Palette, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/services";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ship: Ship,
  settings: Settings,
  video: Video,
  palette: Palette,
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function ServicesOverview() {
  return (
    <section className="py-24 sm:py-32 bg-navy-900">
      <Container>
        <SectionHeading
          title="Our Services"
          subtitle="Comprehensive yacht solutions from charter and fleet management to cinematography and brand development."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Ship;

            return (
              <motion.div
                key={service.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
              >
                <Link
                  href={service.href}
                  className="group block h-full glass-card rounded-xl p-6 sm:p-8 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-500"
                >
                  {/* Icon */}
                  <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Link arrow */}
                  <div className="mt-5 flex items-center gap-2 text-gold-400 text-sm font-medium">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 -translate-x-6 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
