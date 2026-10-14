import type { Metadata } from "next";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeSection, WakeSplitTitle } from "@/components/wake/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema, breadcrumbSchema, contactPageSchema } from "@/components/seo/schemas";
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
    label: "Phone",
    value: SITE_CONFIG.phone,
    href: `tel:${SITE_CONFIG.phone}`,
    description: "Call us directly for immediate assistance",
  },
  {
    label: "Email",
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
    description: "For detailed inquiries and proposals",
  },
  {
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
      <JsonLd data={contactPageSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact Imperial Yachting", url: "/contact" },
        ])}
      />

      <WakePage>
        <WakeHero
          clip="harbour-sunset"
          alt="Dubai Harbour at sunset"
          crumb="Home / Contact"
          title={<>Get in<br />touch.</>}
          lead="Whether you're planning a sunset cruise, corporate event, or long-term charter, our team is ready to craft your perfect experience on the water."
        >
          <p className="cap note">Available 7 Days a Week</p>
        </WakeHero>

        <WakeSection>
          <WakeHead title={<>Contact<br />information.</>}>Reach us through any of these channels.</WakeHead>
          <div className="w-chans">
            {contactCards.map((card, i) => (
              <a
                key={card.label}
                className="w-chan"
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <span className="ix">{String(i + 1).padStart(2, "0")}</span>
                <span className="cap" style={{ color: "var(--copper)" }}>{card.label}</span>
                <b className="serif">{card.value}</b>
                <span className="d">{card.description}</span>
              </a>
            ))}
          </div>
        </WakeSection>

        <WakeSection>
          <div className="w-split">
            <WakeSplitTitle ix="01" title={<>Send us a<br />message.</>}>
              <p>Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
            </WakeSplitTitle>
            <div className="iyh-legacy w-form">
              <ContactForm />
            </div>
          </div>
        </WakeSection>

        <WakeSection tone="sand">
          <div className="w-split">
            <div className="w-facts">
              <div>
                <span className="cap">Registered Office</span>
                <b>{SITE_CONFIG.address.street}</b>
                <p>{SITE_CONFIG.address.area}, {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}</p>
              </div>
              <div>
                <span className="cap">Marina / Fleet Location</span>
                <b>{SITE_CONFIG.harbour.name}</b>
                <p>{SITE_CONFIG.harbour.area}, {SITE_CONFIG.harbour.city}, {SITE_CONFIG.harbour.country}</p>
              </div>
            </div>
            <div className="w-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.5!2d55.1386934!3d25.0917604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b0057a49cf9%3A0xbce4e8f21687dc38!2sImperial%20Yachting!5e0!3m2!1sen!2sae!4v1"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Imperial Yachting location on Google Maps"
              />
              <p className="cap">Dubai Harbour Yacht Club &nbsp;·&nbsp; Between Palm Jumeirah &amp; Bluewaters Island</p>
            </div>
          </div>
        </WakeSection>

        <WakeSection tone="light">
          <div className="w-split">
            <WakeSplitTitle ix="02" title={<>Operating<br />hours.</>}>
              <p>Our charter operations and office hours.</p>
            </WakeSplitTitle>
            <div>
              <ul className="w-list">
                {operatingHours.map((item) => (
                  <li key={item.day} style={{ justifyContent: "space-between" }}><span>{item.day}</span><b style={{ fontWeight: 500 }}>{item.hours}</b></li>
                ))}
              </ul>
              <p style={{ marginTop: 24 }}>
                Charter departures are available outside standard hours upon request. Contact us for custom scheduling.
              </p>
            </div>
          </div>
        </WakeSection>

        <WakeCta clip="vd40-aerial" alt="Van Dutch 40 from above" title={<>Loved your<br />experience?</>}>
          <a className="btn" href={SITE_CONFIG.googleReviewUrl} target="_blank" rel="noopener noreferrer">Leave a Google Review ↗</a>
          <p className="sub">
            Your review helps other guests find us and means everything to our crew. It takes less than a minute.
          </p>
          <p className="contacts cap">Currently ★ 5.0 based on 6 reviews</p>
        </WakeCta>
      </WakePage>
    </>
  );
}

