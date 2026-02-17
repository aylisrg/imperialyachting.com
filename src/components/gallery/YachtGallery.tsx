"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface YachtGalleryProps {
  images: string[];
  yachtName: string;
}

export function YachtGallery({ images, yachtName }: YachtGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  }, []);

  const hasValidImage = useCallback(
    (index: number) => !imageErrors.has(index),
    [imageErrors]
  );

  const goTo = useCallback(
    (index: number) => {
      setSelectedIndex(((index % images.length) + images.length) % images.length);
    },
    [images.length]
  );

  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex]);
  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, goNext, goPrev]);

  // Lock body scroll when lightbox open — compensate for scrollbar to prevent layout shift
  useEffect(() => {
    if (lightboxOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Main Image */}
        <div
          className="lg:col-span-3 relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          {hasValidImage(selectedIndex) ? (
            <Image
              src={images[selectedIndex]}
              alt={`${yachtName} — Photo ${selectedIndex + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 75vw"
              priority={selectedIndex === 0}
              onError={() => handleImageError(selectedIndex)}
            />
          ) : (
            <GalleryPlaceholder name={yachtName} />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/20 transition-colors duration-300" />

          {/* Expand icon */}
          <div className="absolute top-4 right-4 p-2 rounded-lg bg-navy-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Expand className="w-5 h-5 text-white" />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-navy-950/60 backdrop-blur-sm text-white/80 text-xs font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Nav arrows on main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-navy-950/50 backdrop-blur-sm text-white/80 hover:bg-navy-950/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-navy-950/50 backdrop-blur-sm text-white/80 hover:bg-navy-950/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden no-scrollbar lg:max-h-[500px]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative flex-shrink-0 w-20 h-16 lg:w-full lg:h-auto lg:aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300",
                idx === selectedIndex
                  ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-navy-950 opacity-100"
                  : "opacity-50 hover:opacity-80"
              )}
              aria-label={`View photo ${idx + 1}`}
            >
              {hasValidImage(idx) ? (
                <Image
                  src={img}
                  alt={`${yachtName} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 80px, 25vw"
                  onError={() => handleImageError(idx)}
                />
              ) : (
                <GalleryPlaceholder name="" small />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Main lightbox image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[85vh] mx-4 sm:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {hasValidImage(selectedIndex) ? (
              <Image
                src={images[selectedIndex]}
                alt={`${yachtName} — Photo ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <GalleryPlaceholder name={yachtName} />
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom thumbnails in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-3 rounded-2xl bg-navy-950/80 backdrop-blur-sm max-w-[90vw] overflow-x-auto no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(idx);
                }}
                className={cn(
                  "relative flex-shrink-0 w-16 h-12 rounded-md overflow-hidden transition-all duration-200",
                  idx === selectedIndex
                    ? "ring-2 ring-gold-500 opacity-100 scale-110"
                    : "opacity-40 hover:opacity-70"
                )}
              >
                {hasValidImage(idx) ? (
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    onError={() => handleImageError(idx)}
                  />
                ) : (
                  <div className="w-full h-full bg-navy-700" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function GalleryPlaceholder({
  name,
  small,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 via-gold-400/10 to-navy-700 flex items-center justify-center">
      {!small && (
        <div className="text-center">
          <ImageIcon className="w-10 h-10 text-white/15 mx-auto mb-2" />
          <span className="font-heading text-lg font-bold text-white/15 tracking-wider">
            {name}
          </span>
        </div>
      )}
    </div>
  );
}
