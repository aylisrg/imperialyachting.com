import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { DestinationsPageClient } from "@/components/pages/DestinationsPageClient";
import { fetchAllDestinations } from "@/lib/destinations-db";

export const metadata: Metadata = {
  title: "Dubai Yacht Destinations",
  description:
    "Explore Dubai's most spectacular yacht charter destinations. From Palm Jumeirah to The World Islands, discover the best routes departing from Dubai Harbour with Imperial Yachting.",
  openGraph: {
    title: `Dubai Yacht Destinations | ${SITE_CONFIG.name}`,
    description:
      "Explore Dubai's most spectacular yacht charter destinations. From Palm Jumeirah to The World Islands, discover the best routes departing from Dubai Harbour.",
    url: `${SITE_CONFIG.url}/destinations`,
  },
};

export default async function DestinationsPage() {
  const destinations = await fetchAllDestinations();
  return <DestinationsPageClient destinations={destinations} />;
}
