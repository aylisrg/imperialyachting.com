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
