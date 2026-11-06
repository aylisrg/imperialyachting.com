import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (p: { src: string; alt: string }) => <img src={p.src} alt={p.alt} />,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function renderWith(base: string | undefined) {
  // jsdom has no matchMedia; report reduced motion so no clip ever loads in tests.
  window.matchMedia = ((q: string) => ({ matches: true, media: q })) as unknown as typeof window.matchMedia;
  vi.stubEnv("NEXT_PUBLIC_CLIP_BASE_URL", base as string);
  vi.resetModules();
  const { HomeVideo } = await import("../HomeVideo");
  return render(<HomeVideo clip="vd40-aerial" alt="Van Dutch 40" />);
}

describe("HomeVideo clip base guard", () => {
  it("renders only the poster, no <video>/<source>, when NEXT_PUBLIC_CLIP_BASE_URL is unset", async () => {
    const { container } = await renderWith("");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/media/home/posters/vd40-aerial.jpg");
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("source")).toBeNull();
  });

  it("keeps the <video> element when NEXT_PUBLIC_CLIP_BASE_URL is set", async () => {
    const { container } = await renderWith("/videos");
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("video")).not.toBeNull();
  });
});

describe("clipWidth — the clip fits the frame it fills (IY-1680)", () => {
  it("a full-screen phone frame needs 1920: the 16:9 clip is cropped to the frame height", async () => {
    const { clipWidth } = await import("../HomeVideo");
    expect(clipWidth({ width: 390, height: 844 }, 3)).toBe(1920);
  });
  it("a small tile on a phone stays 960", async () => {
    const { clipWidth } = await import("../HomeVideo");
    expect(clipWidth({ width: 300, height: 170 }, 3)).toBe(960);
  });
  it("a laptop hero takes 1920", async () => {
    const { clipWidth } = await import("../HomeVideo");
    expect(clipWidth({ width: 1440, height: 810 }, 1)).toBe(1920);
  });
  it("a portrait clip in a portrait tile is measured by its own aspect", async () => {
    const { clipWidth } = await import("../HomeVideo");
    expect(clipWidth({ width: 400, height: 500 }, 2, 1920 / 2398)).toBe(960);
    expect(clipWidth({ width: 400, height: 500 }, 2)).toBe(1920);
  });
});
