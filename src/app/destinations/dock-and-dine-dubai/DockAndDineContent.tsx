"use client";

import Link from "next/link";
import {
  ChevronRight,
  Anchor,
  MessageCircle,
  Phone,
  MapPin,
  UtensilsCrossed,
  Clock,
  CheckCircle,
  Ship,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_CONFIG } from "@/lib/constants";

interface Marina {
  name: string;
  location: string;
  restaurants: string;
  contact: string;
}

const MARINAS: Marina[] = [
  {
    name: "Al Seef Marina",
    location: "Bur Dubai",
    restaurants: "Historic waterfront restaurants",
    contact: "alseef@d-marin.com, +971 4 521 6694",
  },
  {
    name: "Bulgari Marina",
    location: "Jumeirah Bay",
    restaurants: "Bulgari restaurants (Italian cuisine)",
    contact: "marina.dubai@bulgarihotels.com, +971 52 508 8559",
  },
  {
    name: "Creek Marina Yacht Club",
    location: "Dubai Creek",
    restaurants: "Hyatt restaurants",
    contact: "marina@hyatt.com, +971 4 205 4535",
  },
  {
    name: "Dubai Islands Marina",
    location: "Dubai Islands",
    restaurants: "New dining spots",
    contact: "DMA general: +971 800 8855",
  },
  {
    name: "Dubai Creek Marina",
    location: "Port Saeed, Deira",
    restaurants: "Creek waterfront dining",
    contact: "marina@hyatt.com",
  },
  {
    name: "Dubai Harbour Marinas",
    location: "Dubai Harbour",
    restaurants: "Marsa Al Arab, premium dining",
    contact: "info@dubaiharbour.com, +971 4 208 9222",
  },
  {
    name: "Dubai Marina Yacht Club",
    location: "Dubai Marina",
    restaurants: "550+ berths, numerous restaurants",
    contact: "info@dubaimarinayachtclub.com, +971 4 362 7900",
  },
  {
    name: "Jebel Ali Marina",
    location: "Jebel Ali",
    restaurants: "JA Resorts dining",
    contact: "jamarina@jaresort.com, +971 50 455 6178",
  },
  {
    name: "Jewel of the Creek Marina",
    location: "Dubai Creek",
    restaurants: "Boutique dining",
    contact: "DMA general: +971 800 8855",
  },
  {
    name: "Jumeirah 1 Marina",
    location: "Jumeirah 1",
    restaurants: "P&O waterfront dining",
    contact: "info@pnomarinas.com, +971 4 404 7501",
  },
  {
    name: "Mina Rashid Marina",
    location: "Port Rashid",
    restaurants: "P&O superyachts & restaurants",
    contact: "minarashid.marina@dpworld.com, +971 4 404 7501",
  },
  {
    name: "Marasi Bay Marina",
    location: "Business Bay",
    restaurants: "Marasi waterfront restaurants",
    contact: "businessbay@d-marin.com, +971 4 589 6501",
  },
  {
    name: "Marsa Al Arab Marina",
    location: "Dubai Harbour",
    restaurants: "Jumeirah luxury dining",
    contact: "DMA general: +971 800 8855",
  },
  {
    name: "Palm Azure Jetty",
    location: "Palm Jumeirah West",
    restaurants: "Azure Beach restaurants",
    contact: "palm.marinas@nakheel.com, +971 4 390 3333",
  },
  {
    name: "Palm East Vista Mare Jetty",
    location: "Palm Jumeirah East",
    restaurants: "Vista Mare fine dining",
    contact: "palm.marinas@nakheel.com, +971 4 390 3333",
  },
  {
    name: "Palm Jumeirah Marina",
    location: "Palm Jumeirah",
    restaurants: "536 berths, top restaurants",
    contact: "palm.marinas@nakheel.com",
  },
  {
    name: "Palm West Club Jetty",
    location: "Palm Jumeirah West",
    restaurants: "Club dining",
    contact: "palm.marinas@nakheel.com, +971 4 390 3333",
  },
  {
    name: "Port De La Mer Marina",
    location: "La Mer",
    restaurants: "La Mer beach restaurants",
    contact: "DMA general: +971 800 8855",
  },
  {
    name: "Umm Suqeim 1 Marina",
    location: "Umm Suqeim 1",
    restaurants: "DOSC nearby",
    contact: "info@doscuae.com, +971 4 394 1669",
  },
  {
    name: "Umm Suqeim 2 Marina",
    location: "Umm Suqeim 2",
    restaurants: "Local waterfront dining",
    contact: "info@pnomarinas.com",
  },
];

const BENEFITS = [
  {
    icon: <Ship className="w-5 h-5 text-gold-500" />,
    title: "Free Short-Term Mooring",
    text: "Complimentary berth for up to one hour at any participating marina while you dine.",
  },
  {
    icon: <Clock className="w-5 h-5 text-gold-500" />,
    title: "Quick Reservation",
    text: "Book your mooring slot in as little as 5 minutes, with windows up to 60 minutes before arrival.",
  },
  {
    icon: <Anchor className="w-5 h-5 text-gold-500" />,
    title: "Tender Service Available",
    text: "Tender boats at select marinas to transfer guests from yacht to restaurant jetty.",
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-gold-500" />,
    title: "Standardised Rules",
    text: "Uniform guidelines across all 20 marinas ensure a smooth, hassle-free experience every time.",
  },
  {
    icon: <UtensilsCrossed className="w-5 h-5 text-gold-500" />,
    title: "Michelin-Level Dining",
    text: "Access waterfront restaurants ranging from casual beach clubs to Michelin-starred fine dining.",
  },
  {
    icon: <MapPin className="w-5 h-5 text-gold-500" />,
    title: "Peak Season Ready",
    text: "Designed for Dubai's yacht season (October–April) when demand for waterfront dining is highest.",
  },
];

export function DockAndDineContent() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-navy-950 pt-28 sm:pt-32">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-white/40"
          >
            <Link href="/" className="hover:text-gold-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href="/destinations"
              className="hover:text-gold-400 transition-colors"
            >
              Destinations
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">Dock &amp; Dine Dubai</span>
          </nav>
        </Container>
      </div>

      {/* Hero */}
      <section className="pt-8 pb-12 sm:pb-16 bg-navy-950">
        <Container>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium uppercase tracking-wider">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Yacht Dining Guide
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Dock &amp; Dine Dubai — Free Yacht Mooring at 20 Waterfront
              Marinas
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/50 max-w-3xl leading-relaxed">
              Since September 2025, Dubai offers a first-of-its-kind{" "}
              <strong className="text-white/70">yacht-to-table</strong>{" "}
              experience. The Dock &amp; Dine initiative by Dubai Maritime
              Authority (DMA) and the Department of Economy and Tourism (DET)
              lets yachts moor for free at 20 marinas across the city — so you
              can step off your charter and straight into a waterfront
              restaurant.
            </p>
          </div>
        </Container>
      </section>

      {/* What Is Dock & Dine */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <SectionHeading
            title="What Is the Dock & Dine Initiative?"
            subtitle="A government-backed programme turning Dubai into the world's leading yacht-tourism hub."
          />
          <div className="max-w-3xl mb-12">
            <p className="text-white/70 text-lg leading-relaxed">
              Launched in late August 2025, Dock &amp; Dine simplifies
              short-duration stays at waterfront restaurants. Yacht guests
              receive complimentary mooring for up to one hour, a fast booking
              window of 5–60 minutes, and tender transfers where needed. The
              programme covers 20 marinas and marine stations along Dubai&apos;s
              coastline — from the historic Bur Dubai waterfront to the iconic
              Palm Jumeirah and the new Dubai Islands.
            </p>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              The goal is to integrate world-class dining, including
              Michelin-starred restaurants, into the yacht charter experience —
              positioning Dubai as a global destination for luxury maritime
              tourism.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((benefit, i) => (
              <Reveal key={benefit.title} delay={i * 60}>
                <div className="flex items-start gap-4 p-5 rounded-xl bg-navy-800/50 border border-white/5 h-full">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white text-sm">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-white/50 text-sm leading-relaxed">
                      {benefit.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Marina Table */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <SectionHeading
            title="All 20 Dock & Dine Marinas in Dubai"
            subtitle="The complete directory of participating marinas, waterfront restaurants, and contact details."
          />
          <p className="text-white/60 text-base leading-relaxed max-w-3xl mb-10 -mt-6">
            Every marina listed below participates in the free mooring
            programme. Contact the marina or restaurant directly to confirm
            availability and reserve your slot.
          </p>

          {/* Responsive Table */}
          <Reveal>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead>
                  <tr className="bg-navy-800">
                    <th className="px-4 py-3.5 text-gold-400 uppercase tracking-wider text-xs font-semibold">
                      Marina / Station
                    </th>
                    <th className="px-4 py-3.5 text-gold-400 uppercase tracking-wider text-xs font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-3.5 text-gold-400 uppercase tracking-wider text-xs font-semibold">
                      Key Restaurants &amp; Notes
                    </th>
                    <th className="px-4 py-3.5 text-gold-400 uppercase tracking-wider text-xs font-semibold">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MARINAS.map((marina, i) => (
                    <tr
                      key={marina.name}
                      className={
                        i % 2 === 0 ? "bg-navy-950" : "bg-navy-900/50"
                      }
                    >
                      <td className="px-4 py-3 text-white/80 font-medium whitespace-nowrap">
                        {marina.name}
                      </td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                        {marina.location}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {marina.restaurants}
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">
                        {marina.contact.split(", ").map((part, j) => {
                          const isEmail = part.includes("@");
                          const isPhone = part.startsWith("+");
                          if (isEmail) {
                            return (
                              <span key={j}>
                                {j > 0 && <br />}
                                <a
                                  href={`mailto:${part}`}
                                  className="text-gold-400/80 hover:text-gold-400 transition-colors"
                                >
                                  {part}
                                </a>
                              </span>
                            );
                          }
                          if (isPhone) {
                            return (
                              <span key={j}>
                                {j > 0 && <br />}
                                <a
                                  href={`tel:${part.replace(/\s/g, "")}`}
                                  className="text-gold-400/80 hover:text-gold-400 transition-colors"
                                >
                                  {part}
                                </a>
                              </span>
                            );
                          }
                          return (
                            <span key={j}>
                              {j > 0 && <br />}
                              {part}
                            </span>
                          );
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* How to Use */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <SectionHeading
            title="How to Use Dock & Dine"
            subtitle="Three simple steps from yacht to table."
          />
          <div className="max-w-2xl space-y-6">
            {[
              {
                step: 1,
                title: "Contact the Marina or Restaurant",
                text: "Call or message the marina directly (see contacts above) or reach the restaurant to confirm a mooring slot. Booking windows range from 5 to 60 minutes.",
              },
              {
                step: 2,
                title: "Moor at the Designated Berth",
                text: "Arrive at the participating marina and dock at the allocated berth. Mooring is complimentary for up to one hour. Tender boats are available at select locations for guest transfer.",
              },
              {
                step: 3,
                title: "Dine & Depart",
                text: "Walk straight into the waterfront restaurant, enjoy your meal, and return to your yacht. For questions about regulations or marina rules, call the DMA Coastguard line at +971 800 8855.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 80}>
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center">
                    <span className="text-sm font-heading font-bold text-gold-400">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-white/60 text-sm leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-xl bg-navy-800/60 border border-white/5 px-6 py-4 max-w-2xl">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-gold-400" />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              <span className="text-white/80 font-medium">
                DMA General Contact:
              </span>{" "}
              <a
                href="tel:+9718008855"
                className="text-gold-400/80 hover:text-gold-400 transition-colors"
              >
                +971 800 8855
              </a>{" "}
              (Coastguard / Marine Operations) for questions about mooring
              regulations and the Dock &amp; Dine programme.
            </p>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="gold-line mx-auto mb-8" />
          <Anchor
            className="w-8 h-8 text-gold-500/40 mx-auto mb-6"
            strokeWidth={1.5}
          />

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            Book a Yacht for Your Dock &amp; Dine Experience
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Charter one of our luxury yachts from Dubai Harbour and cruise to
            any of the 20 Dock &amp; Dine marinas. We&apos;ll handle the route,
            the mooring, and the reservation — you just enjoy the meal.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/fleet">
              View Our Fleet
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              <Phone className="w-5 h-5" />
              Send Inquiry
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
