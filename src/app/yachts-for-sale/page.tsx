export const revalidate = 600;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Download } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbSchema,
  collectionPageSchema,
  faqSchema,
} from "@/components/seo/schemas";
import { fetchSaleListings } from "@/lib/sales/listings-db";
import { formatSalePrice, SALE_STATUS_LABEL } from "@/lib/sales/merge";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import {
  BROKER_STEPS,
  BUYING_GUIDE,
  SALES_FAQ,
  SALES_HUB_INTRO,
} from "@/data/sales-guide";
import type { SaleListing } from "@/types/sale";

const PAGE_TITLE = "Yachts for Sale in Dubai — Owner-Direct, Broker-Friendly";
const PAGE_DESCRIPTION =
  "Yachts for sale in Dubai direct from Imperial Yachting's fleet: VanDutch 40, Monte Carlo 6 and more. Lying Dubai Harbour, viewings and sea trials by appointment. Instant material pack for brokers.";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | ${SITE_CONFIG.name}` },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_CONFIG.url}/yachts-for-sale` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_CONFIG.url}/yachts-for-sale`,
    type: "website",
    siteName: SITE_CONFIG.name,
  },
};

function facts(listing: SaleListing): string {
  return [
    listing.yearBuilt ? String(listing.yearBuilt) : null,
    listing.lengthM ? `${listing.lengthM.toFixed(1)} m` : listing.lengthFt ? `${listing.lengthFt} ft` : null,
    listing.guests ? `${listing.guests} guests` : null,
    listing.cabins ? `${listing.cabins} cabin${listing.cabins === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function YachtsForSalePage() {
  const listings = await fetchSaleListings();

  return (
    <>
      <JsonLd
        data={collectionPageSchema({
          name: "Yachts for Sale in Dubai",
          description: PAGE_DESCRIPTION,
          url: "/yachts-for-sale",
          items: listings.map((l) => ({
            name: `${l.title} for sale`,
            url: `/yachts-for-sale/${l.slug}`,
            image: l.heroImage || undefined,
          })),
        })}
      />
      <JsonLd data={faqSchema(SALES_FAQ)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Yachts for Sale", url: "/yachts-for-sale" },
        ])}
      />

      <section className="bg-navy-950 pt-28 sm:pt-36 pb-10">
        <Container>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-400/70">
            {SITE_CONFIG.name} · Sales
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Yachts for Sale in Dubai
          </h1>
          <p className="mt-4 max-w-2xl text-white/55 leading-relaxed">{SALES_HUB_INTRO}</p>
        </Container>
      </section>

      {/* Listings */}
      <section className="bg-navy-950 pb-16">
        <Container>
          {listings.length === 0 ? (
            <p className="rounded-2xl border border-white/10 p-8 text-white/50">
              New listings are being prepared. Message us on{" "}
              <a href={SITE_CONFIG.whatsapp} className="text-gold-400 hover:underline">
                WhatsApp
              </a>{" "}
              for the current stock.
            </p>
          ) : (
            <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
              {listings.map((listing) => (
                <li key={listing.slug} className="bg-navy-900/60 hover:bg-navy-900 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                    <Link
                      href={`/yachts-for-sale/${listing.slug}`}
                      className="relative aspect-[16/10] sm:w-56 flex-shrink-0 overflow-hidden rounded-xl bg-navy-800"
                    >
                      {listing.heroImage && (
                        <Image
                          src={listing.heroImage}
                          alt={`${listing.title} for sale in Dubai`}
                          fill
                          sizes="(max-width: 640px) 100vw, 224px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                            listing.status === "published" && "bg-emerald-500/15 text-emerald-300",
                            listing.status === "under_offer" && "bg-amber-500/15 text-amber-300",
                            listing.status === "sold" && "bg-white/10 text-white/50"
                          )}
                        >
                          {SALE_STATUS_LABEL[listing.status]}
                        </span>
                        <span className="text-xs text-white/40">{listing.lying}</span>
                      </div>
                      <h2 className="mt-2 font-heading text-xl font-semibold text-white">
                        <Link href={`/yachts-for-sale/${listing.slug}`} className="hover:text-gold-400 transition-colors">
                          {listing.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm text-white/50">{facts(listing)}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                      <p className="font-heading font-semibold text-gold-400">{formatSalePrice(listing.price)}</p>
                      <div className="flex gap-2">
                        {listing.status !== "sold" && (
                          <Link
                            href={`/yachts-for-sale/${listing.slug}#materials`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-2 text-xs font-semibold text-navy-950 hover:bg-gold-400 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Materials
                          </Link>
                        )}
                        <Link
                          href={`/yachts-for-sale/${listing.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 hover:border-gold-500/40 hover:text-gold-400 transition-colors"
                        >
                          Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* For brokers */}
      <section className="bg-navy-900 py-16 border-y border-white/5">
        <Container>
          <h2 className="font-heading text-2xl font-semibold text-white">For brokers</h2>
          <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {BROKER_STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-white/5 bg-navy-950/40 p-6">
                <span className="font-heading text-sm font-semibold text-gold-400">0{i + 1}</span>
                <h3 className="mt-2 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Buying guide — collapsed so the page stays clean; still indexable. */}
      <section className="bg-navy-950 py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-white">Buying a yacht in Dubai</h2>
              <div className="mt-6 divide-y divide-white/5 rounded-2xl border border-white/5">
                {BUYING_GUIDE.map((section) => (
                  <details key={section.title} className="group px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-white">
                      {section.title}
                      <ChevronRight className="w-4 h-4 text-white/40 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="space-y-3 pb-5 text-sm text-white/60 leading-relaxed">
                      {section.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              <p className="mt-4 text-sm text-white/45">
                Keeping the yacht in charter after purchase?{" "}
                <Link href="/services/yacht-management" className="text-gold-400 hover:underline">
                  Yacht management
                </Link>
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-semibold text-white">Questions</h2>
              <FAQAccordion items={SALES_FAQ} className="mt-2" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
