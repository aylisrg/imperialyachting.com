"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Anchor,
  MessageCircle,
  Phone,
  LandPlot,
  Target,
  Leaf,
  Droplets,
  Waves,
  Camera,
  Users,
  Ship,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_CONFIG } from "@/lib/constants";
import { GOLF_FAQ } from "./golf-faq";

// Once the golf video is live on the @imperial_wave channel,
// set the YouTube video ID here to show the embed section.
const GOLF_VIDEO_ID = "";

// Photos are expected at these paths (see public/media/destinations/golf/README.md).
// Images that are not uploaded yet hide themselves automatically.
const GALLERY = [
  { src: "/media/destinations/golf/hero.jpg", alt: "Teeing off from the yacht's stern platform at sea" },
  { src: "/media/destinations/golf/platform.jpg", alt: "Golf platform on the yacht" },
  { src: "/media/destinations/golf/green.jpg", alt: "Floating green target on the open sea" },
  { src: "/media/destinations/golf/swing.jpg", alt: "Guest swinging a golf club on board" },
  { src: "/media/destinations/golf/balls.jpg", alt: "Water-soluble eco golf balls" },
  { src: "/media/destinations/golf/sunset.jpg", alt: "Golf at sea during sunset" },
];

const BENEFITS = [
  {
    icon: <LandPlot className="w-5 h-5 text-gold-500" />,
    title: "Only Golf at Sea in Dubai",
    text: "A driving range no golf club can offer — teeing off from a luxury yacht into the open Arabian Gulf.",
  },
  {
    icon: <Leaf className="w-5 h-5 text-gold-500" />,
    title: "Zero Ocean Impact",
    text: "Eco balls are biodegradable and fully dissolve in seawater — the experience leaves no trace behind.",
  },
  {
    icon: <Target className="w-5 h-5 text-gold-500" />,
    title: "Floating Green Target",
    text: "A real floating green gives every drive a goal. Closest to the pin wins the round of drinks.",
  },
  {
    icon: <Users className="w-5 h-5 text-gold-500" />,
    title: "Perfect Group Entertainment",
    text: "From corporate charters to birthdays — a long-drive contest at sea gets every guest involved.",
  },
  {
    icon: <Camera className="w-5 h-5 text-gold-500" />,
    title: "Unforgettable Content",
    text: "A golf swing on a yacht platform with the Dubai skyline behind you — the shot everyone asks about.",
  },
  {
    icon: <Ship className="w-5 h-5 text-gold-500" />,
    title: "Purpose-Built Platforms",
    text: "Van Dutch 40 and Monte Carlo 6 feature wide, stable stern platforms — a natural tee box on the water.",
  },
];

const STEPS = [
  {
    step: 1,
    title: "Cruise to Open Water",
    text: "Depart Dubai Harbour and cruise 20–30 minutes past Palm Jumeirah into calm open water, where the crew drops anchor.",
  },
  {
    step: 2,
    title: "Crew Sets Up Your Range",
    text: "The floating green goes onto the water, the platform is prepared, and every guest gets a quick swing and safety briefing.",
  },
  {
    step: 3,
    title: "Tee Off Into the Gulf",
    text: "24 eco balls per session — take turns, aim for the green, and crown a champion. The balls dissolve in seawater, leaving zero trace.",
  },
];

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-navy-800/50">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setHidden(true)}
      />
    </div>
  );
}

function Gallery() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {GALLERY.map((img) => (
        <GalleryImage key={img.src} src={img.src} alt={img.alt} />
      ))}
    </div>
  );
}

export function GolfOnTheYachtContent() {
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
            <span className="text-white/70">Golf on the Yacht</span>
          </nav>
        </Container>
      </div>

      {/* Hero */}
      <section className="pt-8 pb-12 sm:pb-16 bg-navy-950">
        <Container>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium uppercase tracking-wider">
                <LandPlot className="w-3.5 h-3.5" />
                Signature Experience
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Golf on the Yacht — Tee Off Into the Open Sea
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/50 max-w-3xl leading-relaxed">
              Dubai&apos;s only golf-at-sea experience. Step onto the stern
              platform of a{" "}
              <strong className="text-white/70">Van Dutch 40</strong> or{" "}
              <strong className="text-white/70">Monte Carlo 6</strong>, take
              your stance with the skyline behind you, and drive at a floating
              green on the open water — with special eco golf balls that{" "}
              <strong className="text-white/70">
                fully dissolve in seawater
              </strong>
              , leaving zero trace in the Gulf.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
                <MessageCircle className="w-5 h-5" />
                Add Golf to My Charter
              </Button>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-gold-400">
                  AED 750
                </span>
                <span className="text-sm text-white/40">
                  per session · add-on to any charter
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <SectionHeading
            title="How It Works"
            subtitle="From marina to your first drive in under half an hour."
          />
          <div className="max-w-2xl space-y-6">
            {STEPS.map((item, i) => (
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

          {/* Eco callout */}
          <div className="mt-10 flex items-center gap-4 rounded-xl bg-navy-800/60 border border-gold-500/15 px-6 py-4 max-w-2xl">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5 text-gold-400" />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              <span className="text-white/80 font-medium">
                Why it&apos;s ocean-safe:
              </span>{" "}
              our eco golf balls are made from biodegradable, non-toxic
              material that dissolves completely in seawater. No plastic, no
              debris — just the swing and the horizon.
            </p>
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <SectionHeading
            title="Why Golf at Sea"
            subtitle="A private driving range with the best view in Dubai."
          />
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

      {/* Pricing */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <SectionHeading
            title="The Golf Set & Pricing"
            subtitle="One transparent price — the crew takes care of everything else."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            {/* Main package */}
            <Reveal>
              <div className="rounded-2xl bg-navy-800/60 border border-gold-500/20 p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <LandPlot className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Golf on the Yacht
                  </h3>
                </div>
                <div className="mb-6">
                  <span className="font-heading text-4xl font-bold text-white">
                    AED 750
                  </span>
                  <span className="text-sm text-white/40 ml-2">
                    per session
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    "Premium golf club on board",
                    "Floating green target on the water",
                    "24 water-soluble eco golf balls",
                    "Swing & safety briefing",
                    "Full setup and pack-down by the crew",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold-500/60 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-white/30">
                  Add-on to any charter aboard Van Dutch 40 or Monte Carlo 6.
                </p>
              </div>
            </Reveal>

            {/* Refill */}
            <Reveal delay={80}>
              <div className="rounded-2xl bg-navy-800/40 border border-white/5 p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Keep the Round Going
                  </h3>
                </div>
                <div className="mb-6">
                  <span className="font-heading text-4xl font-bold text-white">
                    AED 500
                  </span>
                  <span className="text-sm text-white/40 ml-2">
                    per extra set of 24 balls
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed flex-1">
                  24 drives go faster than you think — especially once the
                  long-drive contest starts. Add extra sets of eco balls any
                  time during your session; the crew keeps them chilled, dry,
                  and ready.
                </p>
                <p className="mt-6 text-xs text-white/30">
                  Every ball dissolves in seawater — drive as much as you like,
                  leave nothing behind.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Yachts */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <SectionHeading
            title="Yachts With a Golf Platform"
            subtitle="Two yachts in our fleet are equipped for golf at sea."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
            {[
              {
                name: "Van Dutch 40",
                href: "/fleet/van-dutch-40",
                text: "An open-deck icon with a long, low stern platform — a natural tee box just above the waterline.",
              },
              {
                name: "Monte Carlo 6",
                href: "/fleet/monte-carlo-6",
                text: "A luxury flybridge cruiser with a wide hydraulic swim platform — stable, spacious, and perfect for a full swing.",
              },
            ].map((yacht, i) => (
              <Reveal key={yacht.name} delay={i * 80}>
                <Link
                  href={yacht.href}
                  className="flex items-start gap-4 p-6 rounded-xl bg-navy-800/50 border border-white/5 hover:border-gold-500/20 transition-all duration-300 group h-full"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                    <Ship className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-white group-hover:text-gold-400 transition-colors">
                      {yacht.name}
                    </h3>
                    <p className="mt-1 text-white/50 text-sm leading-relaxed">
                      {yacht.text}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-gold-400 transition-colors flex-shrink-0 mt-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <SectionHeading
            title="Golf at Sea, In Pictures"
            subtitle="Real moments from Golf on the Yacht sessions."
          />
          <Gallery />

          {GOLF_VIDEO_ID && (
            <div className="mt-10 max-w-3xl mx-auto">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${GOLF_VIDEO_ID}`}
                  title="Golf on the Yacht — Imperial Yachting"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything guests ask before their first drive at sea."
          />
          <div className="max-w-3xl space-y-4">
            {GOLF_FAQ.map((item, i) => (
              <Reveal key={item.question} delay={i * 60}>
                <div className="rounded-xl bg-navy-800/50 border border-white/5 p-6">
                  <h3 className="font-heading font-semibold text-white">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-white/60 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </Reveal>
            ))}
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
          <Waves
            className="w-8 h-8 text-gold-500/40 mx-auto mb-6"
            strokeWidth={1.5}
          />

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            Ready for Your First Drive at Sea?
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Add Golf on the Yacht to any charter aboard Van Dutch 40 or Monte
            Carlo 6. Message us on WhatsApp and we&apos;ll set up your floating
            range — clubs, green, and eco balls included.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={SITE_CONFIG.whatsapp}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </Button>
            <Button variant="secondary" size="lg" href="/fleet">
              <Anchor className="w-5 h-5" />
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
