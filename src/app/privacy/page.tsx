import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_CONFIG.name}. Learn how we collect, use, and protect your personal information.`,
  openGraph: {
    title: `Privacy Policy | ${SITE_CONFIG.name}`,
    description: `Privacy policy for ${SITE_CONFIG.name}. Learn how we collect, use, and protect your personal information.`,
    url: `${SITE_CONFIG.url}/privacy`,
  },
};

const lastUpdated = "1 January 2025";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      `When you interact with ${SITE_CONFIG.name}, we may collect the following types of information:`,
      "Personal Information: Name, email address, phone number, and any other details you voluntarily provide when making an inquiry, booking a charter, or contacting us through our website, WhatsApp, email, or phone.",
      "Booking Information: Charter dates, vessel preferences, number of guests, special requests, and payment details necessary to process your reservation.",
      "Technical Information: IP address, browser type and version, device information, operating system, referral source, pages visited, and duration of visits. This data is collected automatically through cookies and analytics tools.",
      "Communication Data: Records of correspondence when you contact us, including emails, WhatsApp messages, and contact form submissions.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "We use the information we collect for the following purposes:",
      "Charter Services: To process bookings, manage reservations, communicate charter details, and provide customer support related to your yacht experience.",
      "Communication: To respond to your inquiries, send booking confirmations, provide pre-charter information, and follow up on your experience.",
      "Service Improvement: To understand how visitors use our website, improve our services, and enhance the user experience.",
      "Marketing: With your consent, to send occasional updates about our fleet, seasonal offers, and new services. You may opt out at any time.",
      "Legal Compliance: To comply with applicable UAE laws and regulations, and to protect our legal rights and interests.",
    ],
  },
  {
    title: "3. Cookies",
    content: [
      "Our website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us understand how you interact with our website.",
      "Essential Cookies: Required for the website to function properly, including session management and security features.",
      "Analytics Cookies: Used to collect anonymous data about website usage, helping us understand visitor behavior and improve our content and services.",
      "You can control cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.",
    ],
  },
  {
    title: "4. Third-Party Services",
    content: [
      `We use the following third-party services that may collect and process your data:`,
      `Google Analytics (${SITE_CONFIG.googleAnalyticsId}): We use Google Analytics to understand website traffic and usage patterns. Google Analytics collects anonymous data including pages visited, time spent on site, and referral sources. This data is processed by Google in accordance with their privacy policy. You can opt out of Google Analytics by installing the Google Analytics opt-out browser add-on.`,
      "WhatsApp Business: We use WhatsApp for customer communication. Messages sent through WhatsApp are subject to WhatsApp's privacy policy.",
      "We do not sell, trade, or otherwise transfer your personal information to outside parties beyond what is described in this policy.",
    ],
  },
  {
    title: "5. Data Security",
    content: [
      "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Data Retention",
    content: [
      "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by UAE law. Booking records are retained for a minimum of five years for legal and accounting purposes.",
    ],
  },
  {
    title: "7. Your Rights",
    content: [
      "You have the right to:",
      "Access the personal information we hold about you.",
      "Request correction of inaccurate or incomplete data.",
      "Request deletion of your personal information, subject to legal requirements.",
      "Withdraw consent for marketing communications at any time.",
      "To exercise any of these rights, please contact us using the details provided below.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.",
    ],
  },
  {
    title: "9. Contact",
    content: [
      "If you have any questions or concerns about this privacy policy or our data practices, please contact us:",
      `${SITE_CONFIG.legalName}`,
      `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}`,
      `Email: ${SITE_CONFIG.email}`,
      `Phone: ${SITE_CONFIG.phone}`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="gold-line mb-8" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="mt-4 text-white/40 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <div className="max-w-3xl">
            <p className="text-white/60 leading-relaxed mb-12">
              {SITE_CONFIG.legalName} (&quot;we&quot;, &quot;our&quot;, or
              &quot;us&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website at{" "}
              <a
                href={SITE_CONFIG.url}
                className="text-gold-400/70 hover:text-gold-400 transition-colors"
              >
                {SITE_CONFIG.url}
              </a>{" "}
              or engage with our services.
            </p>

            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-white/55 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
