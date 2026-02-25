import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { DockAndDineContent } from "./DockAndDineContent";

const PAGE_URL = `${SITE_CONFIG.url}/destinations/dock-and-dine-dubai`;

export const metadata: Metadata = {
  title: "Dock & Dine Dubai — Free Yacht Mooring at 20 Marinas",
  description:
    "Discover Dubai's Dock & Dine initiative: free short-term mooring at 20 marinas for waterfront dining. Full marina list, contacts, and how to book your yacht-to-table experience.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `Dock & Dine Dubai — Free Yacht Mooring | ${SITE_CONFIG.name}`,
    description:
      "Free yacht mooring at 20 Dubai marinas for waterfront dining. See the complete list of participating marinas, restaurants, and contacts.",
    url: PAGE_URL,
    type: "article",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dock & Dine Dubai — Yacht Mooring at Waterfront Restaurants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dock & Dine Dubai — Free Yacht Mooring at 20 Marinas",
    description:
      "Free short-term mooring at 20 Dubai marinas for waterfront dining. Full guide with contacts.",
    images: ["/og-image.jpg"],
  },
};

export default function DockAndDinePage() {
  return (
    <>
      <JsonLd
        data={articleSchema({
          headline:
            "Dock & Dine Dubai — Free Yacht Mooring at 20 Waterfront Marinas",
          description:
            "Complete guide to Dubai's Dock & Dine initiative: free short-term mooring at 20 marinas for waterfront dining, launched by Dubai Maritime Authority and Department of Economy and Tourism.",
          datePublished: "2025-09-01",
          dateModified: "2025-09-01",
          author: SITE_CONFIG.name,
          url: PAGE_URL,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
          {
            name: "Dock & Dine Dubai",
            url: "/destinations/dock-and-dine-dubai",
          },
        ])}
      />
      <DockAndDineContent />
    </>
  );
}
