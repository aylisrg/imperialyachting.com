"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { Anchor, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};
function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth < 768,
    () => true, // SSR: assume mobile
  );
}

export function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video only on desktop
  useEffect(() => {
    if (isMobile) return;
    const video = videoRef.current;
    if (!video) return;

    const mp4 = document.createElement("source");
    mp4.src = "/media/hero/hero-desktop.mp4";
    mp4.type = "video/mp4";

    video.appendChild(mp4);
    video.load();
    video.play().catch(() => {});
  }, [isMobile]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* === Background layers === */}
      <div className="absolute inset-0 bg-navy-950">
        {/* Fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />

        {/* Poster image on mobile (Next.js Image with priority), video on desktop */}
        {isMobile ? (
          <Image
            src="/media/hero/hero-poster.jpg"
            alt="Dubai luxury yacht charter"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={75}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster="/media/hero/hero-poster.jpg"
            preload="none"
            onCanPlayThrough={() => setVideoLoaded(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              videoLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Dark overlay */}
        <div
          className={cn(
            "absolute inset-0",
            !isMobile && videoLoaded ? "bg-navy-950/60" : "bg-navy-950/50"
          )}
        />

        {/* Decorative accents — hidden on mobile to reduce GPU compositing */}
        <div className="hidden md:block absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-gold-500/[0.06] rounded-full blur-[150px]" />
        <div className="hidden md:block absolute bottom-[-10%] left-[-15%] w-[700px] h-[700px] bg-sea-500/[0.07] rounded-full blur-[130px]" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />
      </div>

      {/* === Content — CSS animations, zero JS animation library === */}
      <Container className="relative z-10 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="animate-hero-line mb-8">
            <div className="gold-line" />
          </div>

          <div className="animate-hero-1 mb-6">
            <Anchor className="w-8 h-8 text-gold-500/60" strokeWidth={1.5} />
          </div>

          <h1 className="animate-hero-2 font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            <span className="text-gold-gradient">IMPERIAL</span>
            <br />
            <span className="text-white">YACHTING</span>
          </h1>

          <p className="animate-hero-3 mt-6 font-heading text-lg sm:text-xl md:text-2xl text-white/70 font-medium tracking-wide">
            Dubai&apos;s Premier Yacht Charter &amp; Management
          </p>

          <p className="animate-hero-4 mt-5 max-w-xl text-base sm:text-lg text-white/50 leading-relaxed font-body">
            Experience unparalleled luxury on the water with our exclusively
            owned fleet of premium motor yachts. All-inclusive charters with
            professional crew, departing from Dubai Harbour.
          </p>

          <div className="animate-hero-5 mt-10 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" href="/fleet">
              Explore Our Fleet
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Contact Us
            </Button>
          </div>

          <div className="animate-hero-6 mt-16 flex items-center gap-2 text-white/40">
            <MapPin className="w-4 h-4 text-gold-500/60" />
            <span className="text-sm font-medium tracking-wide uppercase">
              Dubai Harbour
            </span>
            <span className="ml-2 w-8 h-px bg-gold-500/30" />
          </div>
        </div>
      </Container>
    </section>
  );
}
