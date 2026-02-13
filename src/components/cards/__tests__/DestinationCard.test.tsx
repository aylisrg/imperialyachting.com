import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DestinationCard } from "../DestinationCard";
import type { Destination } from "@/types/common";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

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

const baseDestination: Destination = {
  slug: "palm-jumeirah",
  name: "Palm Jumeirah",
  description: "Full description of Palm Jumeirah cruise.",
  shortDescription: "Cruise the iconic man-made island.",
  sailingTime: "15-30 min",
  bestFor: ["Sightseeing", "Photography", "Sunset cruise", "Extra tag"],
  image: "/media/destinations/palm.jpg",
  coverImage: "/media/destinations/palm.jpg",
  galleryImages: [],
  highlights: ["Atlantis views"],
  category: "destination",
  duration: "1-2 hours",
  priceFrom: 2500,
  latitude: 25.1124,
  longitude: 55.138,
  mapLabel: "Palm Jumeirah",
  videoUrl: "",
  featured: true,
  whatIncluded: [],
  itinerary: [],
};

describe("DestinationCard", () => {
  it("renders destination name", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText("Palm Jumeirah")).toBeInTheDocument();
  });

  it("renders short description", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(
      screen.getByText("Cruise the iconic man-made island.")
    ).toBeInTheDocument();
  });

  it("links to /destinations/{slug}", () => {
    render(<DestinationCard destination={baseDestination} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/destinations/palm-jumeirah");
  });

  it("shows category badge with correct label for destination", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText("Destination")).toBeInTheDocument();
  });

  it("shows category badge for experience", () => {
    const experience = { ...baseDestination, category: "experience" as const };
    render(<DestinationCard destination={experience} />);
    expect(screen.getByText("Experience")).toBeInTheDocument();
  });

  it("shows category badge for activity", () => {
    const activity = { ...baseDestination, category: "activity" as const };
    render(<DestinationCard destination={activity} />);
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });

  it("shows sailing time badge", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText("15-30 min")).toBeInTheDocument();
  });

  it("hides sailing time badge when empty", () => {
    const noSailing = { ...baseDestination, sailingTime: "" };
    render(<DestinationCard destination={noSailing} />);
    expect(screen.queryByText("15-30 min")).not.toBeInTheDocument();
  });

  it("shows Featured badge when featured=true", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("hides Featured badge when featured=false", () => {
    const notFeatured = { ...baseDestination, featured: false };
    render(<DestinationCard destination={notFeatured} />);
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("shows duration", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText("1-2 hours")).toBeInTheDocument();
  });

  it("shows price formatted with AED", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText(/From AED 2,500/)).toBeInTheDocument();
  });

  it("hides price section when priceFrom is null", () => {
    const noPrice = { ...baseDestination, priceFrom: null, duration: "" };
    render(<DestinationCard destination={noPrice} />);
    expect(screen.queryByText(/From AED/)).not.toBeInTheDocument();
  });

  it("shows max 3 bestFor tags", () => {
    render(<DestinationCard destination={baseDestination} />);
    expect(screen.getByText("Sightseeing")).toBeInTheDocument();
    expect(screen.getByText("Photography")).toBeInTheDocument();
    expect(screen.getByText("Sunset cruise")).toBeInTheDocument();
    // 4th tag should NOT be rendered
    expect(screen.queryByText("Extra tag")).not.toBeInTheDocument();
  });

  it("renders image with alt text", () => {
    render(<DestinationCard destination={baseDestination} />);
    const img = screen.getByAltText("Palm Jumeirah");
    expect(img).toBeInTheDocument();
  });

  it("falls back to text placeholder when no coverImage", () => {
    const noImage = { ...baseDestination, coverImage: "" };
    render(<DestinationCard destination={noImage} />);
    // No image element, but the name should still appear as placeholder text
    // The component renders the name in a span when there's no image
    const nameElements = screen.getAllByText("Palm Jumeirah");
    expect(nameElements.length).toBeGreaterThanOrEqual(2); // Placeholder + title
  });
});
