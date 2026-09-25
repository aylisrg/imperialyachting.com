import type { FAQItem } from "./common";

export type SaleStatus = "draft" | "published" | "under_offer" | "sold";

export interface SaleSpecItem {
  label: string;
  value: string;
}

export interface SaleSpecSection {
  title: string;
  items: SaleSpecItem[];
}

export interface SaleVideo {
  /** `youtube` renders an embed; `file` is an MP4/WebM served from storage. */
  kind: "youtube" | "file";
  url: string;
  caption: string;
}

/**
 * A yacht listed for sale, with every empty field already filled in from the
 * linked charter-fleet yacht (see `mergeSaleListing`), so pages never have to
 * know where a value came from.
 */
export interface SaleListing {
  id: string;
  slug: string;
  status: SaleStatus;
  fleetSlug: string | null;
  /** Vessel name, e.g. "Van Dutch Connect". */
  name: string;
  /** Display title, e.g. `VanDutch 40 "Van Dutch Connect"`. */
  title: string;
  builder: string;
  model: string;
  yearBuilt: number | null;
  refitYear: number | null;
  lengthM: number | null;
  lengthFt: number | null;
  beamM: number | null;
  draftM: number | null;
  guests: number | null;
  cabins: number | null;
  engines: string;
  topSpeedKn: number | null;
  lying: string;
  flag: string;
  price: { amount: number | null; currency: string };
  headline: string;
  summary: string;
  description: string;
  highlights: string[];
  features: string[];
  specSections: SaleSpecSection[];
  faq: FAQItem[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  brokerTerms: string;
  heroImage: string;
  images: string[];
  videos: SaleVideo[];
  publishedAt: string | null;
  updatedAt: string;
}

/** Public, gate-safe description of a downloadable item (no locations/URLs). */
export interface SaleMaterialSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  /** `file` downloads; `link` opens an external page (e.g. a Drive folder). */
  kind: "file" | "link";
  sizeBytes: number | null;
  /** Number of files the item expands to (photo pack). */
  fileCount: number;
}

export interface SaleDownloadFile {
  name: string;
  url: string;
  kind: "file" | "link";
}
