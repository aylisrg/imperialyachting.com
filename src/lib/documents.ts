/**
 * Catalog of the company documents shown in the private /documents portal.
 *
 * This is pure data (no secrets, no filesystem access) so it can be imported by
 * both server and client components. The actual PDF files live OUTSIDE /public,
 * in `private/documents/`, and are streamed only through the auth-checked route
 * `GET /api/documents/file/[slug]`. See DOCUMENTS_RU.md for how to add files.
 */

export type DocumentCategory = "legal" | "corporate";

export interface CompanyDocument {
  /** URL-safe id, also used as the download route segment. */
  slug: string;
  /** Display title. */
  title: string;
  /** Short description shown on the card. */
  description: string;
  /** File name expected inside `private/documents/`. */
  filename: string;
  /** Grouping for the portal layout. */
  category: DocumentCategory;
  /** Lucide icon key (mapped to a component in the portal). */
  icon:
    | "license"
    | "ejari"
    | "incorporation"
    | "establishment"
    | "memorandum"
    | "profile";
}

export const DOCUMENT_CATEGORIES: Record<
  DocumentCategory,
  { title: string; subtitle: string }
> = {
  legal: {
    title: "Licensing & Legal",
    subtitle: "Official trade licensing and registered tenancy documentation.",
  },
  corporate: {
    title: "Corporate Registration",
    subtitle: "Incorporation and establishment records for the company.",
  },
};

export const COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    slug: "company-card",
    title: "Company Card",
    description:
      "One-page company profile: activity, website, and bank details for wire transfers.",
    filename: "company-card.pdf",
    category: "corporate",
    icon: "profile",
  },
  {
    slug: "trade-license",
    title: "Trade License",
    description:
      "Official Dubai trade license authorising Imperial Charter Yachting Services to operate.",
    filename: "trade-license.pdf",
    category: "legal",
    icon: "license",
  },
  {
    slug: "ejari",
    title: "EJARI Tenancy Contract",
    description:
      "Government-registered tenancy contract (Ejari) for the registered company office.",
    filename: "ejari.pdf",
    category: "legal",
    icon: "ejari",
  },
  {
    slug: "certificate-of-incorporation",
    title: "Certificate of Incorporation",
    description:
      "Certificate confirming the legal incorporation and registration of the company.",
    filename: "certificate-of-incorporation.pdf",
    category: "corporate",
    icon: "incorporation",
  },
  {
    slug: "establishment-card",
    title: "Establishment Card",
    description:
      "Immigration establishment card issued to the company for sponsorship and operations.",
    filename: "establishment-card.pdf",
    category: "corporate",
    icon: "establishment",
  },
  {
    slug: "memorandum-of-association",
    title: "Memorandum of Association",
    description:
      "Memorandum of Association setting out the company's constitution and shareholding.",
    filename: "memorandum-of-association.pdf",
    category: "corporate",
    icon: "memorandum",
  },
];

export function getDocumentBySlug(slug: string): CompanyDocument | undefined {
  return COMPANY_DOCUMENTS.find((doc) => doc.slug === slug);
}
