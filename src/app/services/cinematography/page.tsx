import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { CinematographyPageContent } from "./CinematographyPageContent";

export const metadata: Metadata = {
  title: "Yacht Cinematography & Content Production — Dubai",
  description:
    "Professional yacht cinematography, drone footage, event filming & social media content production by Imperial Yachting's Cinematographic Bureau in Dubai.",
  alternates: { canonical: `${SITE_CONFIG.url}/services/cinematography` },
  openGraph: {
    title: "Yacht Cinematography & Content Production | Imperial Yachting",
    description:
      "Professional yacht cinematography, drone footage & content production in Dubai.",
    url: `${SITE_CONFIG.url}/services/cinematography`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Yacht Cinematography Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yacht Cinematography | Imperial Yachting",
    description: "Drone footage, event filming & content production for yachts in Dubai.",
    images: ["/og-image.jpg"],
  },
};

export default function CinematographyPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Yacht Cinematography & Content Production",
          description:
            "Professional yacht-based film production, drone footage, and content creation for brands, events, and social media through our Cinematographic Bureau.",
          url: `${SITE_CONFIG.url}/services/cinematography`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Cinematography", url: "/services/cinematography" },
        ])}
      />
      <CinematographyPageContent />
    </>
  );
}
