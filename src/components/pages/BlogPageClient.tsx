"use client";

import {
  BookOpen,
  Clock,
  ArrowRight,
  Send,
  Youtube,
  Instagram,
  ExternalLink,
  Play,
  Heart,
  Camera,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_CONFIG } from "@/lib/constants";

const youtubeVideos = [
  {
    id: "shorts",
    title: "Latest from Imperial Wave",
    type: "channel" as const,
  },
];

const placeholderPosts = [
  {
    slug: "complete-guide-yacht-charter-dubai",
    title: "Complete Guide to Yacht Charter in Dubai",
    excerpt:
      "Everything you need to know about chartering a luxury yacht in Dubai, from choosing the right vessel to planning the perfect itinerary.",
    category: "Guide",
    readTime: "8 min read",
    gradient: "from-sea-500/30 via-navy-700 to-navy-800",
  },
  {
    slug: "best-time-yacht-charter-dubai",
    title: "Best Time for Yacht Charter in Dubai: Seasonal Guide",
    excerpt:
      "Discover the optimal months for your Dubai yacht experience, including weather patterns, seasonal events, and insider tips for every time of year.",
    category: "Seasonal",
    readTime: "6 min read",
    gradient: "from-gold-500/20 via-navy-700 to-navy-800",
  },
  {
    slug: "dubai-harbour-vs-dubai-marina",
    title: "Dubai Harbour vs Dubai Marina: Where to Charter",
    excerpt:
      "A detailed comparison of Dubai's two premier marina destinations, helping you choose the ideal departure point for your next charter.",
    category: "Comparison",
    readTime: "5 min read",
    gradient: "from-sea-400/25 via-navy-800 to-navy-900",
  },
];

export function BlogPageClient() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sea-500/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="origin-left mb-8 animate-hero-line">
              <div className="gold-line" />
            </div>

            <div className="mb-6 animate-hero-1">
              <BookOpen
                className="w-8 h-8 text-gold-500/60"
                strokeWidth={1.5}
              />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-hero-2">
              Insights &amp; Media
            </h1>

            <p className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-3">
              Follow our journey on the water. Videos, guides, and behind-the-scenes
              from Dubai&apos;s coastline.
            </p>

            {/* Social links */}
            <div className="mt-8 flex items-center gap-4 animate-hero-3">
              <a
                href={SITE_CONFIG.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-colors text-sm font-medium"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* YouTube Section */}
      <section className="py-20 sm:py-28 bg-navy-900">
        <Container>
          <div className="flex items-center gap-4 mb-2">
            <Youtube className="w-6 h-6 text-red-500" />
            <Badge variant="gold">Video</Badge>
          </div>
          <SectionHeading
            title="Watch Us in Action"
            subtitle="Charter highlights, yacht tours, and Dubai coastline adventures from our YouTube channel."
          />

          {/* Featured YouTube embed */}
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-navy-800">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed?listType=user_uploads&list=imperial_wave"
                  title="Imperial Wave YouTube Channel"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>

          {/* YouTube Shorts grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((_, i) => (
              <Reveal key={i} delay={i * 100}>
                <a
                  href={SITE_CONFIG.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-gradient-to-b from-navy-700 via-navy-800 to-navy-900 border border-white/5 hover:border-red-500/20 transition-all"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500/30 group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 text-red-400 ml-0.5" />
                    </div>
                    <span className="text-xs text-white/30 font-medium">
                      Watch on YouTube
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-red-400/60 font-medium">
                      <Youtube className="w-3 h-3" />
                      Shorts
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          {/* YouTube CTA */}
          <Reveal delay={200}>
            <div className="mt-8 text-center">
              <a
                href={SITE_CONFIG.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
              >
                <Youtube className="w-5 h-5" />
                Subscribe to Imperial Wave
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Instagram Section */}
      <section className="py-20 sm:py-28 bg-navy-950">
        <Container>
          <div className="flex items-center gap-4 mb-2">
            <Instagram className="w-6 h-6 text-pink-500" />
            <Badge variant="gold">Social</Badge>
          </div>
          <SectionHeading
            title="Life on the Water"
            subtitle="Daily moments, yacht views, and Dubai marina life. Follow us on Instagram for the real behind-the-scenes."
          />

          {/* Instagram grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              "from-pink-500/20 to-orange-500/10",
              "from-sea-500/20 to-navy-700",
              "from-gold-500/15 to-navy-800",
              "from-navy-600 to-sea-500/20",
              "from-orange-500/15 to-pink-500/10",
              "from-sea-400/20 to-gold-500/10",
            ].map((gradient, i) => (
              <Reveal key={i} delay={i * 80}>
                <a
                  href={SITE_CONFIG.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${gradient} bg-navy-800 border border-white/5 hover:border-pink-500/20 transition-all`}
                >
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/50 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                  </div>

                  {/* Corner icon */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Instagram className="w-4 h-4 text-white/60" />
                  </div>

                  {/* Center placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-0 transition-opacity">
                    <Camera className="w-6 h-6 text-white/30" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          {/* Instagram profile card */}
          <Reveal delay={200}>
            <div className="mt-10 max-w-lg mx-auto">
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-white/5 hover:border-pink-500/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-orange-500/30 flex items-center justify-center border-2 border-pink-500/30 flex-shrink-0">
                    <Instagram className="w-7 h-7 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                      @dubai.yachts.rental
                    </p>
                    <p className="text-sm text-white/40">
                      Dubai&apos;s luxury yacht charter experience
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-pink-400 font-medium">
                      <span>Follow on Instagram</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Articles coming soon */}
      <section className="py-20 sm:py-28 bg-navy-900">
        <Container>
          <SectionHeading
            title="Articles Coming Soon"
            subtitle="Expert guides and destination insights from our team."
            align="center"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {placeholderPosts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 100}>
                <article className="rounded-xl overflow-hidden border border-white/5 group">
                  <div
                    className={`relative aspect-[16/10] bg-gradient-to-br ${post.gradient}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-lg font-bold text-white/10 tracking-wider text-center px-6">
                        {post.title}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <Badge variant="gold">{post.category}</Badge>
                    </div>

                    <div className="absolute inset-0 bg-navy-950/40 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 px-5 py-2 text-sm font-heading font-bold text-gold-400 tracking-wide">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  <div className="bg-navy-800 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-white leading-snug">
                      {post.title}
                    </h3>

                    <p className="mt-3 text-sm text-white/50 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gold-400/60">
                      <span className="font-medium">Read article</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 sm:py-28 bg-navy-950">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Reveal>
              <div className="gold-line mx-auto mb-8" />

              <Send
                className="w-8 h-8 text-gold-500/40 mx-auto mb-6"
                strokeWidth={1.5}
              />

              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Stay in the Loop
              </h2>

              <p className="mt-4 text-white/50 leading-relaxed">
                Be the first to receive our yachting guides, seasonal offers,
                and destination insights. No spam, just quality content from
                the water.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <form
                className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 rounded-lg bg-navy-800 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20 transition-colors"
                />
                <Button variant="primary" size="md" type="submit">
                  Subscribe
                </Button>
              </form>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-4 text-xs text-white/30">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
