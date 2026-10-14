import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { DockAndDineContent } from "./DockAndDineContent";

const PAGE_URL = `${SITE_CONFIG.url}/destinations/dock-and-dine-dubai`;

export const metadata: Metadata = {
  title: "Dock & Dine Dubai — Yacht-to-Table Mooring at Waterfront Marinas",
  description:
    "Discover Dubai's Dock & Dine initiative: short-term yacht mooring at participating marinas for waterfront dining. How it works and who to contact.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `Dock & Dine Dubai — Yacht-to-Table | ${SITE_CONFIG.name}`,
    description:
      "Yacht mooring at participating Dubai marinas for waterfront dining. How it works and who to contact.",
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
    title: "Dock & Dine Dubai — Yacht-to-Table Mooring at Waterfront Marinas",
    description:
      "Short-term yacht mooring at participating Dubai marinas for waterfront dining. Guide and contacts.",
    images: ["/og-image.jpg"],
  },
};

export default function DockAndDinePage() {
  return (
    <>
      <JsonLd
        data={articleSchema({
          headline:
            "Dock & Dine Dubai — Yacht-to-Table Mooring at Waterfront Marinas",
          description:
            "Guide to Dubai's Dock & Dine initiative by Dubai Maritime Authority and the Department of Economy and Tourism: short-term yacht mooring at participating marinas for waterfront dining.",
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
