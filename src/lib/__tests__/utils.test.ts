import { describe, it, expect } from "vitest";
import { getEmbedUrl, cn } from "../utils";

describe("getEmbedUrl", () => {
  it("converts YouTube watch URL to embed URL", () => {
    expect(getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
  });

  it("converts YouTube short URL (youtu.be) to embed URL", () => {
    expect(getEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
  });

  it("converts YouTube Shorts URL to embed URL", () => {
    expect(getEmbedUrl("https://www.youtube.com/shorts/abcDEF_123")).toBe(
      "https://www.youtube-nocookie.com/embed/abcDEF_123"
    );
  });

  it("converts Vimeo URL to embed URL", () => {
    expect(getEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789"
    );
  });

  it("handles YouTube URL with extra query params", () => {
    expect(
      getEmbedUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
      )
    ).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("returns null for empty string", () => {
    expect(getEmbedUrl("")).toBeNull();
  });

  it("returns null for unrecognized URL", () => {
    expect(getEmbedUrl("https://example.com/video/123")).toBeNull();
  });

  it("returns null for random text", () => {
    expect(getEmbedUrl("not a url")).toBeNull();
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});
