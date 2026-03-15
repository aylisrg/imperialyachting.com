import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock analytics (noop)
vi.mock("@/lib/analytics", () => ({
  trackPhoneClick: vi.fn(),
  trackEmailClick: vi.fn(),
  trackWhatsAppClick: vi.fn(),
}));

describe("Footer", () => {
  it("renders the brand name", () => {
    render(<Footer />);
    expect(screen.getByText("IMPERIAL")).toBeInTheDocument();
    expect(screen.getByText("YACHTING")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Footer />);
    expect(screen.getAllByText("Fleet").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Services").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Destinations").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Blog").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Contact").length).toBeGreaterThanOrEqual(1);
  });

  it("renders service links", () => {
    render(<Footer />);
    expect(screen.getByText("Charter")).toBeInTheDocument();
    expect(screen.getByText("Yacht Management")).toBeInTheDocument();
    expect(screen.getByText("Cinematography")).toBeInTheDocument();
    expect(screen.getByText("Brandwave")).toBeInTheDocument();
  });

  it("renders phone contact with tel: link", () => {
    render(<Footer />);
    const phoneLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.startsWith("tel:")
    );
    expect(phoneLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders email contact with mailto: link", () => {
    render(<Footer />);
    const emailLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.startsWith("mailto:")
    );
    expect(emailLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders WhatsApp Us button", () => {
    render(<Footer />);
    expect(screen.getByText("WhatsApp Us")).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<Footer />);
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("YouTube")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
  });

  it("renders privacy and terms links", () => {
    render(<Footer />);
    const privacyLink = screen.getByText("Privacy Policy");
    const termsLink = screen.getByText("Terms of Service");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("renders copyright notice", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
