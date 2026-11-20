import { existsSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DayCharterCards, ExtendedCharters } from "../DayCharters";
import { fullDayCharters, fullDayOffer, getFullDayCharter } from "@/lib/day-charters";

afterEach(cleanup);

describe("full-day charter offer", () => {
  it("shows the three intended yacht prices and local photo assets", () => {
    render(<DayCharterCards />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    for (const [index, yacht] of fullDayCharters.entries()) {
      const card = within(cards[index]);
      expect(card.getByRole("heading", { name: yacht.name })).toBeInTheDocument();
      expect(card.getByText(`AED ${yacht.price.toLocaleString("en-US")}`)).toBeInTheDocument();
      expect(card.getByText("VAT included · per yacht")).toBeInTheDocument();
      expect(card.getByRole("img", { name: yacht.name })).toBeInTheDocument();
      expect(existsSync(`public${yacht.image}`)).toBe(true);
      const details = card.getByText("What’s included").closest("details");
      expect(details?.open).toBe(false);
      expect(details?.textContent).toContain("standard Dubai Harbour route");
      const inquiry = new URL((card.getByRole("link", { name: `Check availability for ${yacht.name}` }) as HTMLAnchorElement).href);
      expect(inquiry.hostname).toBe("wa.me");
      expect(inquiry.searchParams.get("text")).toContain(`8-hour private charter on ${yacht.name}`);
    }
    expect(getFullDayCharter("evo-43")).toBeUndefined();
    expect(getFullDayCharter("van-dutch-40")?.price).toBe(7500);
  });

  it("shows a lower qualifying eight-hour promotion without hiding the standard prices", () => {
    render(<DayCharterCards hourlyRates={{ "vd-40": 1000, maybach: 1500, "monte-carlo-6": 2000 }} />);
    const cards = screen.getAllByRole("article");
    for (const [index, [promo, standard]] of [[7000, 7500], [10500, 11500], [14000, 15000]].entries()) {
      const card = within(cards[index]);
      expect(card.getByText(`From AED ${promo.toLocaleString("en-US")}`)).toBeInTheDocument();
      expect(card.getByText(`4+1 on qualifying dates · standard AED ${standard.toLocaleString("en-US")}`)).toBeInTheDocument();
      const link = card.getByRole<HTMLAnchorElement>("link", { name: /Check availability for/ });
      expect(new URL(link.href).searchParams.get("text")).toContain(`qualifying AED ${promo.toLocaleString("en-US")} promotion (VAT included)`);
    }
  });

  it("uses the exact standard rates when the promotion is off, data is absent, or it costs more", () => {
    for (const [hourly, regular] of [[1000, 7500], [1500, 11500], [2000, 15000]]) {
      expect(fullDayOffer(regular, hourly, false)).toEqual({ amount: regular, standardAmount: regular, promotional: false });
    }
    expect(fullDayOffer(7500, null)).toEqual({ amount: 7500, standardAmount: 7500, promotional: false });
    expect(fullDayOffer(7500, 1200).amount).toBe(7500);
  });

  it("routes overnight, 24-hour and extended inquiries separately without price promises", () => {
    render(<ExtendedCharters />);
    const links = screen.getAllByRole<HTMLAnchorElement>("link");
    expect(links.map((link) => new URL(link.href).searchParams.get("text"))).toEqual([
      expect.stringContaining("overnight charter on Moneta"),
      expect.stringContaining("full 24-hour charter on Moneta"),
      expect.stringContaining("7- or 30-day private charter"),
    ]);
    expect(screen.queryByText(/AED/)).not.toBeInTheDocument();
  });
});
