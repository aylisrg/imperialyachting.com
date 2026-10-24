import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/posts";
import type { YouTubeVideo } from "@/lib/youtube";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeMedia, WakeSection } from "@/components/wake/blocks";
import { formatPostDate, postClip } from "@/components/wake/postClips";

// Layout: Wake redesign (issue #46, design/pages/blog @ c0f9dc1). Posts from
// src/data/posts.ts; videos are the latest from the YouTube channel, as on the
// live page, and the section says so plainly when there are none.

export function WakeBlog({ posts, videos }: { posts: BlogPost[]; videos: YouTubeVideo[] }) {
  return (
    <WakePage>
      <WakeHero
        clip="harbour-traffic"
        alt="Yacht traffic at Dubai Harbour"
        crumb="Home / Journal"
        title="Journal."
        lead="Practical guides on yacht charter pricing, itineraries, and events in Dubai, plus yacht tours and highlights from Imperial Yachting."
      />

      <WakeSection>
        <WakeHead title={<>Guides &amp;<br />articles.</>}>
          Practical, specific answers to the questions guests ask us most: pricing, itineraries, events, and how to book with an AI assistant.
        </WakeHead>
        <div className="w-dgrid">
          {posts.map((p) => (
            <Link className="w-dcard" href={`/blog/${p.slug}`} key={p.slug}>
              <WakeMedia clip={postClip(p.slug)} alt={p.title} />
              <span className="cap w-kicker">{p.category} · {formatPostDate(p.datePublished)} · {p.readingMinutes} min</span>
              <h3 className="serif">{p.title}</h3>
              <p>{p.description}</p>
            </Link>
          ))}
        </div>
      </WakeSection>

      <WakeSection tone="light" id="videos">
        <WakeHead title="Videos.">Yacht tours, charter highlights and behind-the-scenes from our YouTube channel.</WakeHead>
        {videos.length ? (
          <div className="w-dgrid">
            {videos.map((v) => (
              <a className="w-dcard" href={v.url} target="_blank" rel="noopener noreferrer" key={v.id}>
                <div className="w-media w-video-thumb">
                  <Image src={v.thumbnailHq} alt={v.title} fill sizes="(max-width:768px) 100vw, 33vw" className="w-cover" />
                </div>
                <span className="cap w-kicker">YouTube · {formatPostDate(v.published)}</span>
                <h3 className="serif">{v.title}</h3>
              </a>
            ))}
          </div>
        ) : (
          <div className="w-empty"><p>New videos are on the way.</p></div>
        )}
        <p><a className="btn o" href={SITE_CONFIG.youtube} target="_blank" rel="noopener noreferrer">Open the channel</a></p>
      </WakeSection>

      <WakeCta clip="route-canal" alt="Cruising the Dubai Water Canal" title={<>Read less.<br />Sail more.</>}>
        <Link className="btn" href="/fleet">View the fleet</Link>
        <a className="btn o" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
      </WakeCta>
    </WakePage>
  );
}
