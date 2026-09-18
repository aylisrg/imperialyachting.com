import type { Metadata } from "next";
import Link from "next/link";
import {
  Anchor,
  Ban,
  Bot,
  CalendarCheck,
  CreditCard,
  FileJson,
  KeyRound,
  ListChecks,
  Lock,
  MessageSquare,
  Plug,
  Ship,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/components/seo/schemas";
import { SITE_CONFIG } from "@/lib/constants";
import { CopyButton } from "./CopyButton";
import type { FAQItem } from "@/types/common";

const MCP_URL = `${SITE_CONFIG.url}/api/mcp`;

export const metadata: Metadata = {
  title: "Book with AI — ChatGPT, Claude & Perplexity connector",
  description:
    "Connect Imperial Yachting's live MCP server to ChatGPT, Claude, Perplexity, or any MCP client. Browse the fleet, check availability, build a quote, and get a secure Stripe deposit link — no login required.",
  alternates: { canonical: `${SITE_CONFIG.url}/ai` },
  openGraph: {
    title: "Book a Dubai Yacht Charter with AI | Imperial Yachting",
    description:
      "A live MCP connector for ChatGPT, Claude and Perplexity — browse the fleet, check dates, and get a secure payment link, directly in your chat.",
    url: `${SITE_CONFIG.url}/ai`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Book with AI — Imperial Yachting" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Dubai Yacht Charter with AI | Imperial Yachting",
    description:
      "Connect ChatGPT, Claude or Perplexity to Imperial Yachting's live MCP connector and book from your chat.",
    images: ["/og-image.jpg"],
  },
};

const capabilities = [
  {
    icon: Ship,
    title: "Browse the fleet with real prices",
    description:
      "List every yacht with capacity, specs, and hourly/daily rates by season — pulled live from our database, not a static description.",
  },
  {
    icon: CalendarCheck,
    title: "Check availability on a date",
    description:
      "Ask for a specific date and time window; the assistant checks it against our real booking calendar and suggests open slots.",
  },
  {
    icon: ListChecks,
    title: "Build a quote with extras",
    description:
      "Mention catering, decor, a photographer, DJ, or jet ski, and the assistant assembles a full itemised quote including the 50% deposit.",
  },
  {
    icon: CreditCard,
    title: "Get a secure payment link",
    description:
      "Once you're ready, the assistant generates a hosted Stripe Checkout link for the deposit — we never see or store your card details.",
  },
  {
    icon: MessageSquare,
    title: "Check booking status",
    description:
      "Ask \"did my deposit go through?\" and the assistant can look up the booking status directly.",
  },
] as const;

const examplePrompts = [
  "Find me a yacht for 12 guests in Dubai next Friday afternoon, budget around AED 3,500/hour.",
  "Is the Monte Carlo 6 available on the 20th of next month from 2pm to 6pm?",
  "Put together a quote for a birthday cruise: 4 hours, 10 guests, add catering and a photographer.",
  "What's included in the hourly rate, and how much is the deposit?",
  "I'd like to book — send me a payment link for the deposit.",
] as const;

const chatgptSteps = [
  "Open ChatGPT and go to Settings.",
  "Find Connectors (sometimes under an \"Advanced\" or \"Developer mode\" section — menu names vary by plan and version).",
  "Choose to add or create a new connector, then paste the MCP URL below.",
  "No authentication is needed — leave any auth field set to none/no auth.",
  "Start a new chat and ask it to find you a yacht in Dubai.",
];

const claudeSteps = [
  "On claude.ai (or Claude Desktop), open Settings → Connectors.",
  "Choose \"Add custom connector\" (sometimes listed as \"Add more\").",
  "Give it a name, e.g. \"Imperial Yachting\", and paste the MCP URL below.",
  "Leave authentication as none — the read-only tools are public.",
  "Enable the connector for your chat and start asking about the fleet.",
];

const perplexitySteps = [
  "In Perplexity, open Settings → Connectors (available on Pro/Max plans).",
  "Choose to add a connector and select \"Streamable HTTP\" as the transport.",
  "Paste the MCP URL below as the connector's URL.",
  "Save, then ask Perplexity to look up yacht availability in Dubai.",
];

const cursorSnippet = `{
  "mcpServers": {
    "imperial-yachting": {
      "url": "${MCP_URL}"
    }
  }
}`;

const mcpRemoteSnippet = `{
  "mcpServers": {
    "imperial-yachting": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${MCP_URL}"]
    }
  }
}`;

const paymentSteps = [
  {
    title: "1. Quote",
    description: "The assistant builds an itemised quote and holds the price for 30 minutes.",
  },
  {
    title: "2. Checkout link",
    description: "It generates a secure, hosted Stripe Checkout link — no card details ever pass through the chat or our servers.",
  },
  {
    title: "3. 50% deposit",
    description: "You pay a 50% deposit on Stripe's page to confirm the booking. A confirmation email follows immediately.",
  },
  {
    title: "4. Balance",
    description: "The remaining balance is requested 48 hours before departure, by a separate secure link.",
  },
];

export const aiFaq: FAQItem[] = [
  {
    question: "Do I need an account or API key to use this?",
    answer:
      "No. Imperial Yachting's MCP connector is public and read-only for browsing — no login, API key, or account is required to look up the fleet, destinations, or availability.",
  },
  {
    question: "Is it safe to pay through a link my AI assistant gives me?",
    answer:
      "The payment link points to Stripe's own hosted Checkout page (checkout.stripe.com), the same secure payment processor used across our website. We never see or store your card details, and the assistant never asks for them directly.",
  },
  {
    question: "What information does the assistant send to Imperial Yachting?",
    answer:
      "Only what's needed to build a quote or booking: your preferred dates, guest count, and — once you choose to book — the name, email, and phone number you provide for the reservation. We don't receive your chat history or anything else from your AI assistant.",
  },
  {
    question: "Which AI assistants can connect to this?",
    answer:
      "Any client that supports the Model Context Protocol (MCP) over Streamable HTTP, including ChatGPT, Claude (web, desktop, and mobile), Perplexity, and developer tools like Cursor. Setup steps for each are on this page.",
  },
  {
    question: "Can the assistant actually complete a booking on its own?",
    answer:
      "It can build the quote and generate a secure payment link, but the booking is only confirmed once you pay the deposit yourself on Stripe's page — the assistant cannot charge you.",
  },
  {
    question: "Is there a limit to how many requests the connector accepts?",
    answer:
      "Yes, the connector is rate-limited per IP address to keep the service reliable for everyone. Normal use — browsing the fleet, checking a few dates, building a quote — is well within the limit.",
  },
];

export default function AiPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Book with AI", url: "/ai" },
        ])}
      />
      <JsonLd data={faqSchema(aiFaq)} />

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-sea-500/[0.06] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-500/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <Badge variant="gold">
            <Bot className="mr-1.5 inline h-3.5 w-3.5" />
            AI Connector
          </Badge>

          <h1 className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto">
            Plan and book your Dubai yacht charter{" "}
            <span className="text-gold-gradient">through your AI assistant</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Imperial Yachting runs a live connector for ChatGPT, Claude, and
            Perplexity. Your assistant can browse our real fleet, check
            availability, build a quote, and hand you a secure payment
            link — right inside your chat.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              <code className="flex-1 overflow-x-auto whitespace-nowrap px-3 py-2 text-left text-sm text-gold-300 font-mono">
                {MCP_URL}
              </code>
              <CopyButton value={MCP_URL} label="Copy URL" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="sea">No login required</Badge>
            <Badge variant="sea">Secure Stripe payment</Badge>
            <Badge variant="white">MCP 2026-07-28</Badge>
          </div>
        </Container>
      </section>

      {/* What the assistant can do */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="What the assistant can do"
            subtitle="The connector exposes real, live tools — every answer reflects our current fleet, prices, and calendar."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="glass-card rounded-2xl p-6 sm:p-8 hover:border-gold-500/30 transition-all duration-500"
                >
                  <div className="mx-auto sm:mx-0 w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-white/40 max-w-2xl mx-auto">
            Booking tools (checking availability, building a quote, creating
            a checkout link, and looking up a booking) are being finalised
            and will light up on this same connector — no reconnection
            needed once they ship.
          </p>
        </Container>
      </section>

      {/* Setup steps */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Connect your assistant"
            subtitle="Setup takes under a minute. Menu names may differ slightly by plan or app version."
            align="center"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SetupCard icon={Bot} title="ChatGPT" steps={chatgptSteps} />
            <SetupCard icon={Sparkles} title="Claude (web & desktop)" steps={claudeSteps} />
            <SetupCard icon={Plug} title="Perplexity" steps={perplexitySteps} />
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5 text-gold-400" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Cursor & other MCP clients
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                Add this to your client&apos;s MCP configuration file:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-black/40 border border-white/10 p-4 text-xs text-gold-300 font-mono">
                {cursorSnippet}
              </pre>
            </div>
          </div>

          <div className="mt-6 glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <FileJson className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">
                Stdio-only clients (via mcp-remote)
              </h3>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              If your MCP client only speaks stdio and can&apos;t connect to
              a Streamable HTTP URL directly, bridge it with{" "}
              <code className="text-gold-300 font-mono text-xs">mcp-remote</code>:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-black/40 border border-white/10 p-4 text-xs text-gold-300 font-mono">
              {mcpRemoteSnippet}
            </pre>
          </div>
        </Container>
      </section>

      {/* Example prompts */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Try asking your assistant"
            subtitle="Once connected, plain-language questions like these work directly."
            align="center"
          />

          <div className="max-w-3xl mx-auto space-y-4">
            {examplePrompts.map((prompt) => (
              <div
                key={prompt}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5"
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gold-500/70" />
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  &ldquo;{prompt}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How payment works */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="How payment works"
            subtitle="Your assistant never handles your card. Every payment happens on Stripe's own secure page."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentSteps.map((step) => (
              <div
                key={step.title}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <h3 className="font-heading text-base font-bold text-gold-400">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-white/40">
            <Lock className="h-4 w-4 shrink-0 text-gold-500/60" />
            We never see or store your card details — payment is processed
            entirely by Stripe.
          </p>
        </Container>
      </section>

      {/* Privacy & safety */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Privacy & safety"
            align="center"
          />

          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-5 w-5 text-gold-400" />
                <h3 className="font-heading text-base font-bold text-white">
                  What data is shared
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Only the details needed to plan or book a charter: your
                preferred dates and guest count, and — only once you choose
                to book — the name, email, and phone number you give for the
                reservation. Nothing else from your conversation reaches us.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <Ban className="h-5 w-5 text-gold-400" />
                <h3 className="font-heading text-base font-bold text-white">
                  Rate limits
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                The connector is rate-limited per IP address to keep it
                reliable for everyone. Normal browsing and quoting stays
                well within the limit.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <KeyRound className="h-5 w-5 text-gold-400" />
                <h3 className="font-heading text-base font-bold text-white">
                  No account, no auth
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Read-only tools are public by design, so anyone can browse
                the fleet with no sign-up. Payment is still gated behind
                Stripe&apos;s own hosted checkout.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <Anchor className="h-5 w-5 text-gold-400" />
                <h3 className="font-heading text-base font-bold text-white">
                  Terms & contact
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Bookings made through the connector follow the same{" "}
                <Link href="/terms" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                  Terms of Service
                </Link>{" "}
                as the website. Questions? Reach us at{" "}
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  {SITE_CONFIG.email}
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading title="Frequently asked questions" align="center" />
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={aiFaq} />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container className="text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Prefer to browse it yourself?
          </h2>
          <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
            View the full fleet on our site, or reach our team directly on
            WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/fleet">
              View Fleet
            </Button>
            <Button variant="secondary" size="lg" href={SITE_CONFIG.whatsapp}>
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

interface SetupCardProps {
  icon: typeof Bot;
  title: string;
  steps: readonly string[];
}

function SetupCard({ icon: Icon, title, steps }: SetupCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-gold-400" />
        </div>
        <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
      </div>
      <ol className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
            <span className="shrink-0 font-heading text-gold-500/70">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
