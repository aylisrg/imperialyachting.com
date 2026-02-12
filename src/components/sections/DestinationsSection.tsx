"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Destination } from "@/types/common";

const gradients = [
  "from-sea-500/30 via-navy-700 to-navy-800",
  "from-gold-500/20 via-navy-700 to-navy-800",
  "from-sea-400/25 via-navy-800 to-navy-900",
  "from-gold-400/15 via-navy-800 to-navy-900",
];

interface DestinationsSectionProps {
  destinations: Destination[];
}

export function DestinationsSection({ destinations }: DestinationsSectionProps) {
  const featured = destinations.slice(0, 4);

  return (
    <section className="py-24 sm:py-32 bg-navy-900">
      <Container>
        <SectionHeading
          title="Discover Dubai by Sea"
          subtitle="From the iconic Palm Jumeirah to the secluded World Islands, explore Dubai's most spectacular destinations from the water."
          align="center"
        />

        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {featured.map((destination, i) => (
            <Reveal key={destination.slug} delay={i * 100}>
              <article className="flex-shrink-0 w-72 lg:w-auto rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/15 transition-colors duration-500 group">
                <div
                  className={`relative aspect-[3/2] bg-gradient-to-br ${gradients[i % gradients.length]}`}
                >
                  {destination.image ? (
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 288px, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-lg font-bold text-white/15 tracking-wider text-center px-4">
                        {destination.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/80">
                      <Clock className="w-3 h-3 text-gold-400" />
                      {destination.sailingTime}
                    </span>
                  </div>
                </div>

                <div className="bg-navy-800 p-5">
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                    {destination.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {destination.bestFor.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="gold">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button variant="secondary" size="lg" href="/destinations">
            View All Destinations
          </Button>
        </div>
      </Container>
    </section>
  );
}
