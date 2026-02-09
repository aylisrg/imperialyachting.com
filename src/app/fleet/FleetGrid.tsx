"use client";

import { motion } from "framer-motion";
import { Ruler, Users, Calendar, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FleetYachtCard {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  builder: string;
  year: number;
  refit?: number;
  lengthFeet: number;
  lengthMeters: number;
  capacity: number;
  location: string;
  lowestPrice: number | null;
  gradientClass: string;
}

interface FleetGridProps {
  yachts: FleetYachtCard[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function FleetGrid({ yachts }: FleetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {yachts.map((yacht, i) => (
        <motion.article
          key={yacht.slug}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={cardVariants}
          className="group bg-navy-800 rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-all duration-500 flex flex-col"
        >
          {/* Image placeholder */}
          <div
            className={`relative aspect-[4/3] bg-gradient-to-br ${yacht.gradientClass} overflow-hidden`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-2xl font-bold text-white/20 tracking-wider">
                {yacht.name}
              </span>
            </div>
            <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/20 transition-colors duration-500" />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 flex flex-col flex-1">
            <h2 className="font-heading text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">
              {yacht.name}
            </h2>
            <p className="mt-1 text-sm text-gold-400/80 font-medium">
              {yacht.tagline}
            </p>
            <p className="mt-3 text-sm text-white/50 leading-relaxed line-clamp-3">
              {yacht.description}
            </p>

            {/* Specs grid */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Ruler className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
                <span>
                  {yacht.lengthFeet}ft / {yacht.lengthMeters}m
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Users className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
                <span>{yacht.capacity} guests</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Wrench className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
                <span>{yacht.builder}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
                <span>
                  {yacht.year}
                  {yacht.refit ? ` / ${yacht.refit}` : ""}
                </span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-auto pt-6 flex items-end justify-between gap-4 border-t border-white/5">
              {yacht.lowestPrice ? (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    From
                  </p>
                  <p className="font-heading text-xl font-bold text-white">
                    AED {yacht.lowestPrice.toLocaleString("en-US")}
                    <span className="text-sm font-normal text-white/50">
                      /day
                    </span>
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-white/40">Contact for pricing</p>
                </div>
              )}
              <Button variant="primary" size="sm" href={`/fleet/${yacht.slug}`}>
                View Details
              </Button>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
