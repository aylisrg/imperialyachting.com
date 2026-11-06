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

/**
 * Clip width for the frame it fills (IY-1680). The clip is cropped to cover the frame
 * (object-fit: cover), so a full-screen phone frame needs the source as wide as the
 * frame's HEIGHT × the clip's aspect — not as wide as the window. Device pixels count
 * (capped at 2×), and the measured box already includes the zoom transforms of the frame.
 * 960 is used only while it is upscaled by at most ~15%; otherwise 1920.
 */
export function clipWidth(box: { width: number; height: number }, dpr = 1, aspect = 16 / 9): 960 | 1920 {
  const need = Math.max(box.width, box.height * aspect) * Math.min(Math.max(dpr, 1), 2);
  return need <= 1100 ? 960 : 1920;
}

/**
 * One clip downloads at a time (IY-1680): the hero first, then whichever waiting clip is
 * nearest the screen. The next one starts when the current can play through, fails, or
 * after 8 s — so the first clip on screen is never fighting the others for bandwidth.
 */
type Job = { el: HTMLElement; hero: boolean; start: () => void; done?: () => void };
const queue: Job[] = [];
let busy = false;
// The hero clip goes first: other clips wait until it can play (or 1.5 s after load on pages without a hero).
let heroGone = false;
function openGate() {
  if (heroGone) return;
  heroGone = true;
  next();
}
if (typeof window !== "undefined") {
  const late = () => setTimeout(openGate, 1500);
  if (document.readyState === "complete") late();
  else window.addEventListener("load", late, { once: true });
}

function distance(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  if (r.bottom < 0) return -r.bottom;
  if (r.top > window.innerHeight) return r.top - window.innerHeight;
  return 0;
}

function next() {
  if (busy || !queue.length) return;
  if (!heroGone && !queue.some((j) => j.hero)) return;
  queue.sort((a, b) => (a.hero === b.hero ? distance(a.el) - distance(b.el) : a.hero ? -1 : 1));
  const job = queue.shift()!;
  busy = true;
  const t = setTimeout(() => job.done?.(), 8000);
  job.done = () => {
    clearTimeout(t);
    job.done = undefined;
    busy = false;
    if (job.hero) heroGone = true;
    next();
  };
  job.start();
}

function enqueue(job: Job): () => void {
  queue.push(job);
  next();
  return () => {
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
    job.done?.();
  };
}

interface Props {
  clip: string;
  alt: string;
  /** Hero: poster is the LCP image (priority), clip autoloads on mount. */
  hero?: boolean;
  sizes?: string;
  /** Load the poster eagerly (no lazy loading) without making it a priority/LCP image. */
  eager?: boolean;
  /** Width ÷ height of the clip; 16/9 unless the clip is portrait. */
  aspect?: number;
}

export function HomeVideo({ clip, alt, hero = false, sizes = "100vw", eager = false, aspect = 16 / 9 }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const job = useRef<Job | null>(null);
  const [src, setSrc] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !HOME_CLIP_BASE || !videoAllowed()) return;
    let cancel: (() => void) | undefined;
    const ask = () => {
      if (job.current) return;
      job.current = {
        el: v,
        hero,
        start: () => setSrc((s) => s ?? clipWidth(v.getBoundingClientRect(), window.devicePixelRatio, aspect)),
      };
      cancel = enqueue(job.current);
    };
    if (hero) {
      // Hero clip starts after the page has loaded so it never competes with LCP;
      // the poster image is shown until then.
      let t: ReturnType<typeof setTimeout> | undefined;
      const go = () => {
        t = setTimeout(ask, 300);
      };
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
      return () => {
        window.removeEventListener("load", go);
        if (t) clearTimeout(t);
        cancel?.();
      };
    }
    // Non-hero clips queue up as their section comes within one screen of the viewport;
    // they play only while on screen.
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) ask();
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    const on = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }
    });
    near.observe(v);
    on.observe(v);
    return () => {
      near.disconnect();
      on.disconnect();
      cancel?.();
    };
  }, [hero, aspect]);

  useEffect(() => {
    const v = ref.current;
    if (!v || src == null) return;
    v.load();
    if (hero || distance(v) === 0) v.play().catch(() => {});
  }, [src, hero]);

  const ready = () => job.current?.done?.();

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
        onCanPlayThrough={ready}
        onError={ready}
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
