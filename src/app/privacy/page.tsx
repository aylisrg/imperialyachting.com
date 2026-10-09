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

const lastUpdated = "9 October 2026";

type Table = { head: string[]; rows: string[][] };
type Paragraph = string | Table;

const sections: { title: string; content: Paragraph[] }[] = [
  {
    title: "1. Information We Collect",
    content: [
      `When you interact with ${SITE_CONFIG.name}, we may collect the following types of information:`,
      "Personal Information: Name, email address, phone number, and any other details you voluntarily provide when making an inquiry, booking a charter, or contacting us through our website, WhatsApp, email, or phone.",
      "Booking Information: Charter dates, vessel preferences, number of guests, special requests. Payment is taken by Stripe; we receive a record that the payment was made, not your card details.",
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
      "We use the following third-party services, which collect or process your data on our behalf or as independent controllers:",
      "**Stripe (payments).** All card payments for our services are processed by Stripe. When you pay, you enter your card details directly into Stripe's payment form. **We never receive, see or store your full card number, expiry date or security code.** Stripe receives your name, email address, payment amount, currency, and technical data such as your IP address and device information, and uses them to process the payment, to prevent fraud and to meet its own legal obligations. Stripe acts as an independent controller for these purposes. Its processing is governed by Stripe's own privacy policy at https://stripe.com/privacy.",
      `**Google Analytics (${SITE_CONFIG.googleAnalyticsId}).** We use Google Analytics to understand website traffic and usage patterns. It collects anonymous data including pages visited, time spent on site, and referral sources. This data is processed by Google in accordance with their privacy policy. You can opt out by installing the Google Analytics opt-out browser add-on.`,
      "**WhatsApp Business.** We use WhatsApp for customer communication. Messages sent through WhatsApp are subject to WhatsApp's privacy policy.",
      "We do not sell or rent your personal information. We share it only with the providers named in this policy, and only to the extent needed to deliver the service you asked for or to comply with the law.",
    ],
  },
  {
    title: "5. International Transfers of Your Data",
    content: [
      "We are established in the United Arab Emirates and our own records are kept here. However, some of the providers named in section 4 process data outside the UAE, which means **your personal data leaves the United Arab Emirates.**",
      {
        head: ["Provider", "Purpose", "Where your data goes"],
        rows: [
          ["Stripe", "processing your payment", "United Kingdom, Ireland and other countries where Stripe and its group operate"],
          ["Google", "website analytics", "United States and other countries where Google operates"],
          ["WhatsApp (Meta)", "customer messaging", "United States and other countries where Meta operates"],
        ],
      },
      "The laws of those countries may give your data a different level of protection from the law of the United Arab Emirates. Where a transfer takes place, we rely on the safeguards offered by the provider, including its contractual data-protection terms, and we transfer only the data needed for the stated purpose.",
      "If you would rather your data were not transferred in this way, you can pay by bank transfer instead of by card and contact us by email or telephone instead of WhatsApp. Tell us before you book and we will arrange it.",
    ],
  },
  {
    title: "6. Data Security",
    content: [
      "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by UAE law. Booking records are retained for a minimum of five years for legal and accounting purposes.",
    ],
  },
  {
    title: "8. Your Rights",
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
    title: "9. Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.",
    ],
  },
  {
    title: "10. Contact",
    content: [
      "If you have any questions or concerns about this privacy policy or our data practices, please contact us:",
      `${SITE_CONFIG.legalName}`,
      "Office No4-592, AL KHABEESI BLDG, Al Khabeesi, Deira, Dubai, UAE",
      `Email: ${SITE_CONFIG.email}`,
      `Phone: ${SITE_CONFIG.phone}`,
    ],
  },
];

// **text** in a paragraph is shown bold.
function withBold(text: string) {
  return text.split("**").map((part, i) => (i % 2 ? <strong key={i} className="text-white/80">{part}</strong> : part));
}

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
                    {section.content.map((paragraph, idx) =>
                      typeof paragraph === "string" ? (
                        <p
                          key={idx}
                          className="text-sm text-white/55 leading-relaxed"
                        >
                          {withBold(paragraph)}
                        </p>
                      ) : (
                        <div key={idx} className="overflow-x-auto">
                          <table className="w-full text-sm text-white/55 border-collapse">
                            <thead>
                              <tr>
                                {paragraph.head.map((cell) => (
                                  <th key={cell} className="text-left font-semibold text-white/80 border-b border-white/15 py-2 pr-4">
                                    {cell}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {paragraph.rows.map((row) => (
                                <tr key={row[0]}>
                                  {row.map((cell, c) => (
                                    <td key={c} className="align-top border-b border-white/10 py-2 pr-4 leading-relaxed">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
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
