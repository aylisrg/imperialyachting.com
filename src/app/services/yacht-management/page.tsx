import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { managementFAQ } from "@/data/faq";
import { YachtManagementPageContent } from "./YachtManagementPageContent";

export const metadata: Metadata = {
  title: "Yacht Management Services Dubai",
  description:
    "Professional yacht management in Dubai by Imperial Yachting. Charter revenue optimization, crew management, maintenance, accounting, and berth management.",
  openGraph: {
    title: "Yacht Management Services Dubai | Imperial Yachting",
    description:
      "Professional yacht management in Dubai by Imperial Yachting. Charter revenue optimization, crew management, maintenance, accounting, and berth management.",
    url: `${SITE_CONFIG.url}/services/yacht-management`,
  },
};

export default function YachtManagementPage() {
  return (
    <>
      <JsonLd data={faqSchema(managementFAQ)} />
      <YachtManagementPageContent />
    </>
  );
}
