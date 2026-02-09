import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BlogPageClient } from "@/components/pages/BlogPageClient";

export const metadata: Metadata = {
  title: "Insights & Journal",
  description:
    "Expert guides, destination insights, and the latest from the world of luxury yachting in Dubai. Stay informed with Imperial Yachting's journal.",
  openGraph: {
    title: `Insights & Journal | ${SITE_CONFIG.name}`,
    description:
      "Expert guides, destination insights, and the latest from the world of luxury yachting in Dubai.",
    url: `${SITE_CONFIG.url}/blog`,
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
