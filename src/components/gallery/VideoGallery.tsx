"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGalleryProps {
  youtubeShorts: string[];
  youtubeVideo: string;
  yachtName: string;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoGallery({
  youtubeShorts,
  youtubeVideo,
  yachtName,
}: VideoGalleryProps) {
  const [activeShortsIndex, setActiveShortsIndex] = useState<number | null>(
    null
  );
  const [showMainVideo, setShowMainVideo] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const shortsIds = youtubeShorts
    .map(extractYoutubeId)
    .filter((id): id is string => id !== null);

  const mainVideoId = extractYoutubeId(youtubeVideo);
  const hasShorts = shortsIds.length > 0;
  const hasMainVideo = !!mainVideoId;

  const closeShortsPlayer = useCallback(() => setActiveShortsIndex(null), []);

  const goNextShort = useCallback(() => {
    setActiveShortsIndex((prev) =>
      prev !== null ? (prev + 1) % shortsIds.length : 0
    );
  }, [shortsIds.length]);

  const goPrevShort = useCallback(() => {
    setActiveShortsIndex((prev) =>
      prev !== null
        ? (prev - 1 + shortsIds.length) % shortsIds.length
        : shortsIds.length - 1
    );
  }, [shortsIds.length]);

  // Keyboard navigation for fullscreen player
  useEffect(() => {
    if (activeShortsIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeShortsPlayer();
      if (e.key === "ArrowRight") goNextShort();
      if (e.key === "ArrowLeft") goPrevShort();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeShortsIndex, closeShortsPlayer, goNextShort, goPrevShort]);

  // Lock body scroll when fullscreen player open — compensate for scrollbar
  useEffect(() => {
    if (activeShortsIndex !== null) {
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
  }, [activeShortsIndex]);

  // Touch swipe handlers for fullscreen player
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const threshold = 60;
      if (deltaX > threshold) goPrevShort();
      else if (deltaX < -threshold) goNextShort();
      touchStartX.current = null;
    },
    [goNextShort, goPrevShort]
  );

  if (!hasShorts && !hasMainVideo) return null;

  return (
    <>
      <div className="space-y-8">
        {/* Section header */}
        <div className="flex items-center gap-4">
          <div className="gold-line" />
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
            Video
          </h2>
        </div>

        {/* ── Main YouTube Video ── */}
        {hasMainVideo && (
          <div>
            {showMainVideo ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-navy-800 shadow-2xl shadow-black/40">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${mainVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${yachtName} — Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <button
                onClick={() => setShowMainVideo(true)}
                className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer bg-navy-800"
              >
                {/* Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${mainVideoId}/maxresdefault.jpg`}
                  alt={`${yachtName} video`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-navy-950/30" />
                <div className="absolute inset-0 bg-navy-950/10 group-hover:bg-navy-950/0 transition-colors duration-500" />

                {/* Play button — gold ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center ring-2 ring-gold-500/60 group-hover:ring-gold-400 group-hover:bg-white/15 group-hover:scale-110 transition-all duration-500">
                      <Play
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1"
                        fill="white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="text-gold-400/80 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
                    Watch Full Video
                  </p>
                  <p className="text-white text-lg sm:text-xl font-heading font-bold">
                    {yachtName}
                  </p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* ── YouTube Shorts ── */}
        {hasShorts && (
          <div>
            <p className="text-xs text-gold-400/50 uppercase tracking-[0.2em] font-medium mb-4">
              Shorts
            </p>

            {/* Horizontal scroll container */}
            <div className="relative group/scroll">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1">
                {shortsIds.map((videoId, idx) => (
                  <button
                    key={videoId}
                    onClick={() => setActiveShortsIndex(idx)}
                    className="relative flex-shrink-0 w-[140px] sm:w-[156px] lg:w-[172px] aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer snap-start group/card"
                  >
                    {/* Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/oar2.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/20 opacity-60 group-hover/card:opacity-40 transition-opacity duration-300" />

                    {/* Glass border on hover */}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover/card:ring-2 group-hover/card:ring-gold-500/50 transition-all duration-300" />

                    {/* Play icon — appears on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30 scale-75 group-hover/card:scale-100 transition-transform duration-300">
                        <Play
                          className="w-5 h-5 text-white ml-0.5"
                          fill="white"
                        />
                      </div>
                    </div>

                    {/* YouTube Shorts badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
                      <svg
                        className="w-3 h-3 text-red-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22.95.25 1.45.03.5.04 1.05.04 1.38 0 .33-.01.88-.04 1.38-.03.5-.12.98-.25 1.45-.27.95-1.04 1.72-2 2.04-.47.13-.95.22-1.45.25-.5.03-1.05.04-1.38.04H7.27c-.33 0-.88-.01-1.38-.04-.5-.03-.98-.12-1.45-.25-.95-.32-1.72-1.09-2-2.04-.13-.47-.22-.95-.25-1.45C2.16 12.88 2.15 12.33 2.15 12s.01-.88.04-1.38c.03-.5.12-.98.25-1.45.28-.95 1.05-1.72 2-2.04.47-.13.95-.22 1.45-.25.5-.03 1.05-.04 1.38-.04h9.46c.33 0 .88.01 1.38.04.5.03.98.12 1.45.25.96.32 1.73 1.09 2 2.04z" />
                      </svg>
                      <span className="text-[10px] text-white/80 font-semibold">
                        Shorts
                      </span>
                    </div>

                    {/* Bottom number badge */}
                    <div className="absolute bottom-2.5 left-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-[11px] text-white/70 font-semibold">
                        {idx + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Scroll fade edges — desktop only */}
              {shortsIds.length > 4 && (
                <div className="hidden lg:block absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-navy-950 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Fullscreen Shorts Player ── */}
      {activeShortsIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeShortsPlayer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={closeShortsPlayer}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium">
              {activeShortsIndex + 1} / {shortsIds.length}
            </div>
          </div>

          {/* Player container — 9:16 vertical */}
          <div
            className="relative w-full max-w-[380px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              key={shortsIds[activeShortsIndex]}
              src={`https://www.youtube-nocookie.com/embed/${shortsIds[activeShortsIndex]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${shortsIds[activeShortsIndex]}`}
              title={`${yachtName} — Short ${activeShortsIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Navigation arrows */}
          {shortsIds.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevShort();
                }}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-10 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                aria-label="Previous short"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNextShort();
                }}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-10 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                aria-label="Next short"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Bottom thumbnail strip */}
          {shortsIds.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-md max-w-[90vw] overflow-x-auto no-scrollbar">
              {shortsIds.map((videoId, idx) => (
                <button
                  key={videoId}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveShortsIndex(idx);
                  }}
                  className={cn(
                    "relative flex-shrink-0 w-10 h-[70px] rounded-lg overflow-hidden transition-all duration-300",
                    idx === activeShortsIndex
                      ? "ring-2 ring-gold-500 opacity-100 scale-110"
                      : "opacity-40 hover:opacity-70"
                  )}
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/oar2.jpg`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Swipe hint — mobile only, shown briefly */}
          <div className="sm:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-10 text-white/30 text-xs font-medium animate-pulse">
            Swipe to navigate
          </div>
        </div>
      )}
    </>
  );
}
