import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BrandwavePageContent } from "./BrandwavePageContent";

export const metadata: Metadata = {
  title: "Yacht Branding & Marketing — Brandwave",
  description:
    "Brandwave by Imperial Yachting — full-service yacht branding, marketing, yacht wrapping, digital campaigns, and luxury brand positioning in Dubai.",
  openGraph: {
    title: "Yacht Branding & Marketing — Brandwave | Imperial Yachting",
    description:
      "Brandwave by Imperial Yachting — full-service yacht branding, marketing, yacht wrapping, digital campaigns, and luxury brand positioning in Dubai.",
    url: `${SITE_CONFIG.url}/services/brandwave`,
  },
};

export default function BrandwavePage() {
  return <BrandwavePageContent />;
}
