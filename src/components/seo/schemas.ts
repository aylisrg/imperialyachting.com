import { SITE_CONFIG } from "@/lib/constants";
import type { Yacht, SeasonPricing } from "@/types/yacht";
import type { SaleListing } from "@/types/sale";
import type { FAQItem, Destination, Testimonial } from "@/types/common";
import { testimonials as allTestimonials } from "@/data/testimonials";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.area,
      addressCountry: SITE_CONFIG.address.country,
    },
    sameAs: [
      SITE_CONFIG.instagram,
      SITE_CONFIG.youtube,
      SITE_CONFIG.linkedinCeo,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.phone,
      contactType: "reservations",
      availableLanguage: ["English", "Russian", "Arabic"],
    },
  };
}

/**
 * Builds `Review` nodes from testimonials for attachment to the LocalBusiness
 * node's `review` property. Accepts an explicit list for testability; defaults
 * to the site's real testimonials.
 */
export function reviewSchemas(items: Testimonial[] = allTestimonials) {
  return items.map((testimonial) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: testimonial.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: testimonial.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: testimonial.text,
    ...(testimonial.date ? { datePublished: testimonial.date } : {}),
    itemReviewed: { "@id": `${SITE_CONFIG.url}/#localbusiness` },
  }));
}

/**
 * Single LocalBusiness node for the whole site. Merges what used to be a
 * separate `serviceAreaSchema()` node (areaServed / serviceArea / offer
 * catalog) so there is exactly one LocalBusiness `@id` to reference.
 */
export function localBusinessSchema() {
  const reviewCount = Math.max(allTestimonials.length, 6);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.url}/#localbusiness`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    image: `${SITE_CONFIG.url}/og-image.jpg`,
    parentOrganization: { "@id": `${SITE_CONFIG.url}/#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.harbour.name,
      addressLocality: SITE_CONFIG.harbour.city,
      addressRegion: SITE_CONFIG.harbour.area,
      addressCountry: SITE_CONFIG.harbour.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.0805,
      longitude: 55.1403,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
    priceRange: "$$$",
    currenciesAccepted: "AED,USD,EUR",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    knowsAbout: [
      "Luxury Yacht Charter",
      "Yacht Management",
      "Dubai Harbour",
      "Dubai Marina",
      "Palm Jumeirah Cruises",
      "Corporate Yacht Events",
      "Birthday Party Yacht Dubai",
      "Sunset Cruise Dubai",
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Dubai",
        containedInPlace: { "@type": "Country", name: "United Arab Emirates" },
      },
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 25.0805,
        longitude: 55.1403,
      },
      geoRadius: "50000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Yacht Charter Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Luxury Yacht Charter Dubai",
            description:
              "All-inclusive crewed yacht charter from Dubai Harbour. Hourly, daily and weekly rates.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Yacht Management Dubai",
            description:
              "Full-service yacht management including charter revenue optimisation, crew, maintenance and marketing.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Yacht Cinematography Dubai",
            description:
              "Professional on-water photo and video production for brands and private clients.",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5.0,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviewSchemas(),
    hasMap: "https://maps.google.com/?q=Dubai+Harbour+Yacht+Club",
    sameAs: [
      SITE_CONFIG.instagram,
      SITE_CONFIG.youtube,
      SITE_CONFIG.linkedinCeo,
    ],
  };
}

/**
 * @deprecated Superseded by `localBusinessSchema()`, which now carries
 * areaServed/serviceArea/hasOfferCatalog directly so there is a single
 * LocalBusiness node on the page. Kept as an alias so existing imports
 * keep working.
 */
export function serviceAreaSchema() {
  return localBusinessSchema();
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    publisher: {
      "@id": `${SITE_CONFIG.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/fleet?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function absoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_CONFIG.url}${pathOrUrl}`;
}

/**
 * Extracts a YouTube video id from a full watch/share URL, a youtu.be short
 * link, an embed URL, or a bare id string.
 */
export function extractYouTubeId(input: string): string {
  if (!input) return "";
  const watchMatch = input.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = input.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = input.match(/embed\/([^?&/]+)/);
  if (embedMatch) return embedMatch[1];
  // Already a bare id (no protocol/slashes)
  return input;
}

interface VideoObjectOptions {
  /** YouTube URL (watch, share, embed) or a bare video id. */
  source: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  /**
   * schema.org requires `uploadDate`, but we don't have the real publish
   * date for embedded yacht footage at build time. This is a known
   * limitation — callers may pass a real date when they have one, otherwise
   * a fixed placeholder date is used.
   */
  uploadDate?: string;
}

export function videoObjectSchema(opts: VideoObjectOptions) {
  const id = extractYouTubeId(opts.source);
  return {
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description ?? opts.name,
    thumbnailUrl: opts.thumbnailUrl ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    // Placeholder — see VideoObjectOptions.uploadDate doc comment above.
    uploadDate: opts.uploadDate ?? "2025-01-01",
    embedUrl: `https://www.youtube.com/embed/${id}`,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

const UNIT_CODE = {
  hourly: "HUR",
  daily: "DAY",
  weekly: "WEE",
  monthly: "MON",
} as const;

const UNIT_LABEL = {
  hourly: "hourly",
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
} as const;

type PricingUnit = keyof typeof UNIT_CODE;

function minHoursForSeason(yacht: Yacht, season: SeasonPricing): number | undefined {
  if (season.isWeekend) {
    return yacht.minHoursWeekend ?? yacht.minHoursWeekday;
  }
  return yacht.minHoursWeekday ?? yacht.minHoursWeekend;
}

export function yachtProductSchema(yacht: Yacht) {
  const currency = yacht.currency ?? "AED";
  const endOfYear = new Date(new Date().getFullYear(), 11, 31)
    .toISOString()
    .split("T")[0];

  const units: PricingUnit[] = ["hourly", "daily", "weekly", "monthly"];

  const subOffers: Array<Record<string, unknown>> = [];
  let hourlyLow: number | null = null;
  let dailyLow: number | null = null;
  let overallHigh: number | null = null;

  for (const season of yacht.pricing) {
    for (const unit of units) {
      const value = season[unit];
      if (value === null || value === undefined) continue;

      if (unit === "hourly") {
        hourlyLow = hourlyLow === null ? value : Math.min(hourlyLow, value);
      }
      if (unit === "daily") {
        dailyLow = dailyLow === null ? value : Math.min(dailyLow, value);
      }
      overallHigh = overallHigh === null ? value : Math.max(overallHigh, value);

      const minHours = unit === "hourly" ? minHoursForSeason(yacht, season) : undefined;

      subOffers.push({
        "@type": "Offer",
        name: `${season.season} — ${UNIT_LABEL[unit]}`,
        price: value,
        priceCurrency: currency,
        unitCode: UNIT_CODE[unit],
        availability: "https://schema.org/InStock",
        ...(season.validFrom ? { validFrom: season.validFrom } : {}),
        validThrough: season.validTo ?? endOfYear,
        ...(minHours !== undefined
          ? {
              eligibleQuantity: {
                "@type": "QuantitativeValue",
                minValue: minHours,
                unitCode: "HUR",
              },
            }
          : {}),
      });
    }
  }

  const lowPrice = hourlyLow ?? dailyLow;
  const pageUrl = `${SITE_CONFIG.url}/fleet/${yacht.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: yacht.name,
    description: yacht.description,
    image: yacht.images.map((img) => absoluteUrl(img)),
    brand: {
      "@type": "Brand",
      name: yacht.builder,
    },
    category: "Yacht Charter",
    sku: yacht.slug,
    productID: yacht.slug,
    audience: {
      "@type": "Audience",
      audienceType: `up to ${yacht.capacity} guests`,
    },
    offers:
      subOffers.length > 0 && lowPrice !== null
        ? {
            "@type": "AggregateOffer",
            priceCurrency: currency,
            lowPrice,
            highPrice: overallHigh ?? lowPrice,
            offerCount: subOffers.length,
            availability: "https://schema.org/InStock",
            url: pageUrl,
            seller: { "@id": `${SITE_CONFIG.url}/#organization` },
            offers: subOffers,
          }
        : undefined,
    ...(yacht.youtubeVideo
      ? {
          subjectOf: videoObjectSchema({
            source: yacht.youtubeVideo,
            name: `${yacht.name} — Yacht Tour`,
            description: `On-board tour of the ${yacht.name}, ${yacht.tagline}.`,
          }),
        }
      : {}),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Length",
        value: `${yacht.length.feet}ft / ${yacht.length.meters}m`,
      },
      {
        "@type": "PropertyValue",
        name: "Year",
        value: yacht.year,
      },
      {
        "@type": "PropertyValue",
        name: "Capacity",
        value: `${yacht.capacity} guests`,
      },
    ],
  };
}

export function faqSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

interface ArticleSchemaOptions {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
}

export function articleSchema(opts: ArticleSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    url: opts.url,
    image: opts.image ? `${SITE_CONFIG.url}${opts.image}` : undefined,
    author: {
      "@type": "Organization",
      name: opts.author,
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": opts.url,
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  priceFrom?: number;
  priceCurrency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
      containedInPlace: { "@type": "Country", name: "United Arab Emirates" },
    },
    ...(opts.priceFrom
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: opts.priceCurrency ?? "AED",
            price: opts.priceFrom,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function destinationSchema(destination: Destination) {
  const imageUrl = destination.coverImage.startsWith("http")
    ? destination.coverImage
    : `${SITE_CONFIG.url}${destination.coverImage}`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description:
      destination.shortDescription || destination.description.slice(0, 160),
    image: imageUrl,
    url: `${SITE_CONFIG.url}/destinations/${destination.slug}`,
    ...(destination.latitude && destination.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        }
      : {}),
    ...(destination.priceFrom
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "AED",
            price: destination.priceFrom,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    touristType: destination.bestFor,
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

export interface ItemListEntry {
  name: string;
  url: string;
  image?: string;
}

/**
 * Standalone ItemList schema — e.g. for a listing page's cards.
 */
export function itemListSchema(name: string, items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
      ...(item.image ? { image: absoluteUrl(item.image) } : {}),
    })),
  };
}

export interface CollectionPageOptions {
  name: string;
  description: string;
  url: string;
  items: ItemListEntry[];
}

/**
 * CollectionPage schema wrapping an ItemList as `mainEntity` — for
 * catalogue-style pages (destinations, services, blog index).
 */
export function collectionPageSchema(opts: CollectionPageOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.url),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.url),
        ...(item.image ? { image: absoluteUrl(item.image) } : {}),
      })),
    },
  };
}

export interface PersonSchemaInput {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string | null;
}

export function personSchema(member: PersonSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: absoluteUrl(member.image),
    worksFor: { "@id": `${SITE_CONFIG.url}/#organization` },
    ...(member.linkedin ? { sameAs: [member.linkedin] } : {}),
  };
}

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE_CONFIG.name}`,
    url: `${SITE_CONFIG.url}/contact`,
    about: { "@id": `${SITE_CONFIG.url}/#localbusiness` },
  };
}

const SALE_AVAILABILITY: Record<SaleListing["status"], string> = {
  draft: "https://schema.org/PreOrder",
  published: "https://schema.org/InStock",
  under_offer: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

/**
 * Product node for a yacht listed for sale. Every spec row is exposed as an
 * `additionalProperty` so search engines and AI assistants can quote exact
 * particulars. An `Offer` is only emitted when there is an asking price —
 * "price on application" listings would otherwise produce an invalid Offer.
 */
export function saleListingSchema(listing: SaleListing) {
  const url = `${SITE_CONFIG.url}/yachts-for-sale/${listing.slug}`;
  const properties = listing.specSections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "PropertyValue",
      name: item.label,
      value: item.value,
    }))
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${listing.title} for sale`,
    description: listing.summary,
    url,
    category: "Motor yacht",
    itemCondition: "https://schema.org/UsedCondition",
    ...(listing.builder
      ? {
          brand: { "@type": "Brand", name: listing.builder },
          manufacturer: { "@type": "Organization", name: listing.builder },
        }
      : {}),
    ...(listing.model ? { model: listing.model } : {}),
    ...(listing.yearBuilt ? { productionDate: String(listing.yearBuilt) } : {}),
    image: listing.images.slice(0, 10).map(absoluteUrl),
    ...(properties.length > 0 ? { additionalProperty: properties } : {}),
    ...(listing.price.amount !== null
      ? {
          offers: {
            "@type": "Offer",
            price: listing.price.amount,
            priceCurrency: listing.price.currency,
            availability: SALE_AVAILABILITY[listing.status],
            itemCondition: "https://schema.org/UsedCondition",
            url,
            seller: { "@id": `${SITE_CONFIG.url}/#organization` },
            availableAtOrFrom: {
              "@type": "Place",
              name: listing.lying,
              address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
            },
          },
        }
      : {}),
  };
}
