"use client";

import Link from "next/link";
import { RefreshCw, Phone, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/lib/constants";

export default function FleetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 min-h-[60vh] flex items-center">
      <div className="absolute inset-0 bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Fleet Temporarily Unavailable
          </h1>
          <p className="mt-4 text-lg text-white/60 leading-relaxed">
            We&apos;re having trouble loading our fleet right now. This is
            usually a temporary issue — please try again in a moment.
          </p>

          {process.env.NODE_ENV === "development" && (
            <pre className="mt-6 p-4 bg-red-950/50 border border-red-500/20 rounded-lg text-left text-sm text-red-300 overflow-auto max-h-40">
              {error.message}
            </pre>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <Button variant="secondary" size="lg" href={SITE_CONFIG.whatsapp}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              <Phone className="w-5 h-5" />
              Contact Us
            </Button>
          </div>

          <p className="mt-8 text-sm text-white/30">
            If the problem persists, please{" "}
            <Link href="/contact" className="text-gold-400 hover:text-gold-300 underline">
              contact our team
            </Link>{" "}
            directly.
          </p>
        </div>
      </Container>
    </section>
  );
}
