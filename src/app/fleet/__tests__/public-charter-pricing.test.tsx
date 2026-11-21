import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Yacht } from "@/types/yacht";
import YachtDetailPage from "../[slug]/page";
import FleetPage from "../page";

vi.mock("@/components/wake/font", () => ({ cormorant: { variable: "mock-font" } }));
vi.mock("@/lib/yachts-db", () => ({
  fetchYachtBySlug: async () => yacht,
  fetchAllYachts: async () => [yacht],
}));

const yacht: Yacht = {
  slug: "vd-40", name: "VanDutch 40", tagline: "A day cruiser", description: "A synthetic yacht fixture.",
  builder: "VanDutch", year: 2014, length: { feet: 40, meters: 12 }, capacity: 10, location: "Dubai Harbour",
  images: ["/media/home/posters/vd40-aerial.jpg"], heroImage: "/media/home/posters/vd40-aerial.jpg", specs: [], amenities: [], included: [],
  featured: false, youtubeShorts: [], youtubeVideo: "", showVideos: false,
  dailyRules: "Legacy daily rule", weeklyRules: "Legacy weekly rule",
  pricing: [{ season: "Winter", period: "Winter", hourly: 1000, daily: 13000, weekly: 45000, monthly: 95000,
    hourlyB2B: 83831, dailyB2B: 83832, weeklyB2B: 83833, monthlyB2B: 83834 }],
};

describe("ordinary charter rates on public fleet surfaces", () => {
  it("renders fixed rates without legacy or partner figures in public HTML and JSON-LD", async () => {
    const detail = renderToStaticMarkup(await YachtDetailPage({ params: Promise.resolve({ slug: yacht.slug }) }));
    const fleet = renderToStaticMarkup(await FleetPage());
    expect(detail).toContain("AED 7,000");
    expect(detail).toContain("AED 26,600");
    expect(detail).toContain("AED 1,000");
    for (const html of [detail, fleet]) {
      expect(html).not.toMatch(/B2B|83,?83[1-4]|13,?000|45,?000|95,?000|Legacy (daily|weekly) rule/);
      const data = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => m[1]);
      expect(data.length).toBeGreaterThan(0);
      expect(data.join()).not.toMatch(/"price":(7000|26600)/);
    }
  });
});
