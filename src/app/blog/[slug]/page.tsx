import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Calendar,
  Clock,
  MessageCircle,
  Ship,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/components/seo/schemas";
import { posts, type BlogPost } from "@/data/posts";
import { SITE_CONFIG } from "@/lib/constants";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: true },
    };
  }

  const pageUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author],
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const pageUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd
        data={articleSchema({
          headline: post.title,
          description: post.description,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          author: post.author,
          url: pageUrl,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Journal", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      {post.faq && post.faq.length > 0 && (
        <JsonLd data={faqSchema(post.faq)} />
      )}

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-white/40 mb-8"
          >
            <Link href="/" className="hover:text-gold-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-gold-400 transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70 truncate max-w-[200px] sm:max-w-none">
              {post.title}
            </span>
          </nav>

          <div className="max-w-3xl">
            <Badge variant="gold">{post.category}</Badge>

            <h1 className="mt-6 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            <p className="mt-5 text-lg text-white/60 leading-relaxed">
              {post.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/40">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500/60" />
                {formatDate(post.datePublished)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-500/60" />
                {post.readingMinutes} min read
              </span>
              <span>By {post.author}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Article body */}
      <section className="py-16 sm:py-20 bg-navy-950 border-t border-white/5">
        <Container>
          <article className="max-w-3xl mx-auto">
            {post.sections.map((section, i) => (
              <div key={i} className="mb-12 last:mb-0">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, j) => (
                  <p
                    key={j}
                    className="text-white/70 text-lg leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {section.bullets.map((bullet, k) => (
                      <li
                        key={k}
                        className="flex items-start gap-3 text-white/70 leading-relaxed"
                      >
                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gold-500/70 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {post.faq && post.faq.length > 0 && (
              <div className="mt-16 pt-12 border-t border-white/5">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {post.faq.map((item, i) => (
                    <div key={i}>
                      <h3 className="font-heading text-lg font-semibold text-gold-400 mb-2">
                        {item.question}
                      </h3>
                      <p className="text-white/60 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="gold-line mx-auto mb-8" />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            Ready to book your own Dubai yacht charter?
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Browse our owned fleet at Dubai Harbour and get a same-day
            response from our charter team.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/fleet">
              <Ship className="w-5 h-5" />
              View the Fleet
            </Button>
            <Button variant="secondary" size="lg" href={SITE_CONFIG.whatsapp}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 sm:py-20 bg-navy-950 border-t border-white/5">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group block p-6 rounded-xl bg-navy-900/60 border border-white/5 hover:border-gold-500/20 transition-all"
                  >
                    <Badge variant="sea" className="mb-4">
                      {r.category}
                    </Badge>
                    <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold-300 transition-colors leading-snug">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/50 leading-relaxed line-clamp-2">
                      {r.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm text-gold-400 font-medium group-hover:gap-3 transition-all">
                      Read article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
