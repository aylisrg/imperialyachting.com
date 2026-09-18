import type { McpServer } from "@modelcontextprotocol/server";
import { SITE_CONFIG } from "@/lib/constants";
import { termsSections, termsLastUpdated } from "@/data/terms";
import { homeFAQ, fleetFAQ, charterFAQ, managementFAQ } from "@/data/faq";
import type { FAQItem } from "@/types/common";

function renderTermsMarkdown(): string {
  const lines: string[] = [
    "# Terms of Service",
    "",
    `_Last updated: ${termsLastUpdated}_`,
    "",
  ];
  for (const section of termsSections) {
    lines.push(`## ${section.title}`, "");
    for (const paragraph of section.content) {
      lines.push(paragraph, "");
    }
  }
  return lines.join("\n").trim() + "\n";
}

function companyInfo() {
  return {
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    license: SITE_CONFIG.license,
    address: SITE_CONFIG.address,
    harbour: SITE_CONFIG.harbour,
    phone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    whatsapp: SITE_CONFIG.whatsapp,
    url: SITE_CONFIG.url,
    socials: {
      instagram: SITE_CONFIG.instagram,
      youtube: SITE_CONFIG.youtube,
    },
  };
}

function renderFaqMarkdown(): string {
  const groups: [string, FAQItem[]][] = [
    ["General", homeFAQ],
    ["Fleet", fleetFAQ],
    ["Charter", charterFAQ],
    ["Yacht Management", managementFAQ],
  ];

  const lines: string[] = ["# Frequently Asked Questions", ""];
  for (const [heading, items] of groups) {
    if (items.length === 0) continue;
    lines.push(`## ${heading}`, "");
    for (const item of items) {
      lines.push(`**Q: ${item.question}**`, "", item.answer, "");
    }
  }
  return lines.join("\n").trim() + "\n";
}

/**
 * Registers the read-only reference resources: terms of service, company
 * info, and FAQ. These are static/derived content, not DB-backed, so no
 * sanitization is applied — they are first-party copy, not user input.
 */
export function registerImperialResources(server: McpServer): void {
  server.registerResource(
    "terms",
    "imperial://terms",
    {
      title: "Terms of Service",
      description:
        "Imperial Yachting's charter Terms of Service: booking & cancellation policy, liability, payment terms, and conduct rules.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: renderTermsMarkdown(),
        },
      ],
    })
  );

  server.registerResource(
    "company",
    "imperial://company",
    {
      title: "Company Information",
      description:
        "Imperial Yachting's legal name, trade licence, address, harbour, and contact details, as JSON.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(companyInfo(), null, 2),
        },
      ],
    })
  );

  server.registerResource(
    "faq",
    "imperial://faq",
    {
      title: "Frequently Asked Questions",
      description:
        "Common questions and answers about Imperial Yachting charters, the fleet, and yacht management, as markdown.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: renderFaqMarkdown(),
        },
      ],
    })
  );
}
