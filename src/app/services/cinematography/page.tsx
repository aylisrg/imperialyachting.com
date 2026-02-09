import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { CinematographyPageContent } from "./CinematographyPageContent";

export const metadata: Metadata = {
  title: "Yacht Cinematography & Content Production",
  description:
    "Professional yacht cinematography, drone footage, event filming, and social media content production by Imperial Yachting's Cinematographic Bureau in Dubai.",
  openGraph: {
    title: "Yacht Cinematography & Content Production | Imperial Yachting",
    description:
      "Professional yacht cinematography, drone footage, event filming, and social media content production by Imperial Yachting's Cinematographic Bureau in Dubai.",
    url: `${SITE_CONFIG.url}/services/cinematography`,
  },
};

export default function CinematographyPage() {
  return <CinematographyPageContent />;
}
