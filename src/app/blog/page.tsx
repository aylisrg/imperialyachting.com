import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchYouTubeVideos } from "@/lib/youtube";
import { BlogPageClient } from "@/components/pages/BlogPageClient";
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

      {/* Articles */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10">
          <SectionHeading
            title="Guides & Articles"
            subtitle="Practical, specific answers to the questions guests ask us most — pricing, itineraries, events, and how to book with an AI assistant."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block p-6 rounded-2xl bg-navy-900/60 border border-white/5 hover:border-gold-500/20 transition-all"
              >
                <Badge variant="gold">{post.category}</Badge>
                <h2 className="mt-5 font-heading text-xl font-bold text-white leading-snug group-hover:text-gold-300 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-white/50 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
                <div className="mt-6 flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.datePublished)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingMinutes} min
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <BlogPageClient videos={videos} instagramPosts={[]} />
    </>
  );
}
