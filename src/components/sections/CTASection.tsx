import { Phone, Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-800">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sea-500/[0.03] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <Container className="relative z-10 text-center">
        {/* Decorative line */}
        <div className="gold-line mx-auto mb-8" />

        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">
          Ready to Experience Luxury on the Water?
        </h2>

        <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
          Whether it&apos;s a sunset cruise, birthday celebration, or corporate
          event, our team is ready to craft your perfect charter experience.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
            WhatsApp Us
          </Button>
          <Button variant="secondary" size="lg" href="/contact">
            Send Inquiry
          </Button>
        </div>

        {/* Contact details */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
          <a
            href={`tel:${SITE_CONFIG.phone}`}
            className="flex items-center gap-2 hover:text-gold-400 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {SITE_CONFIG.phone}
          </a>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="flex items-center gap-2 hover:text-gold-400 transition-colors"
          >
            <Mail className="w-4 h-4" />
            {SITE_CONFIG.email}
          </a>
        </div>
      </Container>
    </section>
  );
}
