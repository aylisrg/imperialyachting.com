import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { posts } from "@/data/posts";
import { isClipId } from "@/data/clips";
import { isWakeRoute } from "@/components/wake/routes";
import { POST_CLIPS, POST_FALLBACK_CLIP, postClip, postCtaClip, formatPostDate } from "@/components/wake/postClips";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");

describe("Journal (Wake redesign)", () => {
  it("is a Wake route, posts included", () => {
    expect(isWakeRoute("/blog")).toBe(true);
    expect(isWakeRoute(`/blog/${posts[0].slug}`)).toBe(true);
  });

  it("gives every post its own manifest clip, so none repeats on the index", () => {
    const clips = posts.map((p) => postClip(p.slug));
    for (const c of [...clips, POST_FALLBACK_CLIP]) expect(isClipId(c), c).toBe(true);
    expect(new Set(clips).size).toBe(posts.length);
    for (const p of posts) expect(POST_CLIPS[p.slug], p.slug).toBeDefined();
  });

  it("page sources name only manifest clips", () => {
    for (const f of ["WakeBlog.tsx", "[slug]/WakePost.tsx"]) {
      for (const m of read(f).matchAll(/clip="([a-z0-9-]+)"/g)) expect(isClipId(m[1]), `${f}: ${m[1]}`).toBe(true);
    }
  });

  it("formats dates the same on server and client (UTC)", () => {
    expect(formatPostDate("2026-08-17")).toBe("August 17, 2026");
  });
});

describe("post clips never repeat on one page (design review #46)", () => {
  // Same pick as src/app/blog/[slug]/page.tsx.
  const relatedOf = (slug: string) => posts.filter((p) => p.slug !== slug).slice(0, 2).map((p) => p.slug);

  for (const p of posts) {
    it(`/blog/${p.slug}: hero, related cards and CTA are all different clips`, () => {
      const related = relatedOf(p.slug);
      const clips = [postClip(p.slug), ...related.map(postClip), postCtaClip(p.slug, related).clip];
      expect(clips.filter((c, i) => clips.indexOf(c) !== i)).toEqual([]);
    });
  }

  it("/blog: every card has its own clip", () => {
    const clips = posts.map((p) => postClip(p.slug));
    expect(new Set(clips).size).toBe(clips.length);
  });
});

describe("posts name the real berths (Evo 43 lies at Marasi Bay)", () => {
  const text = JSON.stringify(posts);
  it("never says the whole fleet is at Dubai Harbour", () => {
    expect(text).not.toMatch(/All Imperial Yachting vessels are berthed at Dubai Harbour|entire fleet is based at Dubai Harbour/);
    expect(text).toContain("The EVO 43 is berthed at Marasi Bay.");
  });
});
