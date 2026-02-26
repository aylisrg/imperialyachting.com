import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchYouTubeVideos } from "@/lib/youtube";
import { BlogPageClient } from "@/components/pages/BlogPageClient";

export const metadata: Metadata = {
  title: "Social Media & Videos — Yacht Tours & Highlights",
  description:
    "Watch yacht tours, Dubai charter highlights, and behind-the-scenes content from Imperial Yachting. Follow us on YouTube and Instagram.",
  alternates: { canonical: `${SITE_CONFIG.url}/blog` },
  openGraph: {
    title: `Social Media & Videos | ${SITE_CONFIG.name}`,
    description:
      "Watch yacht tours, charter highlights, and behind-the-scenes content from Dubai.",
    url: `${SITE_CONFIG.url}/blog`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Imperial Yachting Videos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Social Media & Videos | ${SITE_CONFIG.name}`,
    description: "Yacht tours, charter highlights & behind-the-scenes from Dubai.",
    images: ["/og-image.jpg"],
  },
};

// Revalidate the page every hour to pick up new YouTube videos
export const revalidate = 3600;

export default async function BlogPage() {
  const videos = await fetchYouTubeVideos(12);
  return <BlogPageClient videos={videos} instagramPosts={[]} />;
}
