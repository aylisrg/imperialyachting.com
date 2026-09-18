import { describe, it, expect } from "vitest";
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
