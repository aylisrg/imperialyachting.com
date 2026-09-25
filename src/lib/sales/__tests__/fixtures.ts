import type { SaleListingRow, SaleMediaRow } from "@/lib/supabase/types";
import type { Yacht } from "@/types/yacht";

export function saleRow(overrides: Partial<SaleListingRow> = {}): SaleListingRow {
  return {
    id: "listing-1",
    slug: "vandutch-40-van-dutch-connect",
    status: "published",
    fleet_yacht_slug: null,
    name: "Van Dutch Connect",
    builder: "VanDutch",
    model: "VanDutch 40",
    year_built: 2010,
    refit_year: 2025,
    length_m: 12,
    beam_m: 3.5,
    draft_m: 0.95,
    guests: 10,
    cabins: 1,
    engines: "2 × Yanmar 6LY3-STP",
    top_speed_kn: 30,
    lying: "Dubai Harbour, UAE",
    flag: "United Arab Emirates",
    price_amount: null,
    price_currency: "AED",
    headline: "2010 VanDutch 40 · 2025 refit",
    summary: "VanDutch 40 for sale in Dubai.",
    description: "First paragraph.\n\nSecond paragraph.",
    highlights: ["Fresh 2025 refit"],
    features: ["Swim platform"],
    spec_sections: [{ title: "Hull", items: [{ label: "Beam", value: "3.50 m" }] }],
    faq: [{ question: "Price?", answer: "On application." }],
    seo_title: null,
    seo_description: null,
    keywords: [],
    hero_image: null,
    broker_terms: null,
    sort_order: 0,
    published_at: "2026-09-25T00:00:00Z",
    created_at: "2026-09-25T00:00:00Z",
    updated_at: "2026-09-25T00:00:00Z",
    ...overrides,
  };
}

export function mediaRow(overrides: Partial<SaleMediaRow> = {}): SaleMediaRow {
  return {
    id: "media-1",
    listing_id: "listing-1",
    kind: "image",
    url: "https://x.supabase.co/storage/v1/object/public/sale-media/a.jpg",
    storage_path: "a.jpg",
    caption: "",
    sort_order: 0,
    created_at: "2026-09-25T00:00:00Z",
    ...overrides,
  };
}

export function fleetYacht(overrides: Partial<Yacht> = {}): Yacht {
  return {
    slug: "monte-carlo-6",
    name: "Moneta",
    tagline: "60ft of Pure Italian Elegance",
    description: "Fleet description.",
    builder: "Monte Carlo Yachts",
    year: 2016,
    refit: 2023,
    length: { feet: 60, meters: 18 },
    capacity: 18,
    cabins: 3,
    location: "Dubai Harbour",
    images: [
      "https://x.supabase.co/storage/v1/object/public/yacht-photos/mc/1.jpg",
      "https://x.supabase.co/storage/v1/object/public/yacht-photos/mc/2.webp",
    ],
    heroImage: "https://x.supabase.co/storage/v1/object/public/yacht-photos/mc/1.jpg",
    specs: [{ label: "Engines", value: "Twin Cummins 600 HP" }],
    amenities: [{ icon: "wifi", label: "WiFi" }],
    pricing: [],
    included: [],
    featured: true,
    youtubeShorts: ["https://youtube.com/shorts/SUycrsk56tY", ""],
    youtubeVideo: "https://youtu.be/iqY2Ss8-hBM",
    showVideos: true,
    dailyRules: "",
    weeklyRules: "",
    ...overrides,
  };
}
