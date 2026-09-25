export const revalidate = 600;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MessageCircle, Download, Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  saleListingSchema,
  faqSchema,
  breadcrumbSchema,
  videoObjectSchema,
} from "@/components/seo/schemas";
import { YachtGallery } from "@/components/gallery/YachtGallery";
import { VideoGallery } from "@/components/gallery/VideoGallery";
import { MaterialsPanel } from "@/components/sales/MaterialsPanel";
import { ShareLinkButton } from "@/components/sales/ShareLinkButton";
import { fetchSaleListingBySlug, fetchSaleListings } from "@/lib/sales/listings-db";
import { buildMaterialSummaries, fetchSaleMaterialRows } from "@/lib/sales/materials";
import { formatSalePrice, SALE_STATUS_LABEL } from "@/lib/sales/merge";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import type { SaleListing } from "@/types/sale";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const listings = await fetchSaleListings();
    return listings.map((l) => ({ slug: l.slug }));
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
  const listing = await fetchSaleListingBySlug(slug);
  if (!listing) return { title: "Listing Not Found" };

  const url = `${SITE_CONFIG.url}/yachts-for-sale/${listing.slug}`;
  const images = listing.images.slice(0, 4).map((img) => ({
    url: img,
    alt: `${listing.title} for sale in Dubai`,
  }));

  return {
    title: { absolute: `${listing.seoTitle} | ${SITE_CONFIG.name}` },
    description: listing.seoDescription,
    keywords: listing.keywords.length > 0 ? listing.keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: listing.seoTitle,
      description: listing.seoDescription,
      url,
      type: "website",
      siteName: SITE_CONFIG.name,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: listing.seoTitle,
      description: listing.seoDescription,
      images: images.slice(0, 1),
    },
  };
}

function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date(iso));
}

/** The handful of numbers a broker scans first. Empty values are skipped. */
function keyFacts(listing: SaleListing): Array<[string, string]> {
  const facts: Array<[string, string | null]> = [
    ["Builder", listing.builder || null],
    ["Model", listing.model || null],
    [
      "Year",
      listing.yearBuilt
        ? `${listing.yearBuilt}${listing.refitYear ? ` · refit ${listing.refitYear}` : ""}`
        : null,
    ],
    [
      "LOA",
      listing.lengthM
        ? `${listing.lengthM.toFixed(2)} m${listing.lengthFt ? ` · ${listing.lengthFt} ft` : ""}`
        : listing.lengthFt
          ? `${listing.lengthFt} ft`
          : null,
    ],
    ["Beam", listing.beamM ? `${listing.beamM.toFixed(2)} m` : null],
    ["Draft", listing.draftM ? `${listing.draftM.toFixed(2)} m` : null],
    ["Engines", listing.engines || null],
    ["Top speed", listing.topSpeedKn ? `~${listing.topSpeedKn} kn` : null],
    ["Guests", listing.guests ? String(listing.guests) : null],
    ["Cabins", listing.cabins ? String(listing.cabins) : null],
    ["Lying", listing.lying || null],
    ["Flag", listing.flag || null],
  ];
  return facts.filter((f): f is [string, string] => Boolean(f[1]));
}

const STATUS_STYLE: Record<SaleListing["status"], string> = {
  draft: "bg-white/10 text-white/60",
  published: "bg-emerald-500/15 text-emerald-300",
  under_offer: "bg-amber-500/15 text-amber-300",
  sold: "bg-white/10 text-white/50",
};

export default async function SaleListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await fetchSaleListingBySlug(slug);
  if (!listing) notFound();

  const materials =
    listing.status === "sold"
      ? []
      : buildMaterialSummaries(listing, await fetchSaleMaterialRows(listing.id));
  const url = `${SITE_CONFIG.url}/yachts-for-sale/${listing.slug}`;
  const facts = keyFacts(listing);
  const youtube = listing.videos.filter((v) => v.kind === "youtube").map((v) => v.url);
  const videoFiles = listing.videos.filter((v) => v.kind === "file");
  const whatsapp = `${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
    `Hi, I'm interested in ${listing.title} (for sale): ${url}`
  )}`;
  const paragraphs = listing.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <JsonLd data={saleListingSchema(listing)} />
      {listing.faq.length > 0 && <JsonLd data={faqSchema(listing.faq)} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Yachts for Sale", url: "/yachts-for-sale" },
          { name: listing.title, url: `/yachts-for-sale/${listing.slug}` },
        ])}
      />
      {youtube.slice(0, 3).map((video) => (
        <JsonLd
          key={video}
          data={{
            "@context": "https://schema.org",
            ...videoObjectSchema({
              source: video,
              name: `${listing.title} — video`,
              description: listing.summary,
            }),
          }}
        />
      ))}

      {/* Header */}
      <section className="bg-navy-950 pt-28 sm:pt-32 pb-8">
        <Container>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/40">
            <Link href="/yachts-for-sale" className="hover:text-gold-400 transition-colors">
              Yachts for sale
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70 truncate">{listing.title}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className={cn("rounded-full px-2.5 py-1 font-semibold uppercase tracking-wider", STATUS_STYLE[listing.status])}>
                  {SALE_STATUS_LABEL[listing.status]}
                </span>
                <span className="text-white/35">Updated {formatUpdated(listing.updatedAt)}</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                {listing.title}
              </h1>
              {listing.headline && (
                <p className="mt-2 text-base sm:text-lg text-white/55">{listing.headline}</p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wider text-white/40">Asking price</p>
              <p className="mt-1 font-heading text-2xl font-bold text-gold-400">
                {formatSalePrice(listing.price)}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery + material pack */}
      <section className="bg-navy-950 pb-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 min-w-0">
              {listing.images.length > 0 && (
                <YachtGallery images={listing.images} yachtName={listing.title} />
              )}
            </div>

            <aside id="materials" className="lg:row-span-2 scroll-mt-28">
              <div className="lg:sticky lg:top-28 space-y-4">
                <div className="glass-card rounded-2xl p-5 sm:p-6">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
                    <Download className="w-5 h-5 text-gold-400" />
                    Material pack
                  </h2>
                  <p className="mt-1 mb-5 text-sm text-white/45">
                    Tick what you need — files download instantly.
                  </p>
                  {listing.status === "sold" ? (
                    <p className="text-sm text-white/50">This yacht has been sold.</p>
                  ) : (
                    <MaterialsPanel slug={listing.slug} items={materials} brokerTerms={listing.brokerTerms} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold-500/40 px-4 py-3 text-sm font-semibold text-gold-400 transition-colors hover:bg-gold-500/10"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Viewing
                  </a>
                  <ShareLinkButton url={url} />
                </div>
              </div>
            </aside>

            {/* Particulars */}
            <div className="lg:col-span-2 min-w-0 space-y-12">
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                {facts.map(([label, value]) => (
                  <div key={label} className="bg-navy-900 px-4 py-3.5">
                    <dt className="text-[11px] uppercase tracking-wider text-white/40">{label}</dt>
                    <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
                  </div>
                ))}
              </dl>

              {(paragraphs.length > 0 || listing.highlights.length > 0) && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white mb-4">Overview</h2>
                  <div className="space-y-4 text-white/65 leading-relaxed">
                    {paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  {listing.highlights.length > 0 && (
                    <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {listing.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-white/75">
                          <Check className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {listing.specSections.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white mb-4">Specification</h2>
                  <div className="divide-y divide-white/5 rounded-2xl border border-white/5">
                    {listing.specSections.map((section, i) => (
                      <details key={section.title} open={i === 0} className="group px-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-white">
                          {section.title}
                          <ChevronRight className="w-4 h-4 text-white/40 transition-transform group-open:rotate-90" />
                        </summary>
                        <dl className="pb-4">
                          {section.items.map((item) => (
                            <div key={item.label} className="flex justify-between gap-6 py-2 text-sm">
                              <dt className="text-white/45">{item.label}</dt>
                              <dd className="text-right text-white/85">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {listing.features.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white mb-4">Equipment</h2>
                  <ul className="flex flex-wrap gap-2">
                    {listing.features.map((f) => (
                      <li key={f} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(youtube.length > 0 || videoFiles.length > 0) && (
                <div>
                  {/* VideoGallery renders its own "Video" heading. */}
                  {youtube.length === 0 && (
                    <h2 className="font-heading text-xl font-semibold text-white mb-4">Video</h2>
                  )}
                  {videoFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {videoFiles.map((v) => (
                        <video
                          key={v.url}
                          src={v.url}
                          controls
                          preload="metadata"
                          className="w-full rounded-xl bg-black"
                          aria-label={v.caption || `${listing.title} video`}
                        />
                      ))}
                    </div>
                  )}
                  {youtube.length > 0 && (
                    <VideoGallery
                      youtubeVideo={youtube[0]}
                      youtubeShorts={youtube.slice(1)}
                      yachtName={listing.title}
                    />
                  )}
                </div>
              )}

              {listing.faq.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white mb-2">Questions</h2>
                  <FAQAccordion items={listing.faq} />
                </div>
              )}

              <p className="text-xs text-white/30 leading-relaxed">
                Particulars are believed correct but are not guaranteed and do not form part of any
                contract. The vessel is offered subject to prior sale, price change or withdrawal
                without notice. Buyers are advised to commission an independent survey and sea trial.
                Seller: {SITE_CONFIG.legalName}, Dubai, trade licence {SITE_CONFIG.license}.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
