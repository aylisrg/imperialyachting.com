import { SITE_CONFIG } from "@/lib/constants";
import { getHourlyRate } from "@/lib/pricing";
import { homeFAQ } from "@/data/faq";
import type { Yacht } from "@/types/yacht";
import type { Destination } from "@/types/common";

export interface LlmsExtra {
  name: string;
  price: number;
  unit: string;
}

export interface LlmsInput {
  yachts: Yacht[];
  destinations: Destination[];
  extras?: LlmsExtra[];
}

function yachtFromPrice(yacht: Yacht): string {
  const rate = getHourlyRate(yacht.pricing);
  return rate !== null ? `from AED ${rate.toLocaleString("en-US")}/hr` : "price on request";
}

function fleetLine(yacht: Yacht): string {
  return `- **${yacht.name}** — ${yacht.builder}, ${yacht.length.feet}ft (${yacht.length.meters}m), up to ${yacht.capacity} guests, ${yachtFromPrice(yacht)}. [${SITE_CONFIG.url}/fleet/${yacht.slug}](${SITE_CONFIG.url}/fleet/${yacht.slug})`;
}

function destinationLine(dest: Destination): string {
  const summary = dest.shortDescription || dest.description.slice(0, 140);
  return `- **${dest.name}** — ${summary} [${SITE_CONFIG.url}/destinations/${dest.slug}](${SITE_CONFIG.url}/destinations/${dest.slug})`;
}

const BOOKING_SECTION = `## Booking & Payment

- Deposit: 50% at booking, balance due 48 hours before departure.
- Currency: AED (UAE Dirham).
- Minimum charter duration: 2 hours on weekdays, 4 hours on weekends.
- Promotion: book 4 hours and receive a 5th hour free (4+1 bonus hour).
- Reach us via WhatsApp (${SITE_CONFIG.whatsapp}) or email (${SITE_CONFIG.email}).`;

function aiAgentsSection(): string {
  return `## For AI agents

- Machine-readable booking and fleet data via MCP: ${SITE_CONFIG.url}/api/mcp
- A human-readable guide for AI assistants and agents is available at ${SITE_CONFIG.url}/ai
- This file (llms.txt) follows the llms.txt convention for LLM-friendly site summaries.`;
}

function contactSection(): string {
  return `## Contact

- Phone: ${SITE_CONFIG.phone}
- Email: ${SITE_CONFIG.email}
- WhatsApp: ${SITE_CONFIG.whatsapp}
- Address: ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}
- Departure marina: ${SITE_CONFIG.harbour.name}, ${SITE_CONFIG.harbour.area}, ${SITE_CONFIG.harbour.city}`;
}

function servicesSection(extras?: LlmsExtra[]): string {
  const lines = [
    "## Services",
    "",
    "- Yacht charter (owned fleet, fully crewed, all-inclusive)",
    "- Yacht management",
    "- Cinematography and video production (Cinematographic Bureau)",
    "- Brandwave — marketing and brand experiences aboard",
  ];

  if (extras && extras.length > 0) {
    lines.push("", "Extras and add-ons:");
    for (const extra of extras) {
      lines.push(`- ${extra.name} — AED ${extra.price.toLocaleString("en-US")}/${extra.unit}`);
    }
  }

  return lines.join("\n");
}

/**
 * Builds the concise llms.txt document per the llms.txt convention:
 * H1 site name, one-line blockquote summary, then linked sections.
 */
export function buildLlmsTxt(input: LlmsInput): string {
  const { yachts, destinations, extras } = input;

  const sections = [
    `# ${SITE_CONFIG.name}`,
    "",
    `> ${SITE_CONFIG.description}`,
    "",
    "## Fleet",
    "",
    yachts.length > 0
      ? yachts.map(fleetLine).join("\n")
      : "Fleet information is temporarily unavailable — please contact us directly.",
    "",
    "## Destinations & Experiences",
    "",
    destinations.length > 0
      ? destinations.map(destinationLine).join("\n")
      : "Destination information is temporarily unavailable — please contact us directly.",
    "",
    servicesSection(extras),
    "",
    BOOKING_SECTION,
    "",
    aiAgentsSection(),
    "",
    contactSection(),
    "",
  ];

  return sections.join("\n");
}

function seasonalPricingTable(yacht: Yacht): string {
  if (yacht.pricing.length === 0) return "Pricing on request.";

  const header = "| Season | Period | Hourly | Daily | Weekly | Monthly |";
  const divider = "| --- | --- | --- | --- | --- | --- |";
  const rows = yacht.pricing.map((p) => {
    const fmt = (v: number | null) => (v !== null ? `AED ${v.toLocaleString("en-US")}` : "—");
    return `| ${p.season} | ${p.period} | ${fmt(p.hourly)} | ${fmt(p.daily)} | ${fmt(p.weekly)} | ${fmt(p.monthly)} |`;
  });

  return [header, divider, ...rows].join("\n");
}

function fullFleetSection(yachts: Yacht[]): string {
  if (yachts.length === 0) {
    return "Fleet information is temporarily unavailable — please contact us directly.";
  }

  return yachts
    .map((yacht) => {
      const parts = [
        `### ${yacht.name}`,
        "",
        yacht.description,
        "",
        `- Builder: ${yacht.builder} (${yacht.year})`,
        `- Length: ${yacht.length.feet}ft (${yacht.length.meters}m)`,
        `- Capacity: up to ${yacht.capacity} guests`,
        `- Location: ${yacht.location}`,
        `- Link: ${SITE_CONFIG.url}/fleet/${yacht.slug}`,
        "",
        "**Seasonal pricing:**",
        "",
        seasonalPricingTable(yacht),
      ];

      if (yacht.included.length > 0) {
        parts.push("", "**Included:**", "", yacht.included.map((i) => `- ${i}`).join("\n"));
      }

      if (yacht.amenities.length > 0) {
        parts.push(
          "",
          "**Amenities:**",
          "",
          yacht.amenities.map((a) => `- ${a.label}`).join("\n")
        );
      }

      return parts.join("\n");
    })
    .join("\n\n");
}

function fullDestinationsSection(destinations: Destination[]): string {
  if (destinations.length === 0) {
    return "Destination information is temporarily unavailable — please contact us directly.";
  }

  return destinations
    .map((dest) => {
      const parts = [
        `### ${dest.name}`,
        "",
        dest.description,
        "",
        `- Link: ${SITE_CONFIG.url}/destinations/${dest.slug}`,
      ];

      if (dest.highlights.length > 0) {
        parts.push("", "**Highlights:**", "", dest.highlights.map((h) => `- ${h}`).join("\n"));
      }

      return parts.join("\n");
    })
    .join("\n\n");
}

function faqSection(): string {
  const lines = ["## FAQ", ""];
  for (const item of homeFAQ) {
    lines.push(`**Q: ${item.question}**`, "", `A: ${item.answer}`, "");
  }
  return lines.join("\n");
}

/**
 * Builds the extended llms-full.txt document with full descriptions,
 * pricing tables, amenities, and FAQ content.
 */
export function buildLlmsFullTxt(input: LlmsInput): string {
  const { yachts, destinations, extras } = input;

  const sections = [
    `# ${SITE_CONFIG.name} — Full Reference`,
    "",
    `> ${SITE_CONFIG.description}`,
    "",
    "## Fleet",
    "",
    fullFleetSection(yachts),
    "",
    "## Destinations & Experiences",
    "",
    fullDestinationsSection(destinations),
    "",
    servicesSection(extras),
    "",
    BOOKING_SECTION,
    "",
    faqSection(),
    aiAgentsSection(),
    "",
    contactSection(),
    "",
  ];

  return sections.join("\n");
}
