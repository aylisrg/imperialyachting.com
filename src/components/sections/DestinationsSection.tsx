"use client";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { DestinationCard } from "@/components/cards/DestinationCard";
import type { Destination } from "@/types/common";

interface DestinationsSectionProps {
  destinations: Destination[];
}

export function DestinationsSection({ destinations }: DestinationsSectionProps) {
  // Show featured first, then fill up to 4
  const featured = destinations.filter((d) => d.featured);
  const rest = destinations.filter((d) => !d.featured);
  const display = [...featured, ...rest].slice(0, 4);

  return (
    <section className="py-24 sm:py-32 bg-navy-900">
      <Container>
        <SectionHeading
          title="Discover Dubai by Sea"
          subtitle="From the iconic Palm Jumeirah to curated on-water experiences — explore Dubai's most spectacular destinations."
          align="center"
        />

        {display.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
            {display.map((destination, i) => (
              <Reveal key={destination.slug} delay={i * 100}>
                <div className="flex-shrink-0 w-72 lg:w-auto">
                  <DestinationCard destination={destination} index={i} />
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">
            <p>Destinations coming soon. Check back for our premium cruising routes.</p>
          </div>
        )}

        <div className="mt-14 text-center">
          <Button variant="secondary" size="lg" href="/destinations">
            View All Destinations
          </Button>
        </div>
      </Container>
    </section>
  );
}
