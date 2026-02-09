"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Anchor, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState<{
    webm: string;
    mp4: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pick mobile vs desktop source based on viewport width
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setVideoSrc({
      webm: isMobile
        ? "/media/hero/hero-mobile.webm"
        : "/media/hero/hero-desktop.webm",
      mp4: isMobile
        ? "/media/hero/hero-mobile.mp4"
        : "/media/hero/hero-desktop.mp4",
    });
  }, []);

  // Once sources are set, start playback (handles autoplay restrictions)
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay blocked — video stays hidden, gradient visible
      });
    }
  }, [videoSrc]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* === Background layers === */}
      <div className="absolute inset-0 bg-navy-950">
        {/* Rich fallback gradient — visible before video loads */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />

        {/* Atmospheric glow accents */}
        <div className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-gold-500/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[700px] h-[700px] bg-sea-500/[0.07] rounded-full blur-[130px]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-gold-400/[0.03] rounded-full blur-[100px]" />

        {/* Background video — fades in over gradient when ready */}
        {videoSrc && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster="/media/hero/hero-poster.jpg"
            preload="auto"
            onCanPlayThrough={() => setVideoLoaded(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]",
              videoLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            <source src={videoSrc.webm} type="video/webm" />
            <source src={videoSrc.mp4} type="video/mp4" />
          </video>
        )}

        {/* Dark overlay — heavier when video plays, lighter for gradient fallback */}
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-[1500ms]",
            videoLoaded ? "bg-navy-950/60" : "bg-navy-950/30"
          )}
        />

        {/* Dot pattern texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />
      </div>

      {/* === Content === */}
      <Container className="relative z-10 pt-32 pb-20">
        <div className="max-w-4xl">
          {/* Decorative gold line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 1,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="origin-left mb-8"
          >
            <div className="gold-line" />
          </motion.div>

          {/* Anchor icon */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6"
          >
            <Anchor className="w-8 h-8 text-gold-500/60" strokeWidth={1.5} />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
          >
            <span className="text-gold-gradient">IMPERIAL</span>
            <br />
            <span className="text-white">YACHTING</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 font-heading text-lg sm:text-xl md:text-2xl text-white/70 font-medium tracking-wide"
          >
            Dubai&apos;s Premier Yacht Charter &amp; Management
          </motion.p>

          {/* Brief description */}
          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 max-w-xl text-base sm:text-lg text-white/50 leading-relaxed font-body"
          >
            Experience unparalleled luxury on the water with our exclusively
            owned fleet of premium motor yachts. All-inclusive charters with
            professional crew, departing from Dubai Harbour.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button variant="primary" size="lg" href="/fleet">
              Explore Our Fleet
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Contact Us
            </Button>
          </motion.div>

          {/* Location indicator */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-16 flex items-center gap-2 text-white/40"
          >
            <MapPin className="w-4 h-4 text-gold-500/60" />
            <span className="text-sm font-medium tracking-wide uppercase">
              Dubai Harbour
            </span>
            <span className="ml-2 w-8 h-px bg-gold-500/30" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
