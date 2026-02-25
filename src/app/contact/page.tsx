import type { Metadata } from "next";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Building2,
  Anchor,
  Star,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema, breadcrumbSchema } from "@/components/seo/schemas";
import { SITE_CONFIG } from "@/lib/constants";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — Book a Yacht Charter in Dubai",
  description:
    "Contact Imperial Yachting for yacht charter bookings, management services, or custom events. Call +971-52-8355939, WhatsApp, or fill out our inquiry form.",
  alternates: { canonical: `${SITE_CONFIG.url}/contact` },
  openGraph: {
    title: "Contact Us | Imperial Yachting",
    description:
      "Book a yacht charter in Dubai. Call, WhatsApp, or send an inquiry to Imperial Yachting.",
    url: `${SITE_CONFIG.url}/contact`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Contact Imperial Yachting" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Imperial Yachting",
    description: "Book a yacht charter in Dubai — call, WhatsApp, or send an inquiry.",
    images: ["/og-image.jpg"],
  },
};

const contactCards = [
  {
    icon: Phone,
    label: "Phone",
    value: SITE_CONFIG.phone,
    href: `tel:${SITE_CONFIG.phone}`,
    description: "Call us directly for immediate assistance",
  },
  {
    icon: Mail,
    label: "Email",
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
    description: "For detailed inquiries and proposals",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: SITE_CONFIG.whatsapp,
    description: "Fastest response — available 7 days a week",
  },
];

const operatingHours = [
  { day: "Sunday \u2013 Thursday", hours: "8:00 AM \u2013 10:00 PM" },
  { day: "Friday \u2013 Saturday", hours: "9:00 AM \u2013 10:00 PM" },
  { day: "Holidays", hours: "By appointment" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact Imperial Yachting", url: "/contact" },
        ])}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sea-500/[0.04] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="gold">Available 7 Days a Week</Badge>
            <h1 className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Get in Touch
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
              Whether you&apos;re planning a sunset cruise, corporate event, or
              long-term charter, our team is ready to craft your perfect
              experience on the water.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left: Contact Form */}
            <div className="lg:col-span-3">
              <SectionHeading
                title="Send Us a Message"
                subtitle="Fill out the form below and we'll get back to you within 24 hours."
              />
              <ContactForm />
            </div>

            {/* Right: Contact Info */}
            <div className="lg:col-span-2">
              <SectionHeading
                title="Contact Information"
                subtitle="Reach us through any of these channels."
              />

              <div className="space-y-4">
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <a
                      key={card.label}
                      href={card.href}
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group block rounded-xl bg-navy-800 border border-white/5 p-5 hover:border-gold-500/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                            {card.label}
                          </p>
                          <p className="text-white font-medium group-hover:text-gold-400 transition-colors">
                            {card.value}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Addresses */}
              <div className="mt-8 space-y-4">
                <div className="rounded-xl bg-navy-800 border border-white/5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sea-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-sea-500" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                        Registered Office
                      </p>
                      <p className="text-white text-sm font-medium">
                        {SITE_CONFIG.address.street}
                      </p>
                      <p className="text-white/50 text-sm">
                        {SITE_CONFIG.address.area},{" "}
                        {SITE_CONFIG.address.city},{" "}
                        {SITE_CONFIG.address.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-navy-800 border border-white/5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sea-500/10 flex items-center justify-center">
                      <Anchor className="w-5 h-5 text-sea-500" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                        Marina / Fleet Location
                      </p>
                      <p className="text-white text-sm font-medium">
                        {SITE_CONFIG.harbour.name}
                      </p>
                      <p className="text-white/50 text-sm">
                        {SITE_CONFIG.harbour.area},{" "}
                        {SITE_CONFIG.harbour.city},{" "}
                        {SITE_CONFIG.harbour.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Google Maps */}
      <section className="bg-navy-950">
        <Container>
          <div className="rounded-2xl bg-navy-800 border border-white/5 overflow-hidden">
            <div className="relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.5!2d55.1386934!3d25.0917604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b0057a49cf9%3A0xbce4e8f21687dc38!2sImperial%20Yachting!5e0!3m2!1sen!2sae!4v1"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Imperial Yachting location on Google Maps"
                className="w-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-950/80 to-transparent px-6 py-4 pointer-events-none">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading font-bold text-white">
                      Dubai Harbour Yacht Club
                    </p>
                    <p className="text-xs text-white/50">
                      Between Palm Jumeirah &amp; Bluewaters Island
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Google Review CTA */}
      <section className="py-16 sm:py-20 bg-navy-900/60">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-7 h-7 text-gold-400 fill-gold-400"
                />
              ))}
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Loved your experience?
            </h2>
            <p className="mt-3 text-white/50 text-base leading-relaxed max-w-md mx-auto">
              Your review helps other guests find us and means everything to our
              crew. It takes less than a minute.
            </p>

            <a
              href={SITE_CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold px-7 py-3.5 text-sm transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Leave a Google Review
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <p className="mt-5 text-xs text-white/25">
              Currently {" "}
              <span className="text-gold-500/70">★ 5.0</span>
              {" "} based on 6 reviews
            </p>
          </div>
        </Container>
      </section>

      {/* Operating Hours */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading
              title="Operating Hours"
              subtitle="Our charter operations and office hours."
              align="center"
            />

            <div className="rounded-2xl bg-navy-800 border border-white/5 overflow-hidden">
              {operatingHours.map((item, index) => (
                <div
                  key={item.day}
                  className={cn(
                    "flex items-center justify-between px-6 py-4",
                    index < operatingHours.length - 1 &&
                      "border-b border-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gold-500/60" />
                    <span className="text-white/70 text-sm font-medium">
                      {item.day}
                    </span>
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-white/40">
              Charter departures are available outside standard hours upon
              request. Contact us for custom scheduling.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

