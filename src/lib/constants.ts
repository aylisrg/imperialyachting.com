export const SITE_CONFIG = {
  name: "Imperial Yachting",
  legalName: "IMPERIAL CHARTER YACHTING SERVICES L.L.C",
  tagline: "Dubai's Premier Yacht Charter & Management",
  description:
    "Imperial Yachting offers luxury yacht charter, management, and crewed experiences in Dubai. Explore our owned fleet of premium motor yachts at Dubai Harbour.",
  url: "https://imperialyachting.com",
  phone: "+971-52-8355939",
  email: "booking@imperialyachting.com",
  whatsapp: "https://wa.me/971528355939",
  instagram: "https://instagram.com/dubai.yachts.rental",
  youtube: "https://youtube.com/@imperial_wave",
  linkedinCeo: "https://www.linkedin.com/in/aylis",
  brandwave: "https://brandwave.imperialyachting.com/",
  address: {
    street: "The Binary by Omniyat, Office 1914-261",
    area: "Business Bay",
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
  googleReviewUrl: "https://g.page/r/CXxxxxxxxxxxxxxxxxx/review",
  googleProfileUrl: "https://share.google/KtUZNa28mb0KLpnLB",
  bankDetails: {
    bank: "Sharjah Islamic Bank",
    iban: "AE860410000012134346001",
    account: "0012134346001",
    swift: "NBSHAEASXXX",
  },
} as const;

export const DEPARTURE_POINT_SLUG = "dubai-harbour";

export const NAV_LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Services", href: "/services" },
  { label: "Destinations", href: "/destinations" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const SERVICE_NAV = [
  { label: "Charter", href: "/services/charter" },
  { label: "Yacht Management", href: "/services/yacht-management" },
  { label: "Cinematography", href: "/services/cinematography" },
  { label: "Brandwave", href: "/services/brandwave" },
] as const;
