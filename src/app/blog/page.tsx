import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BlogPageClient } from "@/components/pages/BlogPageClient";

export const metadata: Metadata = {
  title: "Social Media & Videos",
  description:
    "Follow Imperial Yachting on YouTube and Instagram. Watch yacht tours, charter highlights, and behind-the-scenes from Dubai's coastline.",
  openGraph: {
    title: `Social Media & Videos | ${SITE_CONFIG.name}`,
    description:
      "Watch yacht tours, charter highlights, and behind-the-scenes content. Follow us on YouTube and Instagram.",
    url: `${SITE_CONFIG.url}/blog`,
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
