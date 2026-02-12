import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Ruler,
  Users,
  Calendar,
  MapPin,
  Wrench,
  Wifi,
  Speaker,
  Utensils,
  Waves,
  Shield,
  Droplets,
  Sun,
  Anchor,
  Snowflake,
  CheckCircle,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { yachtProductSchema, faqSchema } from "@/components/seo/schemas";
import { YachtGallery } from "@/components/gallery/YachtGallery";
import { fetchAllYachts, fetchYachtBySlug } from "@/lib/yachts-db";
import { fleetFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import type { Yacht, YachtAmenity } from "@/types/yacht";

const amenityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  speaker: Speaker,
  utensils: Utensils,
  waves: Waves,
  shield: Shield,
  droplets: Droplets,
  sun: Sun,
  anchor: Anchor,
  snowflake: Snowflake,
};

export async function generateStaticParams() {
  const yachts = await fetchAllYachts();
  return yachts.map((yacht) => ({
    slug: yacht.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const yacht = await fetchYachtBySlug(slug);

  if (!yacht) {
    return {
      title: "Yacht Not Found",
    };
  }

  return {
    title: `${yacht.name} — ${yacht.tagline}`,
    description: yacht.description.slice(0, 160),
    openGraph: {
      title: `${yacht.name} — ${yacht.tagline} | Imperial Yachting`,
      description: yacht.description.slice(0, 160),
      url: `${SITE_CONFIG.url}/fleet/${yacht.slug}`,
      images: yacht.images.map((img) => ({
        url: img,
        alt: `${yacht.name} — Imperial Yachting`,
      })),
    },
  };
}

function formatPrice(value: number | null): string {
  if (value === null) return "\u2014";
  return `AED ${value.toLocaleString("en-US")}`;
}

function getLowestPrice(yacht: Yacht): { amount: number; unit: string } | null {
  let result: { amount: number; unit: string } | null = null;
  for (const season of yacht.pricing) {
    const tiers: [number | null, string][] = [
      [season.hourly, "/hr"],
      [season.daily, "/day"],
      [season.weekly, "/week"],
      [season.monthly, "/month"],
    ];
    for (const [price, unit] of tiers) {
      if (price !== null && (result === null || price < result.amount)) {
        result = { amount: price, unit };
      }
    }
  }
  return result;
}

function hasAnyB2B(yacht: Yacht): boolean {
  return yacht.pricing.some(
    (s) => s.hourlyB2B != null || s.dailyB2B != null || s.weeklyB2B != null || s.monthlyB2B != null
  );
}

function hasAnyHourly(yacht: Yacht): boolean {
  return yacht.pricing.some(
    (s) => s.hourly != null || s.hourlyB2B != null
  );
}

export default async function YachtDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const yacht = await fetchYachtBySlug(slug);

  if (!yacht) {
    notFound();
  }

  const lowestPrice = getLowestPrice(yacht);
  const showB2B = hasAnyB2B(yacht);
  const showHourly = hasAnyHourly(yacht);

  return (
    <>
      <JsonLd data={yachtProductSchema(yacht)} />
      <JsonLd data={faqSchema(fleetFAQ)} />

      {/* Breadcrumb */}
      <div className="bg-navy-950 pt-28 sm:pt-32">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-white/40"
          >
            <Link
              href="/"
              className="hover:text-gold-400 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href="/fleet"
              className="hover:text-gold-400 transition-colors"
            >
              Fleet
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">{yacht.name}</span>
          </nav>
        </Container>
      </div>

      {/* Hero Area */}
      <section className="pt-8 pb-12 sm:pb-16 bg-navy-950">
        <Container>
          <div className="flex flex-wrap items-start gap-4 mb-8">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                {yacht.name}
              </h1>
              <p className="mt-2 text-lg sm:text-xl text-gold-400/80 font-medium">
                {yacht.tagline}
              </p>
            </div>
            <Badge variant="sea" className="mt-2 sm:mt-3">
              <MapPin className="w-3 h-3 mr-1" />
              {yacht.location}
            </Badge>
          </div>

          {/* Image Gallery */}
          <YachtGallery images={yacht.images} yachtName={yacht.name} />
        </Container>
      </section>

      {/* Quick Specs Bar */}
      <section className="py-8 bg-navy-900 border-y border-white/5">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <QuickSpec
              icon={<Ruler className="w-5 h-5 text-gold-500" />}
              label="Length"
              value={`${yacht.length.feet}ft / ${yacht.length.meters}m`}
            />
            <QuickSpec
              icon={<Users className="w-5 h-5 text-gold-500" />}
              label="Capacity"
              value={`${yacht.capacity} guests`}
            />
            <QuickSpec
              icon={<Wrench className="w-5 h-5 text-gold-500" />}
              label="Builder"
              value={yacht.builder}
            />
            <QuickSpec
              icon={<Calendar className="w-5 h-5 text-gold-500" />}
              label="Year"
              value={
                yacht.refit
                  ? `${yacht.year} / ${yacht.refit}`
                  : `${yacht.year}`
              }
            />
            {yacht.cabins && (
              <QuickSpec
                icon={<Sun className="w-5 h-5 text-gold-500" />}
                label="Cabins"
                value={`${yacht.cabins}`}
              />
            )}
            <QuickSpec
              icon={<MapPin className="w-5 h-5 text-gold-500" />}
              label="Location"
              value={yacht.location.replace(", Berth BD2", "")}
            />
          </div>
        </Container>
      </section>

      {/* Description */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <div className="max-w-4xl">
            <SectionHeading
              title="About This Yacht"
              subtitle="Discover what makes this vessel exceptional."
            />
            <p className="text-white/70 text-lg leading-relaxed whitespace-pre-line">
              {yacht.description}
            </p>
            {lowestPrice && (
              <div className="mt-8 inline-flex items-baseline gap-2 bg-navy-800 rounded-xl px-6 py-4 border border-white/5">
                <span className="text-sm text-white/40 uppercase tracking-wider">
                  Charter from
                </span>
                <span className="font-heading text-2xl font-bold text-white">
                  AED {lowestPrice.amount.toLocaleString("en-US")}
                </span>
                <span className="text-white/50">{lowestPrice.unit}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Full Specifications */}
      {yacht.specs.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading title="Specifications" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1 max-w-3xl">
              {yacht.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between py-4 border-b border-white/5"
                >
                  <span className="text-white/50 text-sm">{spec.label}</span>
                  <span className="text-white font-medium text-sm">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Amenities */}
      {yacht.amenities.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-950">
          <Container>
            <SectionHeading
              title="Amenities"
              subtitle="Everything on board for your comfort and enjoyment."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {yacht.amenities.map((amenity) => (
                <AmenityCard key={amenity.label} amenity={amenity} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Pricing Table */}
      {yacht.pricing.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading
              title="Charter Rates"
              subtitle="All prices in AED. Rates include crew, fuel, and standard amenities."
            />

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full px-4 sm:px-0">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 pr-4 text-left text-sm font-heading font-semibold text-white/70">
                        Season
                      </th>
                      <th className="py-4 px-4 text-left text-sm font-heading font-semibold text-white/70">
                        Period
                      </th>
                      {showHourly && (
                        <th className="py-4 px-4 text-right text-sm font-heading font-semibold text-white/70">
                          Hourly
                        </th>
                      )}
                      <th className="py-4 px-4 text-right text-sm font-heading font-semibold text-white/70">
                        Daily
                      </th>
                      <th className="py-4 px-4 text-right text-sm font-heading font-semibold text-white/70">
                        Weekly
                      </th>
                      <th className="py-4 px-4 text-right text-sm font-heading font-semibold text-white/70">
                        Monthly
                      </th>
                      {showB2B && (
                        <>
                          {showHourly && (
                            <th className="py-4 px-4 text-right text-sm font-heading font-semibold text-gold-400/70 border-l border-white/5">
                              Hourly B2B
                            </th>
                          )}
                          <th className={`py-4 px-4 text-right text-sm font-heading font-semibold text-gold-400/70 ${!showHourly ? "border-l border-white/5" : ""}`}>
                            Daily B2B
                          </th>
                          <th className="py-4 px-4 text-right text-sm font-heading font-semibold text-gold-400/70">
                            Weekly B2B
                          </th>
                          <th className="py-4 pl-4 text-right text-sm font-heading font-semibold text-gold-400/70">
                            Monthly B2B
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {yacht.pricing.map((season) => (
                      <tr
                        key={season.season}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 pr-4 text-sm font-semibold text-white">
                          {season.season}
                        </td>
                        <td className="py-4 px-4 text-sm text-white/50">
                          {season.period}
                        </td>
                        {showHourly && (
                          <td className="py-4 px-4 text-sm text-right text-white/80 font-medium">
                            {formatPrice(season.hourly)}
                          </td>
                        )}
                        <td className="py-4 px-4 text-sm text-right text-white/80 font-medium">
                          {formatPrice(season.daily)}
                        </td>
                        <td className="py-4 px-4 text-sm text-right text-white/80 font-medium">
                          {formatPrice(season.weekly)}
                        </td>
                        <td className="py-4 px-4 text-sm text-right text-white/80 font-medium">
                          {formatPrice(season.monthly)}
                        </td>
                        {showB2B && (
                          <>
                            {showHourly && (
                              <td className="py-4 px-4 text-sm text-right text-gold-400/70 font-medium border-l border-white/5">
                                {formatPrice(season.hourlyB2B ?? null)}
                              </td>
                            )}
                            <td className={`py-4 px-4 text-sm text-right text-gold-400/70 font-medium ${!showHourly ? "border-l border-white/5" : ""}`}>
                              {formatPrice(season.dailyB2B ?? null)}
                            </td>
                            <td className="py-4 px-4 text-sm text-right text-gold-400/70 font-medium">
                              {formatPrice(season.weeklyB2B ?? null)}
                            </td>
                            <td className="py-4 pl-4 text-sm text-right text-gold-400/70 font-medium">
                              {formatPrice(season.monthlyB2B ?? null)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* What's Included */}
      {yacht.included.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-950">
          <Container>
            <SectionHeading
              title="What's Included"
              subtitle="Every charter comes with these essentials at no extra cost."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
              {yacht.included.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 py-3 px-4 rounded-lg bg-navy-800/50 border border-white/5"
                >
                  <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Quick Inquiry CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="gold-line mx-auto mb-8" />
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            Interested in the {yacht.name}?
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Get in touch with our charter team for availability, custom
            itineraries, and special event packages.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              <Phone className="w-5 h-5" />
              Send Inquiry
            </Button>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading
              title="Frequently Asked Questions"
              subtitle="Common questions about our fleet and charter options."
              align="center"
            />
            <FAQAccordion items={fleetFAQ} />
          </div>
        </Container>
      </section>
    </>
  );
}

function QuickSpec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

function AmenityCard({ amenity }: { amenity: YachtAmenity }) {
  const IconComponent = amenityIconMap[amenity.icon] || Anchor;

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-800/50 border border-white/5 hover:border-gold-500/10 transition-colors">
      <IconComponent className="w-5 h-5 text-gold-500 flex-shrink-0" />
      <span className="text-white/80 text-sm font-medium">
        {amenity.label}
      </span>
    </div>
  );
}
