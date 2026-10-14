import Link from "next/link";
import type { BlogPost } from "@/data/posts";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeFaq, WakeHead, WakeHero, WakeMedia, WakeSection } from "@/components/wake/blocks";
import { formatPostDate, postClip } from "@/components/wake/postClips";

// Layout: Wake redesign (issue #46, design/pages/blog-post @ c0f9dc1). The
// article text, FAQ and related posts are the post's own data.

export function WakePost({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  return (
    <WakePage>
      <WakeHero
        clip={postClip(post.slug)}
        alt={post.title}
        crumb={`Home / Journal / ${post.category}`}
        title={post.title}
        lead={post.description}
      >
        <p className="cap">{formatPostDate(post.datePublished)} · {post.readingMinutes} min read · By {post.author}</p>
      </WakeHero>

      <WakeSection>
        <article className="w-post">
          {post.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="serif">{s.heading}</h2>
              {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              {s.bullets?.length ? <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul> : null}
            </section>
          ))}
        </article>
      </WakeSection>

      {post.faq?.length ? <WakeFaq items={post.faq} /> : null}

      <WakeCta clip="vd40-aerial" alt="Van Dutch 40 from above" title={<>Ready to book your<br />own charter?</>}>
        <Link className="btn" href="/fleet">View the Fleet</Link>
        <a className="btn o" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        <p className="sub">Browse our owned fleet at Dubai Harbour and get a same-day response from our charter team.</p>
      </WakeCta>

      {related.length ? (
        <WakeSection>
          <WakeHead title={<>Related<br />articles.</>} />
          <div className="w-dgrid">
            {related.map((r) => (
              <Link className="w-dcard" href={`/blog/${r.slug}`} key={r.slug}>
                <WakeMedia clip={postClip(r.slug)} alt={r.title} />
                <span className="cap w-kicker">{r.category} · {r.readingMinutes} min</span>
                <h3 className="serif">{r.title}</h3>
                <p>{r.description}</p>
              </Link>
            ))}
          </div>
        </WakeSection>
      ) : null}
    </WakePage>
  );
}
