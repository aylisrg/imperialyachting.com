"use client";

import { useEffect } from "react";

/**
 * Scroll choreography from design/prototype/index.html (GSAP + ScrollTrigger + Lenis).
 * Loaded lazily after the page is idle so it never competes with LCP.
 * prefers-reduced-motion: no pins, no smooth scroll, static layout.
 */
export function HomeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      const root = document.querySelector<HTMLElement>(".iyh");
      if (!root) return;
      root.classList.add("motion");
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ lerp: 0.09 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        gsap.to(".hero h1", { xPercent: -22, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero .v", { scale: 1.15, yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

        const mm = gsap.matchMedia();
        mm.add("(min-width:769px)", () => {
          const m = gsap.timeline({ scrollTrigger: { trigger: ".man", start: "top top", end: "+=160%", pin: true, scrub: 1 } });
          m.to(".man .frame", { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut" }, 0)
            .to(".man .frame .media", { scale: 1, ease: "power2.inOut" }, 0)
            .fromTo(".man .l:not(.r)", { xPercent: 0 }, { xPercent: -60, opacity: 0 }, 0.1)
            .fromTo(".man .l.r", { xPercent: 0 }, { xPercent: 60, opacity: 0 }, 0.1)
            .from(".man .sub", { y: 60, opacity: 0 }, 0.55);

          const its = gsap.utils.toArray<HTMLElement>(".svc .it");
          const s = gsap.timeline({ scrollTrigger: { trigger: ".svc", start: "top top", end: "+=220%", pin: true, scrub: 1 } });
          its.forEach((it, i) => {
            s.to(it, { opacity: 1, x: 24, duration: 1 }, i);
            if (i < its.length - 1) s.to(it, { opacity: 0.35, x: 0, duration: 1 }, i + 1);
          });
          s.to(".svc .b1", { opacity: 1, duration: 2 }, 2).fromTo(".svc .b1 .media", { scale: 1.2 }, { scale: 1, duration: 2 }, 2);

          const tr = document.querySelector<HTMLElement>(".track");
          if (tr) {
            const hz = gsap.to(tr, {
              x: () => -(tr.scrollWidth - window.innerWidth),
              ease: "none",
              scrollTrigger: { trigger: ".fleet", start: "top top", end: () => "+=" + (tr.scrollWidth - window.innerWidth), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
            });
            gsap.utils.toArray<HTMLElement>(".panel").forEach((p) => {
              gsap.fromTo(p.querySelector(".media"), { scale: 1.3 }, { scale: 1.05, ease: "none", scrollTrigger: { trigger: p, containerAnimation: hz, start: "left right", end: "right left", scrub: true } });
              gsap.from(p.querySelector("h3"), { yPercent: 60, opacity: 0, scrollTrigger: { trigger: p, containerAnimation: hz, start: "left 70%", end: "left 30%", scrub: true } });
            });
          }
        });
        mm.add("(max-width:768px)", () => {
          const m = gsap.timeline({ scrollTrigger: { trigger: ".man", start: "top top", end: "+=90%", pin: true, scrub: 0.6 } });
          m.to(".man .frame", { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut" }, 0)
            .to(".man .frame .media", { scale: 1 }, 0)
            .to(".man .l:not(.r)", { xPercent: -80, opacity: 0 }, 0.15)
            .to(".man .l.r", { xPercent: 80, opacity: 0 }, 0.15)
            .from(".man .sub", { y: 40, opacity: 0 }, 0.5);
          const its = gsap.utils.toArray<HTMLElement>(".svc .it");
          const s = gsap.timeline({ scrollTrigger: { trigger: ".svc", start: "top top", end: "+=120%", pin: true, scrub: 0.6 } });
          its.forEach((it, i) => {
            s.to(it, { opacity: 1, x: 10, duration: 1 }, i);
            if (i < its.length - 1) s.to(it, { opacity: 0.4, x: 0, duration: 1 }, i + 1);
          });
          s.to(".svc .b1", { opacity: 1, duration: 2 }, 2);
          gsap.utils.toArray<HTMLElement>(".panel").forEach((p) => {
            gsap.fromTo(p.querySelector(".v"), { clipPath: "inset(14% 8% 0% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: p, start: "top 95%", end: "top 35%", scrub: true } });
            gsap.from(p.querySelector("h3"), { yPercent: 60, opacity: 0, scrollTrigger: { trigger: p, start: "top 50%", end: "top 20%", scrub: true } });
          });
        });

        const p = gsap.timeline({ scrollTrigger: { trigger: ".par", start: "top top", end: "+=120%", pin: true, scrub: 1 } });
        p.to(".par .v", { clipPath: "circle(150% at 75% 50%)", ease: "power2.in" })
          .from(".par h2", { yPercent: 30, opacity: 0 }, 0.2)
          .from(".par p, .par .btn", { y: 40, opacity: 0, stagger: 0.1 }, 0.4);
        gsap.from(".facts .big", { yPercent: 40, scrollTrigger: { trigger: ".facts", start: "top bottom", end: "bottom bottom", scrub: true } });
      }, root);

      cleanup = () => {
        ctx.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
        root.classList.remove("motion");
      };
    };

    const kick = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      if (ric) ric(() => void start());
      else setTimeout(() => void start(), 200);
    };
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", kick);
      cleanup?.();
    };
  }, []);

  return null;
}
