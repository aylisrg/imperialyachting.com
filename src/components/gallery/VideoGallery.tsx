"use client";

import { useState, useCallback } from "react";
import { Play, X, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGalleryProps {
  youtubeShorts: string[];
  youtubeVideo: string;
  yachtName: string;
}

/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
 */
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

function ShortsThumbnail({ videoId }: { videoId: string }) {
  return (
    <img
      src={`https://img.youtube.com/vi/${videoId}/oar2.jpg`}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export function VideoGallery({
  youtubeShorts,
  youtubeVideo,
  yachtName,
}: VideoGalleryProps) {
  const [activeShortsIndex, setActiveShortsIndex] = useState<number | null>(null);
  const [showMainVideo, setShowMainVideo] = useState(false);

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

  if (!hasShorts && !hasMainVideo) return null;

  return (
    <>
      <div className="space-y-8">
        {/* Section header */}
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-gold-500" />
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Video
          </h2>
        </div>

        {/* Main YouTube Video */}
        {hasMainVideo && (
          <div className="relative w-full">
            {showMainVideo ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-navy-800">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${mainVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${yachtName} — Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
            ) : (
              <button
                onClick={() => setShowMainVideo(true)}
                className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer bg-navy-800"
              >
                <img
                  src={`https://img.youtube.com/vi/${mainVideoId}/maxresdefault.jpg`}
                  alt={`${yachtName} video`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-navy-950/30 group-hover:bg-navy-950/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 ring-2 ring-white/20">
                    <Play className="w-9 h-9 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-navy-950/60 backdrop-blur-sm text-white/80 text-xs font-medium">
                  Watch Video
                </div>
              </button>
            )}
          </div>
        )}

        {/* YouTube Shorts Grid */}
        {hasShorts && (
          <div>
            <p className="text-sm text-white/40 uppercase tracking-wider font-medium mb-4">
              Shorts
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {shortsIds.map((videoId, idx) => (
                <button
                  key={videoId}
                  onClick={() => setActiveShortsIndex(idx)}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer bg-navy-800"
                >
                  <ShortsThumbnail videoId={videoId} />
                  <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/10 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center ring-2 ring-white/20">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  {/* Shorts badge */}
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-red-600 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22.95.25 1.45.03.5.04 1.05.04 1.38 0 .33-.01.88-.04 1.38-.03.5-.12.98-.25 1.45-.27.95-1.04 1.72-2 2.04-.47.13-.95.22-1.45.25-.5.03-1.05.04-1.38.04H7.27c-.33 0-.88-.01-1.38-.04-.5-.03-.98-.12-1.45-.25-.95-.32-1.72-1.09-2-2.04-.13-.47-.22-.95-.25-1.45C2.16 12.88 2.15 12.33 2.15 12s.01-.88.04-1.38c.03-.5.12-.98.25-1.45.28-.95 1.05-1.72 2-2.04.47-.13.95-.22 1.45-.25.5-.03 1.05-.04 1.38-.04h9.46c.33 0 .88.01 1.38.04.5.03.98.12 1.45.25.96.32 1.73 1.09 2 2.04z"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shorts Fullscreen Player */}
      {activeShortsIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={closeShortsPlayer}
        >
          {/* Close */}
          <button
            onClick={closeShortsPlayer}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium">
            {activeShortsIndex + 1} / {shortsIds.length}
          </div>

          {/* Player container — vertical 9:16 */}
          <div
            className="relative w-full max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              key={shortsIds[activeShortsIndex]}
              src={`https://www.youtube-nocookie.com/embed/${shortsIds[activeShortsIndex]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${shortsIds[activeShortsIndex]}`}
              title={`${yachtName} — Short ${activeShortsIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Nav arrows */}
          {shortsIds.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevShort();
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous short"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNextShort();
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next short"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom thumbnails */}
          {shortsIds.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-sm max-w-[90vw] overflow-x-auto no-scrollbar">
              {shortsIds.map((videoId, idx) => (
                <button
                  key={videoId}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveShortsIndex(idx);
                  }}
                  className={cn(
                    "relative flex-shrink-0 w-10 h-[70px] rounded-lg overflow-hidden transition-all duration-200",
                    idx === activeShortsIndex
                      ? "ring-2 ring-gold-500 opacity-100 scale-110"
                      : "opacity-40 hover:opacity-70"
                  )}
                >
                  <ShortsThumbnail videoId={videoId} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
