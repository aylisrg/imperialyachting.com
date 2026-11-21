import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NewYearsEveCharterPage from "./page";
import { newYearsEveOffers, showNewYearsEveInquiry } from "@/lib/new-year-charters";

vi.mock("@/components/wake/font", () => ({ cormorant: { variable: "mock-font" } }));

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("New Year's Eve 2026 inquiry only", () => {
  it("shows only the fixed gross public offers and five-hour inquiries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-01T12:00:00Z"));
    const { container } = render(<NewYearsEveCharterPage />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(newYearsEveOffers.map(({ amount }) => amount)).toEqual([14900, 18900, 19900, 29900]);
    for (const [index, offer] of newYearsEveOffers.entries()) {
      const card = within(cards[index]);
      expect(card.getByRole("heading", { name: offer.name })).toBeInTheDocument();
      expect(card.getByText(`AED ${offer.amount.toLocaleString("en-US")}`)).toBeInTheDocument();
      expect(card.getByText("VAT included · per yacht")).toBeInTheDocument();
      const link = card.getByRole<HTMLAnchorElement>("link", { name: /Enquire about New Year’s Eve/ });
      const url = new URL(link.href);
      expect(url.hostname).toBe("wa.me");
      expect(url.searchParams.get("text")).toContain("five-hour New Year's Eve private charter");
      expect(url.searchParams.get("text")).toContain("31 December 2026 – 1 January 2027");
    }
    expect(screen.getByText(/No specific fireworks view is guaranteed/)).toBeInTheDocument();
    expect(screen.getByText(/4\+1 hourly promotion does not apply/)).toBeInTheDocument();
    expect(screen.getByText("Dinner and decorations quoted separately")).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/AED (12,000|15,000|16,000|24,000)|b2b|\/api\/booking|checkout|InStock/i);
  });

  it("closes enquiries at 2027 midnight Dubai time and does not show stale rates", () => {
    expect(showNewYearsEveInquiry(new Date("2026-12-31T19:59:59Z"))).toBe(true);
    expect(showNewYearsEveInquiry(new Date("2026-12-31T20:00:00Z"))).toBe(false);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-02T00:00:00Z"));
    render(<NewYearsEveCharterPage />);
    expect(screen.getByText("The 2026 New Year’s Eve offer has ended.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
