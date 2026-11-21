import { existsSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DayCharterCards, ExtendedCharters } from "../DayCharters";
import { fullDayCharters, getFullDayCharter, publicCharterPricing, structuredCharterPricing } from "@/lib/day-charters";

afterEach(cleanup);

describe("ordinary charter packages", () => {
  it("shows all fixed VAT-inclusive rates, duration terms and separate inquiry links", () => {
    render(<DayCharterCards fleetSlugs={{ evo4: "evo-43" }} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(fullDayCharters.map(({ price, fourOutings }) => [price, fourOutings])).toEqual([
      [7000, 26600], [15000, 57000], [10500, 39900], [14000, 53200],
    ]);
    for (const [index, yacht] of fullDayCharters.entries()) {
      const card = within(cards[index]);
      expect(card.getByRole("heading", { name: yacht.name })).toBeInTheDocument();
      for (const amount of [yacht.price, yacht.fourOutings]) {
        expect(card.getByText(`AED ${amount.toLocaleString("en-US")}`)).toBeInTheDocument();
      }
      expect(card.getAllByText("VAT included · per yacht")).toHaveLength(2);
      expect(card.getByText(/non-exclusive; holidays excluded/i)).toBeInTheDocument();
      expect(card.getByText(/no hourly promo stacking/i)).toBeInTheDocument();
      expect(card.getByRole("img", { name: yacht.name })).toBeInTheDocument();
      expect(existsSync(`public${yacht.image}`)).toBe(true);
      const link = (match: RegExp) => new URL(card.getByRole<HTMLAnchorElement>("link", { name: match }).href);
      expect(link(/check day availability/i).hostname).toBe("wa.me");
      expect(link(/check day availability/i).searchParams.get("text")).toContain(yacht.hours ? "8-hour private charter" : "private day charter");
      expect(link(/ask about four outings/i).searchParams.get("text")).toContain("within 30 days");
    }
    expect(within(cards[1]).getByRole("link", { name: "View EVO 43" })).toHaveAttribute("href", "/fleet/evo-43");
    expect(within(cards[1]).queryByText(/8 hours|eight hours/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/4\+1|B2B|From AED/i)).not.toBeInTheDocument();
    expect(getFullDayCharter("evo-43")?.hours).toBeNull();
    expect(getFullDayCharter("van-dutch-40")?.price).toBe(7000);
  });

  it("preserves public hourly rows and strips unrelated and partner rates from package projections", () => {
    const original = [{ season: "Winter", period: "Winter", hourly: 1000, daily: 13000, weekly: 45000, monthly: 95000, hourlyB2B: 3131, dailyB2B: 3132, weeklyB2B: 3133, monthlyB2B: 3134 }];
    const projected = publicCharterPricing({ slug: "vd-40", pricing: original });
    expect(projected.map(({ hourly, daily, weekly, monthly }) => [hourly, daily, weekly, monthly])).toEqual([[1000, null, null, null], [null, 7000, null, null]]);
    expect(JSON.stringify(projected)).not.toMatch(/B2B|313[1-4]/);
    expect(structuredCharterPricing({ slug: "vd-40", pricing: original })).toEqual(projected.slice(0, 1));
    expect(original[0].daily).toBe(13000);
    expect(JSON.stringify(publicCharterPricing({ slug: "another-yacht", pricing: original }))).not.toMatch(/B2B|313[1-4]/);
  });

  it("routes overnight, 24h, 7-day and exclusive 30-day inquiries separately without price promises", () => {
    render(<ExtendedCharters />);
    const links = screen.getAllByRole<HTMLAnchorElement>("link");
    expect(links.map((link) => new URL(link.href).searchParams.get("text"))).toEqual([
      expect.stringContaining("overnight charter on Moneta"),
      expect.stringContaining("full 24-hour charter on Moneta"),
      expect.stringContaining("7-day private charter"),
      expect.stringContaining("exclusive 30-day private charter"),
    ]);
    expect(screen.queryByText(/AED/)).not.toBeInTheDocument();
  });
});
