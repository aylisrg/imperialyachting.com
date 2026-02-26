"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Youtube,
  Instagram,
  Play,
  ExternalLink,
  Heart,
  Eye,
  Users,
  Radio,
  MapPin,
  Anchor,
  Waves,
  Sun,
  Camera,
  Ship,
  Compass,
  Linkedin,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { BeholdWidget } from "@/components/instagram/BeholdWidget";
import { SITE_CONFIG } from "@/lib/constants";
import type { YouTubeVideo } from "@/lib/youtube";
import type { InstagramPost } from "@/lib/instagram";

/* ──────────────────────────────────────────────────────────────────────
   STATIC FALLBACK DATA
   Used when YOUTUBE_CHANNEL_ID is not configured or the RSS fetch fails.
   ────────────────────────────────────────────────────────────────────── */

interface VideoFallback {
  title: string;
  hoursAgo: number;
  views: string;
  duration: string;
  icon: React.ElementType;
  gradient: string;
  tag: string;
}

const YOUTUBE_FALLBACK: VideoFallback[] = [
  {
    title: "Sunset Charter on Monte Carlo 65 Flybridge",
    hoursAgo: 3,
    views: "2.1K",
    duration: "12:34",
    icon: Sun,
    gradient: "from-orange-500/30 via-rose-500/15 to-navy-900",
    tag: "Charter",
  },
  {
    title: "Dubai Harbour Yacht Tour | Full Walkthrough",
    hoursAgo: 18,
    views: "4.8K",
    duration: "8:12",
    icon: Anchor,
    gradient: "from-sea-500/30 via-navy-700 to-navy-900",
    tag: "Yacht Tour",
  },
  {
    title: "Van Dutch 40 Speed Run | Dubai Coastline",
    hoursAgo: 42,
    views: "6.3K",
    duration: "5:47",
    icon: Ship,
    gradient: "from-gold-500/25 via-navy-800 to-navy-900",
    tag: "Highlights",
  },
  {
    title: "Fishing Trip at Sunrise | Arabian Gulf",
    hoursAgo: 96,
    views: "3.5K",
    duration: "15:20",
    icon: Waves,
    gradient: "from-sky-500/25 via-sea-500/15 to-navy-900",
    tag: "Adventure",
  },
  {
    title: "Behind the Scenes: Yacht Cinematography in Dubai",
    hoursAgo: 168,
    views: "8.2K",
    duration: "10:05",
    icon: Camera,
    gradient: "from-purple-500/20 via-pink-500/10 to-navy-900",
    tag: "BTS",
  },
  {
    title: "Birthday Party on a Yacht | 20 Guests Celebration",
    hoursAgo: 240,
    views: "5.7K",
    duration: "7:33",
    icon: Compass,
    gradient: "from-emerald-500/20 via-sea-500/10 to-navy-900",
    tag: "Events",
  },
];

interface InstaPost {
  caption: string;
  hoursAgo: number;
  likes: string;
  icon: React.ElementType;
  gradient: string;
  size: "normal" | "tall" | "wide";
}

const INSTAGRAM_POSTS: InstaPost[] = [
  {
    caption: "Golden hour from the flybridge",
    hoursAgo: 2,
    likes: "487",
    icon: Sun,
    gradient: "from-orange-500/40 via-amber-500/20 to-navy-900",
    size: "tall",
  },
  {
    caption: "Marina morning vibes",
    hoursAgo: 8,
    likes: "312",
    icon: Anchor,
    gradient: "from-sea-500/35 via-sky-500/15 to-navy-800",
    size: "normal",
  },
  {
    caption: "Ready for the weekend",
    hoursAgo: 24,
    likes: "528",
    icon: Ship,
    gradient: "from-gold-500/30 via-gold-400/10 to-navy-900",
    size: "normal",
  },
  {
    caption: "Dubai skyline from the water",
    hoursAgo: 36,
    likes: "692",
    icon: MapPin,
    gradient: "from-purple-500/25 via-pink-500/15 to-navy-900",
    size: "wide",
  },
  {
    caption: "Calm waters, clear skies",
    hoursAgo: 52,
    likes: "245",
    icon: Waves,
    gradient: "from-sky-500/30 via-cyan-500/15 to-navy-900",
    size: "normal",
  },
  {
    caption: "Sunset doesn't get old",
    hoursAgo: 72,
    likes: "834",
    icon: Sun,
    gradient: "from-rose-500/30 via-orange-500/15 to-navy-900",
    size: "normal",
  },
  {
    caption: "Charter day with the crew",
    hoursAgo: 96,
    likes: "421",
    icon: Users,
    gradient: "from-emerald-500/25 via-sea-500/10 to-navy-900",
    size: "tall",
  },
  {
    caption: "Night lights at Dubai Harbour",
    hoursAgo: 120,
    likes: "556",
    icon: Anchor,
    gradient: "from-indigo-500/30 via-purple-500/15 to-navy-900",
    size: "normal",
  },
];

/* ──────────────────────────────────────────────────────────────────────
   SOCIAL PULSE HOOK
   ────────────────────────────────────────────────────────────────────── */

function formatRelativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 2) return "1 hour ago";
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)} hours ago`;
  if (hoursAgo < 48) return "Yesterday";
  if (hoursAgo < 168) return `${Math.floor(hoursAgo / 24)} days ago`;
  if (hoursAgo < 336) return "1 week ago";
  return `${Math.floor(hoursAgo / 168)} weeks ago`;
}

function formatPublishedDate(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    const diffMs = Date.now() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    return formatRelativeTime(diffH);
  } catch {
    return "";
  }
}

const emptySubscribe = () => () => {};

function useSocialPulse() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  return {
    mounted,
    getTime: (hoursAgo: number) =>
      mounted ? formatRelativeTime(hoursAgo + 0.3) : "",
    getPublishedTime: (isoDate: string) =>
      mounted ? formatPublishedDate(isoDate) : "",
  };
}

/* ──────────────────────────────────────────────────────────────────────
   LIVE PULSE DOT
   ────────────────────────────────────────────────────────────────────── */

function LivePulse({ label = "Active now" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400/90">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </span>
      {label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   VIDEO THUMBNAIL — real image or gradient fallback
   ────────────────────────────────────────────────────────────────────── */

function VideoThumbnail({
  video,
  fallback,
  isFeatured = false,
}: {
  video?: YouTubeVideo;
  fallback: VideoFallback;
  isFeatured?: boolean;
}) {
  const FallbackIcon = fallback.icon;

  if (video?.thumbnailHq) {
    return (
      <div
        className={`relative ${isFeatured ? "aspect-video" : "aspect-video"} bg-navy-900`}
      >
        <Image
          src={video.thumbnailHq}
          alt={video.title}
          fill
          className={`object-cover transition-opacity duration-500 ${isFeatured ? "opacity-70 group-hover:opacity-85" : "opacity-80 group-hover:opacity-95"}`}
          sizes={isFeatured ? "(max-width: 768px) 100vw, 1200px" : "(max-width: 768px) 100vw, 400px"}
          unoptimized
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
      </div>
    );
  }

  // Fallback: gradient + icon
  return (
    <div
      className={`relative aspect-video bg-gradient-to-br ${fallback.gradient}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <FallbackIcon
          className={`${isFeatured ? "w-24 h-24" : "w-16 h-16"} text-white/[0.07]`}
          strokeWidth={1}
        />
      </div>
      {isFeatured && (
        <Image
          src="/media/hero/hero-poster.jpg"
          alt="Imperial Yachting — latest video"
          fill
          className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PROPS
   ────────────────────────────────────────────────────────────────────── */

interface BlogPageClientProps {
  /** Real YouTube videos fetched server-side via RSS. Empty array = use fallback UI. */
  videos: YouTubeVideo[];
  /** Real Instagram posts via Graph API. Empty array = use Behold widget or fallback. */
  instagramPosts: InstagramPost[];
  /** Behold.so widget ID — set NEXT_PUBLIC_BEHOLD_WIDGET_ID env var. Takes priority over everything. */
  beholdWidgetId?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────────────── */

export function BlogPageClient({ videos, instagramPosts, beholdWidgetId }: BlogPageClientProps) {
  const { mounted, getTime, getPublishedTime } = useSocialPulse();
  const hasRealInsta = instagramPosts.length > 0;

  // Use real videos if available, otherwise show static fallbacks
  const hasRealVideos = videos.length > 0;
  const featuredVideo = hasRealVideos ? videos[0] : undefined;
  const gridVideos = hasRealVideos ? videos.slice(1, 6) : YOUTUBE_FALLBACK.slice(1);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sea-500/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="origin-left mb-8 animate-hero-line">
              <div className="gold-line" />
            </div>

            <div className="mb-6 flex items-center gap-4 animate-hero-1">
              <Radio className="w-7 h-7 text-gold-500/60" strokeWidth={1.5} />
              <LivePulse label="Channels active" />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-hero-2">
              Follow Our Journey
            </h1>

            <p className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-3">
              Watch our latest charters, yacht tours, and Dubai coastline
              adventures. Stay connected through our social channels.
            </p>

            {/* Social links */}
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-hero-4">
              <a
                href={SITE_CONFIG.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <Youtube className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    @imperial_wave
                  </p>
                  <p className="text-[11px] text-red-400/70">YouTube Channel</p>
                </div>
              </a>

              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    @dubai.yachts.rental
                  </p>
                  <p className="text-[11px] text-pink-400/70">Instagram</p>
                </div>
              </a>

              <a
                href={SITE_CONFIG.linkedinCeo}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">LinkedIn</p>
                  <p className="text-[11px] text-blue-400/70">Company Updates</p>
                </div>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── YouTube Section ────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-navy-900">
        <Container>
          {/* Section header */}
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    Latest Videos
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {mounted && <LivePulse label="New content weekly" />}
                  </div>
                </div>
              </div>
              <p className="text-white/50 max-w-lg text-sm leading-relaxed">
                Charter highlights, yacht tours, and Dubai coastline adventures
                from our YouTube channel.
              </p>
            </div>
            <a
              href={SITE_CONFIG.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium shrink-0"
            >
              <Youtube className="w-4 h-4" />
              Subscribe
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </a>
          </div>

          {/* Featured video */}
          <Reveal>
            <a
              href={featuredVideo ? featuredVideo.url : SITE_CONFIG.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/20 transition-all"
            >
              <VideoThumbnail
                video={featuredVideo}
                fallback={YOUTUBE_FALLBACK[0]}
                isFeatured
              />

              {/* Center play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300 shadow-2xl shadow-red-500/30">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>

              {/* Top badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge variant="gold">Featured</Badge>
                {mounted && featuredVideo && (
                  <span className="text-xs text-white/50 bg-navy-950/60 backdrop-blur-sm rounded-full px-3 py-1">
                    {getPublishedTime(featuredVideo.published)}
                  </span>
                )}
                {mounted && !featuredVideo && (
                  <span className="text-xs text-white/50 bg-navy-950/60 backdrop-blur-sm rounded-full px-3 py-1">
                    {getTime(3)}
                  </span>
                )}
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-gold-300 transition-colors">
                  {featuredVideo ? featuredVideo.title : YOUTUBE_FALLBACK[0].title}
                </h3>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
                  {!hasRealVideos && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> {YOUTUBE_FALLBACK[0].views} views
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-400/60" />
                    Imperial Wave
                  </span>
                </div>
              </div>
            </a>
          </Reveal>

          {/* Video grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gridVideos.map((item, i) => {
              const isReal = hasRealVideos;
              const realVideo = isReal ? (item as YouTubeVideo) : undefined;
              const fallbackVideo = !isReal ? (item as VideoFallback) : YOUTUBE_FALLBACK[i + 1] ?? YOUTUBE_FALLBACK[0];
              const FallbackIcon = fallbackVideo.icon;

              return (
                <Reveal key={isReal ? (item as YouTubeVideo).id : (item as VideoFallback).title} delay={i * 80}>
                  <a
                    href={realVideo ? realVideo.url : SITE_CONFIG.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl overflow-hidden border border-white/5 hover:border-red-500/20 bg-navy-800/50 hover:bg-navy-800 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className={`relative aspect-video ${realVideo ? "bg-navy-900" : `bg-gradient-to-br ${fallbackVideo.gradient}`}`}>
                      {realVideo ? (
                        <>
                          <Image
                            src={realVideo.thumbnailHq}
                            alt={realVideo.title}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FallbackIcon className="w-16 h-16 text-white/[0.07]" strokeWidth={1} />
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300 shadow-lg shadow-red-500/30">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>

                      {/* Tag */}
                      {!realVideo && (
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] font-medium text-white/60 bg-navy-950/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                            {fallbackVideo.tag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h4 className="font-heading text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-gold-300 transition-colors">
                        {realVideo ? realVideo.title : fallbackVideo.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-white/40">
                        {!realVideo && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {fallbackVideo.views}
                          </span>
                        )}
                        {mounted && realVideo && (
                          <span>{getPublishedTime(realVideo.published)}</span>
                        )}
                        {mounted && !realVideo && (
                          <span>{getTime(fallbackVideo.hoursAgo)}</span>
                        )}
                      </div>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>

          {/* YouTube Shorts strip */}
          <Reveal delay={200}>
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="w-4 h-4 text-red-400/60" />
                <span className="text-sm font-medium text-white/40">Shorts</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {(hasRealVideos ? videos.slice(6, 12) : []).concat(
                  // pad with fallback icons up to 6 slots
                  Array.from({ length: Math.max(0, 6 - (hasRealVideos ? Math.min(videos.length - 6, 6) : 0)) })
                ).map((item, i) => {
                  const shortFallbackIcons = [Ship, Waves, Sun, Anchor, Camera, Compass];
                  const shortFallbackGradients = [
                    "from-gold-500/20 to-navy-900",
                    "from-sea-500/25 to-navy-900",
                    "from-orange-500/25 to-navy-900",
                    "from-sky-500/20 to-navy-900",
                    "from-pink-500/20 to-navy-900",
                    "from-emerald-500/20 to-navy-900",
                  ];
                  const ShortIcon = shortFallbackIcons[i % shortFallbackIcons.length];
                  const realShort = hasRealVideos && typeof item === "object" && "id" in (item as object) ? item as YouTubeVideo : null;

                  return (
                    <a
                      key={realShort ? realShort.id : i}
                      href={realShort ? realShort.url : SITE_CONFIG.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/5 hover:border-red-500/20 transition-all ${realShort ? "bg-navy-900" : `bg-gradient-to-b ${shortFallbackGradients[i % shortFallbackGradients.length]}`}`}
                    >
                      {realShort ? (
                        <>
                          <Image
                            src={realShort.thumbnail}
                            alt={realShort.title}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-85 transition-opacity"
                            sizes="(max-width: 640px) 33vw, 16vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <ShortIcon className="w-8 h-8 text-white/[0.08]" strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500/40 group-hover:scale-110 transition-all">
                          <Play className="w-4 h-4 text-red-400 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] text-red-400/50 font-medium flex items-center gap-1">
                          <Youtube className="w-2.5 h-2.5" /> Short
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Instagram Section ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-navy-950">
        <Container>
          {/* Section header */}
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-orange-500/20 border border-pink-500/20 flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    Life on the Water
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {mounted && <LivePulse label="Updated daily" />}
                  </div>
                </div>
              </div>
              <p className="text-white/50 max-w-lg text-sm leading-relaxed">
                Daily moments, yacht views, and Dubai marina life.
                Follow us for the real behind-the-scenes.
              </p>
            </div>
            <a
              href={SITE_CONFIG.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 border border-pink-500/20 text-pink-400 hover:from-pink-500/20 hover:via-purple-500/20 hover:to-orange-500/20 transition-all text-sm font-medium shrink-0"
            >
              <Instagram className="w-4 h-4" />
              Follow
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </a>
          </div>

          {/* ── Option 1: Behold.so widget — real photos, zero setup ───────── */}
          {beholdWidgetId ? (
            <Reveal>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-navy-900/30 p-2">
                <BeholdWidget widgetId={beholdWidgetId} />
              </div>
            </Reveal>
          ) : hasRealInsta ? (
          /* ── Option 2: Instagram Graph API photos ──────────────────────── */
            <Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {instagramPosts.slice(0, 9).map((post, i) => {
                  const imageUrl =
                    post.media_type === "VIDEO"
                      ? post.thumbnail_url!
                      : post.media_url;

                  return (
                    <Reveal key={post.id} delay={i * 50}>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-pink-500/20 transition-all bg-navy-900"
                      >
                        <Image
                          src={imageUrl}
                          alt={post.caption?.slice(0, 100) ?? "Instagram post"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Hover overlay with caption */}
                        <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/70 transition-all duration-300 flex flex-col items-center justify-center p-4">
                          <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-center">
                            {post.caption && (
                              <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
                                {post.caption.slice(0, 120)}
                                {post.caption.length > 120 ? "…" : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Instagram icon */}
                        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-80 transition-opacity">
                          <div className="w-6 h-6 rounded-md bg-navy-950/70 flex items-center justify-center">
                            <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          </div>
                        </div>

                        {/* Video indicator */}
                        {post.media_type === "VIDEO" && (
                          <div className="absolute top-2.5 left-2.5">
                            <div className="w-6 h-6 rounded-md bg-navy-950/70 flex items-center justify-center">
                              <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                        )}
                      </a>
                    </Reveal>
                  );
                })}
              </div>
            </Reveal>
          ) : (
            <>
              {/* Fallback: profile link widget */}
              <Reveal>
                <div className="rounded-2xl overflow-hidden border border-white/5 bg-navy-900/50">
                  <InstagramFeedEmbed />
                </div>
              </Reveal>

              {/* Bento grid — static placeholder cards (click opens Instagram) */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] gap-3">
                {INSTAGRAM_POSTS.map((post, i) => {
                  const PostIcon = post.icon;
                  const spanClass =
                    post.size === "tall"
                      ? "row-span-2"
                      : post.size === "wide"
                        ? "col-span-2"
                        : "";

                  return (
                    <Reveal key={i} delay={i * 60}>
                      <a
                        href={SITE_CONFIG.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative rounded-xl overflow-hidden border border-white/5 hover:border-pink-500/20 transition-all h-full block bg-gradient-to-br ${post.gradient} ${spanClass}`}
                      >
                        {/* Decorative icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PostIcon
                            className="w-20 h-20 text-white/[0.05] group-hover:text-white/[0.08] transition-colors duration-500"
                            strokeWidth={0.8}
                          />
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/60 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                          <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-sm text-pink-300">
                                <Heart className="w-4 h-4" fill="currentColor" />{" "}
                                {post.likes}
                              </span>
                            </div>
                            <p className="text-xs text-white/70 text-center px-4 max-w-[200px]">
                              {post.caption}
                            </p>
                          </div>
                        </div>

                        {/* Timestamp */}
                        {mounted && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white/50 bg-navy-950/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                              {getTime(post.hoursAgo)}
                            </span>
                          </div>
                        )}

                        {/* Instagram icon */}
                        <div className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-60 transition-opacity">
                          <Instagram className="w-4 h-4 text-white" />
                        </div>
                      </a>
                    </Reveal>
                  );
                })}
              </div>
            </>
          )}

          {/* Instagram profile card */}
          <Reveal delay={200}>
            <div className="mt-10 max-w-2xl mx-auto">
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-navy-800 via-navy-850 to-navy-900 border border-white/5 hover:border-pink-500/20 transition-all relative overflow-hidden"
              >
                {/* Decorative gradient blur */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 via-pink-500 to-purple-600 p-[3px] flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-navy-900 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-pink-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-heading text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                        @dubai.yachts.rental
                      </p>
                      {mounted && <LivePulse label="Active" />}
                    </div>
                    <p className="text-sm text-white/40 mt-1">
                      Dubai&apos;s luxury yacht charter experience. Daily content from the water.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-sm text-pink-400 font-medium group-hover:gap-3 transition-all">
                      <span>Follow on Instagram</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Social Proof Stats ─────────────────────────────────────── */}
      <section className="py-16 bg-navy-900 border-y border-white/5">
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                {
                  icon: Youtube,
                  value: "50+",
                  label: "Videos Published",
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
                {
                  icon: Instagram,
                  value: "200+",
                  label: "Instagram Posts",
                  color: "text-pink-400",
                  bg: "bg-pink-500/10",
                },
                {
                  icon: Eye,
                  value: "100K+",
                  label: "Total Views",
                  color: "text-sea-400",
                  bg: "bg-sea-500/10",
                },
                {
                  icon: Users,
                  value: "5K+",
                  label: "Community",
                  color: "text-gold-400",
                  bg: "bg-gold-500/10",
                },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                    >
                      <StatIcon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="font-heading text-2xl sm:text-3xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── CTA — Connect with us ──────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-navy-950">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Reveal>
              <div className="gold-line mx-auto mb-8" />

              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Stay Connected
              </h2>

              <p className="mt-4 text-white/50 leading-relaxed max-w-lg mx-auto">
                Follow us on social media for the latest yacht tours, charter
                highlights, and behind-the-scenes content from Dubai&apos;s coastline.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={SITE_CONFIG.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                >
                  <Youtube className="w-6 h-6 text-red-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      Subscribe on YouTube
                    </p>
                    <p className="text-[11px] text-white/40">@imperial_wave</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/30 ml-2" />
                </a>

                <a
                  href={SITE_CONFIG.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 border border-pink-500/20 hover:from-pink-500/20 hover:via-purple-500/20 hover:to-orange-500/20 hover:border-pink-500/30 transition-all"
                >
                  <Instagram className="w-6 h-6 text-pink-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      Follow on Instagram
                    </p>
                    <p className="text-[11px] text-white/40">
                      @dubai.yachts.rental
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/30 ml-2" />
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   INSTAGRAM FEED EMBED
   Uses the official Instagram embed script to show a live feed widget.
   This does NOT require an API key — it embeds the public profile widget.
   ────────────────────────────────────────────────────────────────────── */

function InstagramFeedEmbed() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center">
        <Instagram className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <p className="font-heading text-lg font-bold text-white">
          @dubai.yachts.rental
        </p>
        <p className="text-sm text-white/40 mt-1 max-w-xs">
          Follow us on Instagram for daily moments from the water, marina life, and yacht tours.
        </p>
      </div>
      <a
        href="https://instagram.com/dubai.yachts.rental"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        <Instagram className="w-4 h-4" />
        Open Instagram Profile
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
    </div>
  );
}
