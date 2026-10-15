export const SITE_CONFIG = {
  name: "Imperial Yachting",
  legalName: "IMPERIAL CHARTER YACHTING SERVICES L.L.C",
  tagline: "Dubai's Premier Yacht Charter & Management",
  description:
    "Imperial Yachting offers luxury yacht charter, management, and crewed experiences in Dubai. Explore our owned fleet of premium motor yachts at Dubai Harbour and Marasi Bay.",
  url: "https://imperialyachting.com",
  phone: "+971-52-8355939",
  email: "booking@imperialyachting.com",
  whatsapp: "https://wa.me/971528355939",
  instagram: "https://instagram.com/imperial.yachting.uae",
  youtube: "https://youtube.com/@imperial_wave",
  linkedinCeo: "https://www.linkedin.com/in/aylis",
  brandwave: "https://brandwave.imperialyachting.com/",
  address: {
    street: "Office No4-592, AL KHABEESI BLDG",
    area: "Al Khabeesi, Deira",
    city: "Dubai",
    country: "UAE",
  },
  harbour: {
    name: "Dubai Harbour Yacht Club",
    area: "Dubai Harbour",
    city: "Dubai",
    country: "UAE",
  },
  license: "960574",
  companyRegistration: "2236727",
  taxId: "100601445800003",
  googleAnalyticsId: "G-BQPZ2WJWWL",
  // Google Business Profile — "Get more reviews" direct link from GBP Dashboard
  // Format: https://g.page/r/XXXXXXXXXXXXXXXXXX/review
  // Update this URL from: Google Business Profile → Home → "Get more reviews"
  googleReviewUrl: "https://g.page/r/CTjchxby6OS8EBM/review",
  googleProfileUrl: "https://share.google/KtUZNa28mb0KLpnLB",
  bankDetails: {
    bank: "Sharjah Islamic Bank",
    iban: "AE860410000012134346001",
    account: "0012134346001",
    swift: "NBSHAEASXXX",
  },
} as const;

/**
 * Direct line for the yachts-for-sale section (buyers and brokers). Used
 * instead of the charter booking number everywhere under /yachts-for-sale
 * and in sales emails; the rest of the site keeps SITE_CONFIG.phone.
 */
export const SALES_CONTACT = {
  phone: "+971-58-5272280",
  whatsapp: "https://wa.me/971585272280",
} as const;

export const SALES_PATH_PREFIX = "/yachts-for-sale";

/** Phone/WhatsApp to show for a route: the sales line on sales pages, the booking line elsewhere. */
export function contactForPath(pathname: string | null | undefined): {
  phone: string;
  whatsapp: string;
} {
  return pathname?.startsWith(SALES_PATH_PREFIX) ? SALES_CONTACT : SITE_CONFIG;
}

/**
 * Speedboat Transfer — water taxi on a Van Dutch. Orders go to the Telegram bot, whose
 * menu button and /start reply open the ordering mini app; guests without Telegram write
 * to the booking manager on WhatsApp. Price: 1,000 AED + 5% VAT per hour.
 */
export const SPEEDBOAT_TRANSFER = {
  path: "/services/speedboat-transfer",
  termsPath: "/services/speedboat-transfer/terms",
  orderUrl: "https://t.me/iy_speedboat_transfer_bot?start=site",
  pricePerHourAed: 1050,
  maxGuests: 10,
} as const;

export const DEPARTURE_POINT_SLUG = "dubai-harbour";

export const NAV_LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Services", href: "/services" },
  { label: "Speedboat Transfer", href: "/services/speedboat-transfer", isNew: true },
  { label: "Destinations", href: "/destinations" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  // Footer only (Product PM): the header stays at seven items.
  { label: "Docs", href: "/documents", footerOnly: true },
  { label: "Contact", href: "/contact" },
] as const;

/** The header's links: NAV_LINKS without the footer-only ones. */
export const HEADER_NAV_LINKS = NAV_LINKS.filter((l) => !("footerOnly" in l && l.footerOnly));

export const SERVICE_NAV = [
  { label: "Charter", href: "/services/charter" },
  { label: "Yacht Management", href: "/services/yacht-management" },
  { label: "Cinematography", href: "/services/cinematography" },
  { label: "Brandwave", href: "/services/brandwave" },
  { label: "Speedboat Transfer", href: "/services/speedboat-transfer" },
] as const;
