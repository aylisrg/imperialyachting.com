"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { destinations } from "@/data/destinations";

// Show a curated selection for the homepage
const featured = destinations.slice(0, 4);

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

// Distinct gradient backgrounds for each destination card
const gradients = [
  "from-sea-500/30 via-navy-700 to-navy-800",
  "from-gold-500/20 via-navy-700 to-navy-800",
  "from-sea-400/25 via-navy-800 to-navy-900",
  "from-gold-400/15 via-navy-800 to-navy-900",
];

export function DestinationsSection() {
  return (
    <section className="py-24 sm:py-32 bg-navy-900">
      <Container>
        <SectionHeading
          title="Discover Dubai by Sea"
          subtitle="From the iconic Palm Jumeirah to the secluded World Islands, explore Dubai's most spectacular destinations from the water."
          align="center"
        />

        {/* Mobile: horizontal scroll / Desktop: grid */}
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {featured.map((destination, i) => (
            <motion.article
              key={destination.slug}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              className="flex-shrink-0 w-72 lg:w-auto rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/15 transition-colors duration-500 group"
            >
              {/* Gradient placeholder */}
              <div
                className={`relative aspect-[3/2] bg-gradient-to-br ${gradients[i % gradients.length]}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-lg font-bold text-white/15 tracking-wider text-center px-4">
                    {destination.name}
                  </span>
                </div>

                {/* Sailing time badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/80">
                    <Clock className="w-3 h-3 text-gold-400" />
                    {destination.sailingTime}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-navy-800 p-5">
                <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                  {destination.name}
                </h3>

                {/* Best-for tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {destination.bestFor.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="gold">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Button variant="secondary" size="lg" href="/destinations">
            View All Destinations
          </Button>
        </div>
      </Container>
    </section>
  );
}
