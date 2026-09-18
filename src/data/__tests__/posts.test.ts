import { describe, it, expect } from "vitest";
import { posts } from "../posts";

function countWords(post: (typeof posts)[number]): number {
  let words = 0;
  words += post.title.split(/\s+/).length;
  words += post.description.split(/\s+/).length;
  for (const section of post.sections) {
    words += section.heading.split(/\s+/).length;
    for (const p of section.paragraphs) {
      words += p.split(/\s+/).length;
    }
    if (section.bullets) {
      for (const b of section.bullets) {
        words += b.split(/\s+/).length;
      }
    }
  }
  if (post.faq) {
    for (const item of post.faq) {
      words += item.question.split(/\s+/).length;
      words += item.answer.split(/\s+/).length;
    }
  }
  return words;
}

describe("static blog posts data", () => {
  it("contains exactly 6 posts", () => {
    expect(posts).toHaveLength(6);
  });

  it("has unique slugs", () => {
    const slugs = posts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all slugs are URL-safe kebab-case", () => {
    for (const post of posts) {
      expect(post.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("has required string fields for every post", () => {
    for (const post of posts) {
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.author).toBeTruthy();
      expect(post.category).toBeTruthy();
    }
  });

  it("has valid ISO datePublished and dateModified", () => {
    for (const post of posts) {
      expect(new Date(post.datePublished).toString()).not.toBe("Invalid Date");
      expect(new Date(post.dateModified).toString()).not.toBe("Invalid Date");
      expect(post.datePublished).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
      );
      expect(post.dateModified).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
      );
    }
  });

  it("dates fall within August–September 2026", () => {
    for (const post of posts) {
      const d = new Date(post.datePublished);
      expect(d.getUTCFullYear()).toBe(2026);
      expect([7, 8]).toContain(d.getUTCMonth()); // 7 = August, 8 = September
    }
  });

  it("every post has at least 500 words of substantive content", () => {
    for (const post of posts) {
      expect(countWords(post)).toBeGreaterThanOrEqual(500);
    }
  });

  it("every post has at least 3 sections with content", () => {
    for (const post of posts) {
      expect(post.sections.length).toBeGreaterThanOrEqual(3);
      for (const section of post.sections) {
        expect(section.heading).toBeTruthy();
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });

  it("author is Imperial Yachting Team for all posts", () => {
    for (const post of posts) {
      expect(post.author).toBe("Imperial Yachting Team");
    }
  });

  it("readingMinutes is a positive number for every post", () => {
    for (const post of posts) {
      expect(post.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("includes the expected target slugs", () => {
    const slugs = posts.map((p) => p.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "yacht-rental-dubai-price-guide-2026",
        "how-many-hours-to-book-a-yacht-in-dubai",
        "dubai-harbour-vs-dubai-marina-yacht-departure",
        "birthday-party-on-a-yacht-in-dubai-checklist",
        "whats-included-in-a-yacht-charter-and-extras",
        "book-a-yacht-in-dubai-with-chatgpt-or-claude",
      ])
    );
  });

  it("MCP article mentions the connector URL and /ai", () => {
    const post = posts.find(
      (p) => p.slug === "book-a-yacht-in-dubai-with-chatgpt-or-claude"
    );
    expect(post).toBeDefined();
    const allText = JSON.stringify(post);
    expect(allText).toContain("imperialyachting.com/api/mcp");
    expect(allText).toContain("/ai");
  });
});
