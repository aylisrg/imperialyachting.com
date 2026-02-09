import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/schemas";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About Imperial Yachting",
  description:
    "Learn about Imperial Yachting — Dubai's premier yacht charter and management company. Meet our team, discover our values, and explore our credentials.",
  openGraph: {
    title: "About Imperial Yachting",
    description:
      "Learn about Imperial Yachting — Dubai's premier yacht charter and management company. Meet our team, discover our values, and explore our credentials.",
    url: `${SITE_CONFIG.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <AboutPageContent />
    </>
  );
}
