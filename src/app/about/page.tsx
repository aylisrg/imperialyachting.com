import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/schemas";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About Imperial Yachting — Dubai Yacht Charter Company",
  description:
    "Imperial Yachting is a Dubai-based yacht charter & management company operating from Dubai Harbour. Meet our team and discover why we're the trusted choice.",
  alternates: { canonical: `${SITE_CONFIG.url}/about` },
  openGraph: {
    title: "About Imperial Yachting",
    description:
      "Dubai-based yacht charter & management company at Dubai Harbour. Meet our team and discover our values.",
    url: `${SITE_CONFIG.url}/about`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "About Imperial Yachting" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Imperial Yachting",
    description: "Dubai's premier yacht charter & management company at Dubai Harbour.",
    images: ["/og-image.jpg"],
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
