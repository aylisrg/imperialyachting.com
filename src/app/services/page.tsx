import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Comprehensive yacht services in Dubai — luxury charter, fleet management, cinematography, and yacht branding by Imperial Yachting.",
  openGraph: {
    title: "Our Services | Imperial Yachting",
    description:
      "Comprehensive yacht services in Dubai — luxury charter, fleet management, cinematography, and yacht branding by Imperial Yachting.",
    url: `${SITE_CONFIG.url}/services`,
  },
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
