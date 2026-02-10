"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { testimonials } from "@/data/testimonials";

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-24 sm:py-32 bg-sand-50">
      <Container>
        <SectionHeading
          title="What Our Clients Say"
          subtitle="Hear from guests who have experienced the Imperial Yachting difference."
          align="center"
          light
        />

        <div className="relative max-w-3xl mx-auto">
          <Quote className="mx-auto mb-6 w-10 h-10 text-gold-500/30" />

          {/* Crossfade testimonials — all in DOM, only current visible */}
          <div className="relative min-h-[200px] flex items-center justify-center">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={cn(
                  "testimonial-slide absolute inset-0 flex items-center justify-center",
                  i === current
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                )}
                aria-hidden={i !== current}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={cn(
                          "w-5 h-5",
                          j < testimonial.rating
                            ? "fill-gold-500 text-gold-500"
                            : "fill-sand-200 text-sand-200"
                        )}
                      />
                    ))}
                  </div>

                  <blockquote className="font-accent text-xl sm:text-2xl italic text-navy-900 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>

                  <div className="mt-8">
                    <p className="font-heading font-semibold text-navy-950">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="mt-1 text-sm text-navy-800/60">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="mt-10 flex items-center justify-center gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-full transition-all duration-300 cursor-pointer",
                  i === current
                    ? "w-8 h-2.5 bg-gold-500"
                    : "w-2.5 h-2.5 bg-navy-950/15 hover:bg-gold-500/40"
                )}
                aria-label={`View testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
