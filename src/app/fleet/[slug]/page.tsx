export const revalidate = 3600;

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
import { yachtProductSchema, faqSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { YachtGallery } from "@/components/gallery/YachtGallery";
import { VideoGallery } from "@/components/gallery/VideoGallery";
import { fetchYachtBySlug } from "@/lib/yachts-db";
import { getLowestPrice, getHourlyRate } from "@/lib/pricing";
import { fleetFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { PriceConstructor } from "@/components/pricing/PriceConstructor";
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

  const description = `Charter the ${yacht.name} in Dubai — ${yacht.tagline}. ${yacht.length.feet}ft ${yacht.builder}, up to ${yacht.capacity} guests. Book with Imperial Yachting at Dubai Harbour.`;
  const pageUrl = `${SITE_CONFIG.url}/fleet/${yacht.slug}`;
  const heroImage = yacht.heroImage || yacht.images[0];

  return {
    title: `${yacht.name} — ${yacht.tagline}`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${yacht.name} — ${yacht.tagline} | Imperial Yachting`,
      description,
      url: pageUrl,
      type: "website",
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: `${yacht.name} — Luxury Yacht Charter Dubai | Imperial Yachting`,
        },
        ...yacht.images.slice(0, 3).map((img) => ({
          url: img,
          alt: `${yacht.name} — Imperial Yachting`,
        })),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${yacht.name} — ${yacht.tagline}`,
      description,
      images: [
        {
          url: heroImage,
          alt: `${yacht.name} — Luxury Yacht Charter Dubai`,
        },
      ],
    },
  };
}

function formatPrice(value: number | null): string {
  if (value === null) return "\u2014";
  return `AED ${value.toLocaleString("en-US")}`;
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

  const lowestPrice = getLowestPrice(yacht.pricing);
  const hourlyRate = getHourlyRate(yacht.pricing);
  const showB2B = hasAnyB2B(yacht);
  const showHourly = hasAnyHourly(yacht);

  return (
    <>
      <JsonLd data={yachtProductSchema(yacht)} />
      <JsonLd data={faqSchema(fleetFAQ)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: yacht.name, url: `/fleet/${yacht.slug}` },
        ])}
      />

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

          {/* Video Gallery — shown when video content exists */}
          {(yacht.youtubeShorts.length > 0 || yacht.youtubeVideo) && (
            <div className="mb-10">
              <VideoGallery
                youtubeShorts={yacht.youtubeShorts}
                youtubeVideo={yacht.youtubeVideo}
                yachtName={yacht.name}
              />
            </div>
          )}

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

      {/* Charter Rules — shown when daily or weekly rules are defined */}
      {(yacht.dailyRules || yacht.weeklyRules) && (
        <section className="py-10 sm:py-14 bg-navy-900 border-t border-white/5">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
              {yacht.dailyRules && (
                <CharterRulesCard title="Daily Charter" rules={yacht.dailyRules} />
              )}
              {yacht.weeklyRules && (
                <CharterRulesCard title="Weekly Charter" rules={yacht.weeklyRules} />
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Price Constructor — shown when hourly pricing exists */}
      {hourlyRate !== null && (
        <section className="py-16 sm:py-24 bg-navy-950">
          <Container>
            <div className="max-w-2xl mx-auto">
              <PriceConstructor yachtName={yacht.name} hourlyRate={hourlyRate} />
            </div>
          </Container>
        </section>
      )}

      {/* What's Included */}
      {yacht.included.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-900">
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

      {/* Google Review CTA */}
      <section className="py-14 bg-navy-900/60 border-t border-white/5">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
            <div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} viewBox="0 0 20 20" className="w-5 h-5 fill-gold-400" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1.5 text-sm text-white/40">5.0 · 6 reviews</span>
              </div>
              <p className="text-white font-semibold text-base">
                Chartered with us before?
              </p>
              <p className="text-white/40 text-sm mt-0.5">
                A quick Google review helps other guests find us.
              </p>
            </div>
            <a
              href={SITE_CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-gold-500/30 hover:border-gold-500/60 bg-gold-500/5 hover:bg-gold-500/10 text-gold-400 font-semibold px-5 py-3 text-sm transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Leave a Review
            </a>
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

function CharterRulesCard({ title, rules }: { title: string; rules: string }) {
  const lines = rules
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="p-5 rounded-xl bg-navy-800/60 border border-white/5">
      <h4 className="font-heading text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      <ul className="space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/65">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
            {line}
          </li>
        ))}
      </ul>
    </div>
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
