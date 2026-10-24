import { describe, it, expect, vi } from "vitest";

// The page renders inside WakePage, whose font loader only runs under Next.
vi.mock("next/font/google", () => ({ Cormorant_Garamond: () => ({ variable: "font-serif", className: "" }) }));
import { generateStaticParams } from "../[slug]/page";
import { posts } from "@/data/posts";

describe("blog [slug] generateStaticParams", () => {
  it("returns one param entry per post, matching post slugs", () => {
    const params = generateStaticParams();
    const paramSlugs = params.map((p) => p.slug).sort();
    const postSlugs = posts.map((p) => p.slug).sort();
    expect(paramSlugs).toEqual(postSlugs);
  });
});
