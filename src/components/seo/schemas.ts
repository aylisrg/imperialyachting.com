import { SITE_CONFIG } from "@/lib/constants";
import type { Yacht } from "@/types/yacht";
import type { FAQItem } from "@/types/common";

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
