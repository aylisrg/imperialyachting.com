import { SITE_CONFIG } from "@/lib/constants";
import type { Yacht } from "@/types/yacht";
import type { FAQItem, Destination } from "@/types/common";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
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

export function localBusinessSchema() {
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "87",
      bestRating: "5",
      worstRating: "1",
    },
    hasMap: "https://maps.google.com/?q=Dubai+Harbour+Yacht+Club",
    sameAs: [
      SITE_CONFIG.instagram,
      SITE_CONFIG.youtube,
      SITE_CONFIG.linkedinCeo,
    ],
  };
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

export function yachtProductSchema(yacht: Yacht) {
  const lowestPrice = yacht.pricing.reduce<number | null>((min, season) => {
    const daily = season.daily;
    if (daily === null) return min;
    if (min === null) return daily;
    return daily < min ? daily : min;
  }, null);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: yacht.name,
    description: yacht.description,
    image: yacht.images.map((img) =>
      img.startsWith("http") ? img : `${SITE_CONFIG.url}${img}`
    ),
    brand: {
      "@type": "Brand",
      name: yacht.builder,
    },
    category: "Yacht Charter",
    offers: lowestPrice
      ? {
          "@type": "Offer",
          priceCurrency: "AED",
          price: lowestPrice,
          priceValidUntil: new Date(
            new Date().getFullYear(),
            11,
            31
          ).toISOString().split("T")[0],
          availability: "https://schema.org/InStock",
          url: `${SITE_CONFIG.url}/fleet/${yacht.slug}`,
          seller: {
            "@type": "Organization",
            name: SITE_CONFIG.name,
          },
        }
      : undefined,
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
      item: item.url.startsWith("http") ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function serviceAreaSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.url}/#localbusiness-area`,
    name: SITE_CONFIG.name,
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
