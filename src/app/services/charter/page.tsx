import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { charterFAQ } from "@/data/faq";
import { CharterPageContent } from "./CharterPageContent";

export const metadata: Metadata = {
  title: "Yacht Charter Dubai",
  description:
    "Luxury yacht charter in Dubai with Imperial Yachting. Day, weekly, and monthly charters on our premium owned fleet departing from Dubai Harbour.",
  openGraph: {
    title: "Yacht Charter Dubai | Imperial Yachting",
    description:
      "Luxury yacht charter in Dubai with Imperial Yachting. Day, weekly, and monthly charters on our premium owned fleet departing from Dubai Harbour.",
    url: `${SITE_CONFIG.url}/services/charter`,
  },
};

export default function CharterPage() {
  return (
    <>
      <JsonLd data={faqSchema(charterFAQ)} />
      <CharterPageContent />
    </>
  );
}
