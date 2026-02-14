"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Clock,
  Timer,
  MapPin,
  CheckCircle,
  Play,
  MessageCircle,
  Phone,
  Anchor,
  Navigation,
  Ship,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { YachtGallery } from "@/components/gallery/YachtGallery";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { getEmbedUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import type { Destination } from "@/types/common";

interface Props {
  destination: Destination;
  related: Destination[];
}

export function DestinationDetailClient({ destination, related }: Props) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const embedUrl = getEmbedUrl(destination.videoUrl);
  const hasVideo = !!embedUrl;
  const hasGallery = destination.galleryImages.length > 0;

  // Google Maps embed or link for this destination
  const mapsEmbedUrl = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || !destination.latitude || !destination.longitude) return null;
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${destination.latitude},${destination.longitude}&zoom=14&maptype=satellite`;
  }, [destination.latitude, destination.longitude]);

  const mapsLinkUrl = useMemo(() => {
    if (!destination.latitude || !destination.longitude) return null;
    return `https://www.google.com/maps?q=${destination.latitude},${destination.longitude}`;
  }, [destination.latitude, destination.longitude]);

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
            <span className="text-white/70">{destination.name}</span>
          </nav>
        </Container>
      </div>

      {/* Hero — video or cover image */}
      <section className="pt-8 pb-12 sm:pb-16 bg-navy-950">
        <Container>
          {/* Title */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {destination.name}
            </h1>
            {destination.shortDescription && (
              <p className="mt-2 text-lg sm:text-xl text-white/50 max-w-2xl">
                {destination.shortDescription}
              </p>
            )}
          </div>

          {/* Video with facade pattern */}
          {hasVideo ? (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-navy-800">
              {videoPlaying ? (
                <iframe
                  src={`${embedUrl}?autoplay=1&rel=0`}
                  title={`${destination.name} video`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {destination.coverImage && (
                    <Image
                      src={destination.coverImage}
                      alt={destination.name}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-navy-950/40 flex items-center justify-center">
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="group flex items-center justify-center w-20 h-20 rounded-full bg-gold-500/90 hover:bg-gold-500 transition-all hover:scale-110 shadow-2xl"
                      aria-label="Play video"
                    >
                      <Play className="w-8 h-8 text-navy-950 ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-navy-950/60 backdrop-blur-sm text-white/80 text-xs font-medium">
                    Watch the experience
                  </div>
                </>
              )}
            </div>
          ) : destination.coverImage ? (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-navy-800">
              <Image
                src={destination.coverImage}
                alt={destination.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          ) : null}
        </Container>
      </section>

      {/* Quick Info Bar */}
      <section className="py-8 bg-navy-900 border-y border-white/5">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {destination.duration && (
              <QuickInfo
                icon={<Timer className="w-5 h-5 text-gold-500" />}
                label="Duration"
                value={destination.duration}
              />
            )}
            <QuickInfo
              icon={<Ship className="w-5 h-5 text-gold-500" />}
              label="Starting from"
              value={
                destination.priceFrom
                  ? `AED ${destination.priceFrom.toLocaleString("en-US")}`
                  : "Contact for pricing"
              }
            />
            {destination.sailingTime && (
              <QuickInfo
                icon={<Clock className="w-5 h-5 text-gold-500" />}
                label="Sailing Time"
                value={destination.sailingTime}
              />
            )}
          </div>
        </Container>
      </section>

      {/* Description + Highlights (merged) */}
      <section className="py-16 sm:py-24 bg-navy-950">
        <Container>
          <div className="max-w-4xl">
            <SectionHeading
              title="About This Destination"
              subtitle="Discover what makes this destination exceptional."
            />
            <p className="text-white/70 text-lg leading-relaxed whitespace-pre-line">
              {destination.description}
            </p>

            {destination.priceFrom && (
              <div className="mt-8 inline-flex items-baseline gap-2 bg-navy-800 rounded-xl px-6 py-4 border border-white/5">
                <span className="text-sm text-white/40 uppercase tracking-wider">
                  Starting from
                </span>
                <span className="font-heading text-2xl font-bold text-white">
                  AED {destination.priceFrom.toLocaleString("en-US")}
                </span>
              </div>
            )}

            {/* Highlights inline */}
            {destination.highlights.length > 0 && (
              <div className="mt-10">
                <h3 className="font-heading text-xl font-bold text-white mb-4">
                  Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-center gap-3 py-2"
                    >
                      <CheckCircle className="w-4 h-4 text-gold-500/70 flex-shrink-0" />
                      <span className="text-white/60 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Image Gallery */}
      {hasGallery && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading
              title="Gallery"
              subtitle="Explore the experience through our curated photo collection."
            />
            <YachtGallery
              images={destination.galleryImages}
              yachtName={destination.name}
            />
          </Container>
        </section>
      )}

      {/* What's Included */}
      {destination.whatIncluded.length > 0 && (
        <section className={`py-16 sm:py-24 ${hasGallery ? "bg-navy-950" : "bg-navy-900"}`}>
          <Container>
            <SectionHeading
              title="What's Included"
              subtitle="Everything that comes with this experience."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
              {destination.whatIncluded.map((item) => (
                <Reveal key={item}>
                  <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-navy-800/50 border border-white/5">
                    <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Itinerary Timeline */}
      {destination.itinerary.length > 0 && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading
              title="Itinerary"
              subtitle="Your step-by-step experience journey."
            />
            <div className="max-w-2xl itinerary-line space-y-6">
              {destination.itinerary.map((step, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-heading font-bold text-gold-400">
                        {i + 1}
                      </span>
                    </div>
                    <div className="pt-0.5">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Map */}
      {(mapsEmbedUrl || mapsLinkUrl) && (
        <section className="py-16 sm:py-24 bg-navy-900">
          <Container>
            <SectionHeading
              title="Location"
              subtitle={`${destination.name} on the Dubai coastline.`}
            />
            {mapsEmbedUrl ? (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/5">
                <iframe
                  src={mapsEmbedUrl}
                  title={`${destination.name} location on map`}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : mapsLinkUrl ? (
              <a
                href={mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-white/5 hover:border-gold-500/15 bg-navy-800 p-6 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                  <Navigation className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-white group-hover:text-gold-400 transition-colors">
                    View on Google Maps
                  </p>
                  <p className="text-sm text-white/40 mt-0.5">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {destination.name} — Dubai, UAE
                  </p>
                </div>
              </a>
            ) : null}
          </Container>
        </section>
      )}

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
            Book This Experience
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Get in touch with our charter team to plan your{" "}
            {destination.name.toLowerCase()} experience. We&apos;ll tailor
            every detail to make it unforgettable.
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

      {/* Related Destinations */}
      {related.length > 0 && (
        <section className="py-24 sm:py-32 bg-navy-950">
          <Container>
            <SectionHeading
              title="You Might Also Like"
              subtitle="Explore more experiences from our curated collection."
              align="center"
            />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((dest, i) => (
                <Reveal key={dest.slug} delay={i * 100}>
                  <DestinationCard destination={dest} index={i} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function QuickInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  );
}
