import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HomePage from "../page";
import { Footer } from "@/components/layout/Footer";

vi.mock("next/font/google", () => ({
  Cormorant_Garamond: () => ({ variable: "font-cormorant" }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/components/home/HomeChrome", () => ({ HomeChrome: () => null }));
vi.mock("@/components/home/HomeMotion", () => ({ HomeMotion: () => null }));
vi.mock("@/components/home/HomeVideo", () => ({ HomeVideo: () => null }));
vi.mock("@/components/sections/SpeedboatTransferPromo", () => ({ SpeedboatTransferPromo: () => null }));
vi.mock("@/components/sections/FAQSection", () => ({ FAQSection: () => null }));

describe("Yacht Sales footer discovery", () => {
  it("links from the redesigned homepage footer to the sales hub, not a listing", () => {
    render(<HomePage />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "Yacht Sales" })).toHaveAttribute("href", "/yachts-for-sale");
    expect(within(footer).getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/documents");
  });

  it("also renders the sales hub link in the legacy homepage footer", () => {
    render(<Footer />);
    expect(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Yacht Sales" })).toHaveAttribute("href", "/yachts-for-sale");
  });
});
