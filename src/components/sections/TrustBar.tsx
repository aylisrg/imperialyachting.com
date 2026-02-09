import { Container } from "@/components/layout/Container";
import { StatCounter } from "@/components/shared/StatCounter";
import { companyInfo } from "@/data/company";

const stats = [
  { value: String(companyInfo.stats.fleetSize), label: "Fleet Size" },
  { value: companyInfo.stats.happyClients, label: "Happy Clients" },
  { value: companyInfo.stats.charterHours, label: "Charter Hours" },
  { value: String(companyInfo.stats.yearsInBusiness), label: "Years of Excellence" },
];

export function TrustBar() {
  return (
    <section className="relative bg-navy-800 border-y border-gold-500/10">
      {/* Subtle gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </Container>

      {/* Subtle gold accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
    </section>
  );
}
