import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BlogPageClient } from "@/components/pages/BlogPageClient";

export const metadata: Metadata = {
  title: "Insights & Media",
  description:
    "Videos, guides, and behind-the-scenes from Dubai's coastline. Follow Imperial Yachting on YouTube and Instagram for the latest charter content.",
  openGraph: {
    title: `Insights & Media | ${SITE_CONFIG.name}`,
    description:
      "Videos, guides, and behind-the-scenes from Dubai's coastline. Follow Imperial Yachting on YouTube and Instagram.",
    url: `${SITE_CONFIG.url}/blog`,
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
