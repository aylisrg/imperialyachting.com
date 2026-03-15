import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../Header";

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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock analytics (noop)
vi.mock("@/lib/analytics", () => ({
  trackPhoneClick: vi.fn(),
  trackWhatsAppClick: vi.fn(),
}));

describe("Header", () => {
  it("renders the logo text", () => {
    render(<Header />);
    expect(screen.getByText("IMPERIAL")).toBeInTheDocument();
    expect(screen.getByText("YACHTING")).toBeInTheDocument();
  });

  it("does not render a promo banner", () => {
    render(<Header />);
    expect(screen.queryByText(/4\+1 Special/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Claim Offer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/get the 5th/i)).not.toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    // Navigation links appear twice (desktop + mobile menu)
    expect(screen.getAllByText("Fleet").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Services").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Destinations").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Blog").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Contact").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Book Now CTA", () => {
    render(<Header />);
    const bookButtons = screen.getAllByText("Book Now");
    expect(bookButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the phone call link with aria-label", () => {
    render(<Header />);
    const phoneLink = screen.getByLabelText("Call us");
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink.tagName).toBe("A");
    expect(phoneLink).toHaveAttribute("href", expect.stringContaining("tel:"));
  });

  it("renders the mobile menu toggle button", () => {
    render(<Header />);
    const toggleButton = screen.getByLabelText("Toggle menu");
    expect(toggleButton).toBeInTheDocument();
  });

  it("logo links to home page", () => {
    render(<Header />);
    const homeLink = screen.getAllByRole("link").find(
      (link) => link.getAttribute("href") === "/"
    );
    expect(homeLink).toBeDefined();
  });
});
