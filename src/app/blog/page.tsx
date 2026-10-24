import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchYouTubeVideos } from "@/lib/youtube";
import { WakeBlog } from "./WakeBlog";
import { posts } from "@/data/posts";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Blog, Guides & Videos",
  description:
    "Practical guides on yacht charter pricing, itineraries, and events in Dubai, plus yacht tours and highlights from Imperial Yachting.",
  alternates: { canonical: `${SITE_CONFIG.url}/blog` },
  openGraph: {
    title: `Blog, Guides & Videos | ${SITE_CONFIG.name}`,
    description:
      "Practical yacht charter guides plus yacht tours, charter highlights, and behind-the-scenes content from Dubai.",
    url: `${SITE_CONFIG.url}/blog`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Imperial Yachting Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog, Guides & Videos | ${SITE_CONFIG.name}`,
    description: "Yacht charter guides, tours, and highlights from Dubai.",
    images: ["/og-image.jpg"],
  },
};

// Revalidate the page every hour to pick up new YouTube videos
export const revalidate = 3600;

export default async function BlogPage() {
  const videos = await fetchYouTubeVideos(12);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ])}
      />
      <JsonLd
        data={itemListSchema(
          "Imperial Yachting Blog",
          posts.map((post) => ({
            name: post.title,
            url: `/blog/${post.slug}`,
          }))
        )}
      />

      <WakeBlog posts={posts} videos={videos} />
    </>
  );
}
