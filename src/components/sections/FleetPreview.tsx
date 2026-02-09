"use client";

import { motion } from "framer-motion";
import { Ruler, Users, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getFeaturedYachts } from "@/data/yachts";

const yachts = getFeaturedYachts();

function getLowestDailyPrice(
  pricing: { daily: number | null }[]
): number | null {
  return pricing.reduce<number | null>((min, season) => {
    if (season.daily === null) return min;
    if (min === null) return season.daily;
    return season.daily < min ? season.daily : min;
  }, null);
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
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

export function FleetPreview() {
  return (
    <section className="py-24 sm:py-32 bg-navy-950">
      <Container>
        <SectionHeading
          title="Our Fleet"
          subtitle="Three exceptional motor yachts, owned and maintained to the highest standards. Each vessel offers a unique charter experience on Dubai's waters."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {yachts.map((yacht, i) => {
            const lowestPrice = getLowestDailyPrice(yacht.pricing);

            return (
              <motion.article
                key={yacht.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                className="group bg-navy-800 rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-colors duration-500"
              >
                {/* Image placeholder */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gold-500/20 via-gold-400/10 to-navy-700 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-xl font-bold text-white/20 tracking-wider">
                      {yacht.name}
                    </span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/20 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
                    {yacht.name}
                  </h3>
                  <p className="mt-1 text-sm text-gold-400/80 font-medium">
                    {yacht.tagline}
                  </p>

                  {/* Key specs */}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-gold-500/60" />
                      {yacht.length.feet}ft / {yacht.length.meters}m
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gold-500/60" />
                      {yacht.capacity} guests
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-500/60" />
                      {yacht.location.replace(", Berth BD2", "")}
                    </span>
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-6 flex items-end justify-between gap-4">
                    {lowestPrice && (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          From
                        </p>
                        <p className="font-heading text-lg font-bold text-white">
                          AED{" "}
                          {lowestPrice.toLocaleString("en-US")}
                          <span className="text-sm font-normal text-white/50">
                            /day
                          </span>
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      href={`/fleet/${yacht.slug}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* View Full Fleet CTA */}
        <div className="mt-14 text-center">
          <Button variant="secondary" size="lg" href="/fleet">
            View Full Fleet
          </Button>
        </div>
      </Container>
    </section>
  );
}
