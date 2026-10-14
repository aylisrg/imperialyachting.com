export const revalidate = 3600;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { WakePage } from "@/components/wake/WakePage";
import { WakeBand, WakeCta, WakeFaq, WakeHead, WakeHero, WakeList, WakeSection, WakeSplitTitle } from "@/components/wake/blocks";
import { fleetClips } from "@/components/wake/fleetClips";
import { JsonLd } from "@/components/seo/JsonLd";
import { yachtProductSchema, faqSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { YachtGallery } from "@/components/gallery/YachtGallery";
import { VideoGallery } from "@/components/gallery/VideoGallery";
import { fetchAllYachts, fetchYachtBySlug } from "@/lib/yachts-db";
import { getLowestPrice, getHourlyRate } from "@/lib/pricing";
import { buildYachtFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { PriceConstructor } from "@/components/pricing/PriceConstructor";
import type { Yacht } from "@/types/yacht";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const yachts = await fetchAllYachts();
    return yachts.map((yacht) => ({ slug: yacht.slug }));
  } catch {
    return [];
  }
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
  const clips = fleetClips(yacht.slug);
  const heroImage = yacht.heroImage || yacht.images[0];
  const crumb = `Home / Fleet / ${yacht.name}`;

  return (
    <>
      <JsonLd data={yachtProductSchema(yacht)} />
      <JsonLd data={faqSchema(buildYachtFAQ(yacht))} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: yacht.name, url: `/fleet/${yacht.slug}` },
        ])}
      />

      <WakePage>
        {clips ? (
          <WakeHero
            clip={clips.hero}
            alt={`${yacht.name} — Imperial Yachting`}
            crumb={crumb}
            short={false}
            title={yacht.name}
            lead={yacht.tagline}
          >
            <p className="cap note">{yacht.location}</p>
          </WakeHero>
        ) : (
          <header className="w-hero short">
            {heroImage && (
              <div className="media">
                <Image src={heroImage} alt={`${yacht.name} — Imperial Yachting`} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
              </div>
            )}
            <div className="shade" />
            <span className="crumb cap">{crumb}</span>
            <div className="in">
              <h1 className="serif">{yacht.name}</h1>
              <div><p className="lead">{yacht.tagline}</p><p className="cap note">{yacht.location}</p></div>
            </div>
          </header>
        )}

        <WakeSection>
          <div className="w-spec s6">
            <div><span className="cap">Length</span><b>{yacht.length.feet}ft / {yacht.length.meters}m</b></div>
            <div><span className="cap">Capacity</span><b>{yacht.capacity} guests</b></div>
            <div><span className="cap">Builder</span><b>{yacht.builder}</b></div>
            <div><span className="cap">Year</span><b>{yacht.refit ? `${yacht.year} / ${yacht.refit}` : `${yacht.year}`}</b></div>
            {yacht.cabins ? <div><span className="cap">Cabins</span><b>{yacht.cabins}</b></div> : null}
            <div><span className="cap">Location</span><b>{yacht.location.replace(", Berth BD2", "")}</b></div>
          </div>
        </WakeSection>

        <WakeSection tone="light">
          <div className="w-split">
            <WakeSplitTitle ix="01" title={<>About this<br />yacht.</>}>
              <p>Discover what makes this vessel exceptional.</p>
            </WakeSplitTitle>
            <div>
              <p className="w-prose" style={{ whiteSpace: "pre-line" }}>{yacht.description}</p>
              {lowestPrice && (
                <div className="w-opt" style={{ paddingTop: 32 }}>
                  <div className="cap from">Charter from<b>AED {lowestPrice.amount.toLocaleString("en-US")} <small>{lowestPrice.unit}</small></b></div>
                </div>
              )}
            </div>
          </div>
        </WakeSection>

        {clips && <WakeBand clip={clips.band} alt={`${yacht.name} on the water`} />}

        <WakeSection>
          <WakeHead title={<>Gallery.</>} />
          <div className="iyh-legacy">
            {(yacht.youtubeShorts.length > 0 || yacht.youtubeVideo) && (
              <div className="mb-10">
                <VideoGallery
                  youtubeShorts={yacht.youtubeShorts}
                  youtubeVideo={yacht.youtubeVideo}
                  yachtName={yacht.name}
                />
              </div>
            )}
            <YachtGallery images={yacht.images} yachtName={yacht.name} />
          </div>
        </WakeSection>

        {yacht.specs.length > 0 && (
          <WakeSection tone="light">
            <WakeHead title="Specifications." />
            <div className="w-spec">
              {yacht.specs.map((spec) => (
                <div key={spec.label}><span className="cap">{spec.label}</span><b>{spec.value}</b></div>
              ))}
            </div>
          </WakeSection>
        )}

        {yacht.amenities.length > 0 && (
          <WakeSection tone="sand">
            <WakeHead title="Amenities.">Everything on board for your comfort and enjoyment.</WakeHead>
            <div className="w-chips">
              {yacht.amenities.map((amenity) => (
                <div key={amenity.label}>{amenity.label}</div>
              ))}
            </div>
          </WakeSection>
        )}

        {yacht.pricing.length > 0 && (
          <WakeSection>
            <WakeHead title={<>Charter<br />rates.</>}>All prices in AED. Rates include crew, fuel, and standard amenities.</WakeHead>
            <div className="w-table-wrap">
              <table className="w-table">
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Period</th>
                    {showHourly && <th>Hourly</th>}
                    <th>Daily</th>
                    <th>Weekly</th>
                    <th>Monthly</th>
                    {showB2B && (
                      <>
                        {showHourly && <th className="b2b">Hourly B2B</th>}
                        <th className="b2b">Daily B2B</th>
                        <th className="b2b">Weekly B2B</th>
                        <th className="b2b">Monthly B2B</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {yacht.pricing.map((season) => (
                    <tr key={season.season}>
                      <td>{season.season}</td>
                      <td style={{ color: "var(--mute)" }}>{season.period}</td>
                      {showHourly && <td>{formatPrice(season.hourly)}</td>}
                      <td>{formatPrice(season.daily)}</td>
                      <td>{formatPrice(season.weekly)}</td>
                      <td>{formatPrice(season.monthly)}</td>
                      {showB2B && (
                        <>
                          {showHourly && <td className="b2b">{formatPrice(season.hourlyB2B ?? null)}</td>}
                          <td className="b2b">{formatPrice(season.dailyB2B ?? null)}</td>
                          <td className="b2b">{formatPrice(season.weeklyB2B ?? null)}</td>
                          <td className="b2b">{formatPrice(season.monthlyB2B ?? null)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(yacht.dailyRules || yacht.weeklyRules) && (
              <div className="w-opts o2" style={{ marginTop: 56 }}>
                {yacht.dailyRules && <CharterRulesCard title="Daily Charter" rules={yacht.dailyRules} />}
                {yacht.weeklyRules && <CharterRulesCard title="Weekly Charter" rules={yacht.weeklyRules} />}
              </div>
            )}
          </WakeSection>
        )}

        {hourlyRate !== null && (
          <WakeSection>
            <div className="iyh-legacy" style={{ maxWidth: 672, margin: "0 auto" }}>
              <PriceConstructor
                yachtSlug={yacht.slug}
                yachtName={yacht.name}
                hourlyRate={hourlyRate}
                capacity={yacht.capacity}
                minHoursWeekday={yacht.minHoursWeekday}
                minHoursWeekend={yacht.minHoursWeekend}
                bookingEnabled={yacht.bookingEnabled}
              />
            </div>
          </WakeSection>
        )}

        {yacht.included.length > 0 && (
          <WakeSection tone="light">
            <div className="w-split">
              <WakeSplitTitle ix="02" title={<>What&apos;s<br />included.</>}>
                <p>Every charter comes with these essentials at no extra cost.</p>
              </WakeSplitTitle>
              <WakeList items={yacht.included} />
            </div>
          </WakeSection>
        )}

        <WakeSection tone="sand">
          <div className="w-split">
            <div>
              <span className="cap">★★★★★ &nbsp;5.0 · 6 reviews</span>
              <h2 className="serif" style={{ fontSize: "var(--fs-h3)", lineHeight: 1, marginTop: 12 }}>Chartered with us before?</h2>
            </div>
            <div>
              <p style={{ fontSize: 17, marginBottom: 24 }}>A quick Google review helps other guests find us.</p>
              <a className="btn" href={SITE_CONFIG.googleReviewUrl} target="_blank" rel="noopener noreferrer">Leave a Review</a>
            </div>
          </div>
        </WakeSection>

        <WakeFaq title={<>Frequently asked<br />questions.</>} lead="Common questions about our fleet and charter options." items={buildYachtFAQ(yacht)} />

        <WakeCta clip={clips?.card ?? "harbour-sunset"} alt={`${yacht.name} — Imperial Yachting`} title={<>Interested in the<br />{yacht.name}?</>}>
          <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
          <Link className="btn o" href="/contact">Send Inquiry</Link>
          <p className="sub">Get in touch with our charter team for availability, custom itineraries, and special event packages.</p>
        </WakeCta>
      </WakePage>
    </>
  );
}

function CharterRulesCard({ title, rules }: { title: string; rules: string }) {
  const lines = rules
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="w-opt">
      <h3 className="serif">{title}</h3>
      <ul>
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
