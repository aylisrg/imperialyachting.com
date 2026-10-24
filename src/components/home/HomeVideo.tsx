"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HOME_CLIP_BASE, HOME_POSTER_BASE } from "@/data/home";

type Conn = { saveData?: boolean };

/** Video is skipped entirely (poster only) for reduced motion or Save-Data. */
export function videoAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const c = (navigator as Navigator & { connection?: Conn }).connection;
  return !c?.saveData;
}

export function clipWidth(): 960 | 1920 {
  return window.innerWidth > 1000 ? 1920 : 960;
}

interface Props {
  clip: string;
  alt: string;
  /** Hero: poster is the LCP image (priority), clip autoloads on mount. */
  hero?: boolean;
  sizes?: string;
  /** Load the poster eagerly (no lazy loading) without making it a priority/LCP image. */
  eager?: boolean;
}

export function HomeVideo({ clip, alt, hero = false, sizes = "100vw", eager = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !HOME_CLIP_BASE || !videoAllowed()) return;
    if (hero) {
      // Hero clip starts after the page has loaded so it never competes with LCP;
      // the poster image is shown until then.
      let t: ReturnType<typeof setTimeout> | undefined;
      const go = () => {
        t = setTimeout(() => setSrc(clipWidth()), 300);
      };
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
      return () => {
        window.removeEventListener("load", go);
        if (t) clearTimeout(t);
      };
    }
    // Non-hero clips: nothing is fetched until the section enters the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSrc((s) => s ?? clipWidth());
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { rootMargin: "0px 0px 15% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [hero]);

  useEffect(() => {
    const v = ref.current;
    if (!v || src == null) return;
    v.load();
    v.play().catch(() => {});
  }, [src]);

  return (
    <div className="media">
      <Image
        src={`${HOME_POSTER_BASE}/${clip}.jpg`}
        alt={alt}
        fill
        sizes={sizes}
        priority={hero}
        fetchPriority={hero ? "high" : undefined}
        loading={hero || eager ? "eager" : "lazy"}
      />
      {HOME_CLIP_BASE && (
      <video
        ref={ref}
        className={playing ? "on" : undefined}
        muted
        loop
        playsInline
        autoPlay={hero}
        preload="none"
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
      >
        {src != null && (
          <>
            <source src={`${HOME_CLIP_BASE}/${clip}-${src}.webm`} type="video/webm" />
            <source src={`${HOME_CLIP_BASE}/${clip}-${src}.mp4`} type="video/mp4" />
          </>
        )}
      </video>
      )}
    </div>
  );
}
