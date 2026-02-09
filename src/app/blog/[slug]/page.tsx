import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Article Coming Soon",
  description:
    "This article is coming soon. Stay tuned for expert yachting guides and insights from Imperial Yachting.",
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return [];
}

export default function BlogPostPage() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sea-500/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <Container className="relative z-10 py-32 text-center">
        <BookOpen
          className="w-12 h-12 text-gold-500/40 mx-auto mb-6"
          strokeWidth={1.5}
        />

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Article Coming Soon
        </h1>

        <p className="mt-4 text-lg text-white/50 max-w-md mx-auto leading-relaxed">
          We&apos;re crafting this article with the same care we put into every
          charter experience. Check back soon.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" href="/blog">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Button>
          <Button variant="secondary" size="lg" href="/contact">
            Contact Us
          </Button>
        </div>

        <p className="mt-12 text-sm text-white/30">
          Questions? Reach us at{" "}
          <Link
            href={`mailto:${SITE_CONFIG.email}`}
            className="text-gold-400/60 hover:text-gold-400 transition-colors"
          >
            {SITE_CONFIG.email}
          </Link>
        </p>
      </Container>
    </section>
  );
}
