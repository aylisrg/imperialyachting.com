"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight, Send } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

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
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="origin-left mb-8"
            >
              <div className="gold-line" />
            </motion.div>

            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-6"
            >
              <BookOpen
                className="w-8 h-8 text-gold-500/60"
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              Insights &amp; Journal
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed"
            >
              Expert guides, destination insights, and the latest from the world
              of luxury yachting in Dubai.
            </motion.p>
          </div>
        </Container>
      </section>

      {/* Blog Posts */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Latest Articles"
            subtitle="Our journal is launching soon. Here's a preview of what's coming."
            align="center"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {placeholderPosts.map((post, i) => (
              <motion.article
                key={post.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="rounded-xl overflow-hidden border border-white/5 group"
              >
                {/* Gradient placeholder image */}
                <div
                  className={`relative aspect-[16/10] bg-gradient-to-br ${post.gradient}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-lg font-bold text-white/10 tracking-wider text-center px-6">
                      {post.title}
                    </span>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="gold">{post.category}</Badge>
                  </div>

                  {/* Coming Soon overlay */}
                  <div className="absolute inset-0 bg-navy-950/40 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 px-5 py-2 text-sm font-heading font-bold text-gold-400 tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                </div>

                {/* Content */}
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
              </motion.article>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter Signup */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
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
            </motion.div>

            <motion.form
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
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
            </motion.form>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="mt-4 text-xs text-white/30"
            >
              We respect your privacy. Unsubscribe anytime.
            </motion.p>
          </div>
        </Container>
      </section>
    </>
  );
}
