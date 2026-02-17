export const revalidate = 3600;

import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { DestinationsPageClient } from "@/components/pages/DestinationsPageClient";
import { fetchAllDestinations } from "@/lib/destinations-db";

export const metadata: Metadata = {
  title: "Dubai Yacht Destinations — Cruise Routes from Dubai Harbour",
  description:
    "Explore Dubai's top yacht cruise destinations: Palm Jumeirah, Ain Dubai, Burj Al Arab, The World Islands & more. Routes depart from Dubai Harbour with Imperial Yachting.",
  alternates: { canonical: `${SITE_CONFIG.url}/destinations` },
  openGraph: {
    title: `Dubai Yacht Destinations | ${SITE_CONFIG.name}`,
    description:
      "Explore Palm Jumeirah, Ain Dubai, The World Islands & more — yacht cruise routes from Dubai Harbour.",
    url: `${SITE_CONFIG.url}/destinations`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Dubai Yacht Destinations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Dubai Yacht Destinations | ${SITE_CONFIG.name}`,
    description: "Discover Dubai's best yacht cruise routes departing from Dubai Harbour.",
    images: ["/og-image.jpg"],
  },
};

export default async function DestinationsPage() {
  const destinations = await fetchAllDestinations();
  return <DestinationsPageClient destinations={destinations} />;
}
