import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BrandwavePageContent } from "./BrandwavePageContent";

export const metadata: Metadata = {
  title: "Yacht Branding & Marketing — Brandwave by Imperial Yachting",
  description:
    "Brandwave by Imperial Yachting — yacht branding, marketing, wrapping, digital campaigns & luxury brand positioning in Dubai.",
  alternates: { canonical: `${SITE_CONFIG.url}/services/brandwave` },
  openGraph: {
    title: "Brandwave — Yacht Branding & Marketing | Imperial Yachting",
    description:
      "Full-service yacht branding, wrapping, digital campaigns & luxury brand positioning.",
    url: `${SITE_CONFIG.url}/services/brandwave`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Brandwave by Imperial Yachting" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brandwave | Imperial Yachting",
    description: "Yacht branding, wrapping, marketing & digital campaigns in Dubai.",
    images: ["/og-image.jpg"],
  },
};

export default function BrandwavePage() {
  return <BrandwavePageContent />;
}
