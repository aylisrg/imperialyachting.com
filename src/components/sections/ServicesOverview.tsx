import { Ship, Settings, Video, Palette, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/data/services";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ship: Ship,
  settings: Settings,
  video: Video,
  palette: Palette,
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
              <Reveal key={service.title} delay={i * 100}>
                <Link
                  href={service.href}
                  className="group block h-full glass-card rounded-xl p-6 sm:p-8 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-500"
                >
                  <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm text-white/50 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-gold-400 text-sm font-medium">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 -translate-x-6 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
