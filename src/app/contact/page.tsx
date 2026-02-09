import type { Metadata } from "next";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Building2,
  Anchor,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema } from "@/components/seo/schemas";
import { SITE_CONFIG } from "@/lib/constants";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Imperial Yachting for yacht charter inquiries, management services, and custom event bookings. Reach us by phone, email, or WhatsApp.",
  openGraph: {
    title: "Contact Us | Imperial Yachting",
    description:
      "Get in touch with Imperial Yachting for yacht charter inquiries, management services, and custom event bookings.",
    url: `${SITE_CONFIG.url}/contact`,
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

      {/* Map Placeholder */}
      <section className="bg-navy-950">
        <Container>
          <div className="rounded-2xl bg-navy-800 border border-white/5 overflow-hidden">
            <div className="aspect-[21/9] sm:aspect-[3/1] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-800 relative">
              <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }} />
              <div className="relative z-10 text-center">
                <MapPin className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                <h3 className="font-heading text-xl font-bold text-white">
                  Dubai Harbour Yacht Club
                </h3>
                <p className="mt-2 text-sm text-white/40">
                  25.0805&deg; N, 55.1403&deg; E
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Between Palm Jumeirah &amp; Bluewaters Island
                </p>
              </div>
            </div>
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

