import { existsSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DayCharterCards, ExtendedCharters } from "../DayCharters";
import { fullDayCharters, getFullDayCharter } from "@/lib/day-charters";

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
