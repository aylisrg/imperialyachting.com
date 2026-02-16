import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
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
  return <CinematographyPageContent />;
}
