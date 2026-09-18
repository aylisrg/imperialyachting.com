"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Youtube,
  Instagram,
  Play,
  ExternalLink,
  Eye,
  Users,
  Radio,
  MapPin,
  Anchor,
  Waves,
  Sun,
  Ship,
  Linkedin,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { BeholdWidget } from "@/components/instagram/BeholdWidget";
import { SITE_CONFIG } from "@/lib/constants";
import type { YouTubeVideo } from "@/lib/youtube";
import type { InstagramPost } from "@/lib/instagram";

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
  isFeatured = false,
}: {
  video: YouTubeVideo;
  isFeatured?: boolean;
}) {
  return (
    <div className="relative aspect-video bg-navy-900">
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

/* ──────────────────────────────────────────────────────────────────────
   EMPTY VIDEO STATE — shown honestly when the YouTube feed is empty
   ────────────────────────────────────────────────────────────────────── */

function EmptyVideoState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-navy-800/40 p-12 text-center">
      <Youtube className="w-12 h-12 text-red-400/40 mx-auto mb-6" strokeWidth={1.5} />
      <h3 className="font-heading text-xl font-bold text-white">
        New videos are on the way
      </h3>
      <p className="mt-3 text-white/50 max-w-md mx-auto leading-relaxed">
        We&apos;re between uploads right now. Head over to our YouTube channel
        for our full library of charter highlights and yacht tours.
      </p>
      <a
        href={SITE_CONFIG.youtube}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
      >
        <Youtube className="w-4 h-4" />
        Visit @imperial_wave
        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
      </a>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PROPS
   ────────────────────────────────────────────────────────────────────── */

interface BlogPageClientProps {
  videos: YouTubeVideo[];
  instagramPosts: InstagramPost[];
}

/* ──────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────────────── */

export function BlogPageClient({ videos, instagramPosts }: BlogPageClientProps) {
  const { mounted, getPublishedTime } = useSocialPulse();
  const hasRealVideos = videos.length > 0;
  const featuredVideo = hasRealVideos ? videos[0] : undefined;
  const gridVideos = hasRealVideos ? videos.slice(1, 6) : [];
  const shortVideos = hasRealVideos ? videos.slice(6, 12) : [];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
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

          {hasRealVideos && featuredVideo ? (
            <>
              {/* Featured video */}
              <Reveal>
                <a
                  href={featuredVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/20 transition-all"
                >
                  <VideoThumbnail video={featuredVideo} isFeatured />

                  {/* Center play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300 shadow-2xl shadow-red-500/30">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Top badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge variant="gold">Featured</Badge>
                    {mounted && (
                      <span className="text-xs text-white/50 bg-navy-950/60 backdrop-blur-sm rounded-full px-3 py-1">
                        {getPublishedTime(featuredVideo.published)}
                      </span>
                    )}
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-gold-300 transition-colors">
                      {featuredVideo.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-400/60" />
                        Imperial Wave
                      </span>
                    </div>
                  </div>
                </a>
              </Reveal>

              {/* Video grid */}
              {gridVideos.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridVideos.map((video, i) => (
                    <Reveal key={video.id} delay={i * 80}>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-xl overflow-hidden border border-white/5 hover:border-red-500/20 bg-navy-800/50 hover:bg-navy-800 transition-all"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-navy-900">
                          <Image
                            src={video.thumbnailHq}
                            alt={video.title}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />

                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300 shadow-lg shadow-red-500/30">
                              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="font-heading text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-gold-300 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2.5 text-xs text-white/40">
                            {mounted && <span>{getPublishedTime(video.published)}</span>}
                          </div>
                        </div>
                      </a>
                    </Reveal>
                  ))}
                </div>
              )}

              {/* YouTube Shorts strip */}
              {shortVideos.length > 0 && (
                <Reveal delay={200}>
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Youtube className="w-4 h-4 text-red-400/60" />
                      <span className="text-sm font-medium text-white/40">Shorts</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {shortVideos.map((short) => (
                        <a
                          key={short.id}
                          href={short.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/5 hover:border-red-500/20 transition-all bg-navy-900"
                        >
                          <Image
                            src={short.thumbnail}
                            alt={short.title}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-85 transition-opacity"
                            sizes="(max-width: 640px) 33vw, 16vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
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
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </>
          ) : (
            <Reveal>
              <EmptyVideoState />
            </Reveal>
          )}
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

          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-navy-900/30 p-2">
              <BeholdWidget />
            </div>
          </Reveal>

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
