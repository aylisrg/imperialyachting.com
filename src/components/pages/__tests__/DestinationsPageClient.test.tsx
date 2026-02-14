import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DestinationsPageClient } from "../DestinationsPageClient";
import type { Destination } from "@/types/common";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
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

const makeDestination = (
  overrides: Partial<Destination> = {}
): Destination => ({
  slug: "test",
  name: "Test Destination",
  description: "Test description",
  shortDescription: "Short test",
  sailingTime: "15 min",
  bestFor: ["Test"],
  image: "/img.jpg",
  coverImage: "/img.jpg",
  galleryImages: [],
  highlights: [],
  category: "destination",
  duration: "1 hour",
  priceFrom: null,
  latitude: 25.1,
  longitude: 55.15,
  mapLabel: "Test",
  videoUrl: "",
  featured: false,
  whatIncluded: [],
  itinerary: [],
  ...overrides,
});

const testDestinations: Destination[] = [
  makeDestination({
    slug: "dubai-harbour",
    name: "Dubai Harbour",
    sailingTime: "Departure point",
    duration: "",
  }),
  makeDestination({
    slug: "palm",
    name: "Palm Jumeirah",
  }),
  makeDestination({
    slug: "world",
    name: "World Islands",
  }),
  makeDestination({
    slug: "marina",
    name: "Dubai Marina",
  }),
];

describe("DestinationsPageClient", () => {
  it("renders the hero heading", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(
      screen.getByText(/Dubai's Finest Yacht Destinations/i)
    ).toBeInTheDocument();
  });

  it("renders departure point banner", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(screen.getByText(/All charters depart from/i)).toBeInTheDocument();
    expect(screen.getByText("Dubai Harbour")).toBeInTheDocument();
  });

  it("excludes Dubai Harbour from destination cards grid", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    // Dubai Harbour should appear in the departure banner text but not as a card
    // Cards render destination names as h3 headings
    const headings = screen.getAllByRole("heading", { level: 3 });
    const cardNames = headings.map((h) => h.textContent);
    expect(cardNames).not.toContain("Dubai Harbour");
    // Browsable destinations should be shown
    expect(cardNames).toContain("Palm Jumeirah");
    expect(cardNames).toContain("World Islands");
    expect(cardNames).toContain("Dubai Marina");
  });

  it("renders CTA section with fleet link", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(
      screen.getByText(/Ready to Explore Dubai's Coastline/i)
    ).toBeInTheDocument();
    expect(screen.getByText("View Our Fleet")).toBeInTheDocument();
  });

  it("renders Google Maps link when destinations have coordinates", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(screen.getByText("Explore the Coast")).toBeInTheDocument();
    expect(
      screen.getByText("View destinations on Google Maps")
    ).toBeInTheDocument();
  });

  it("hides map section when no destinations have coordinates", () => {
    const noCoords = testDestinations.map((d) => ({
      ...d,
      latitude: null,
      longitude: null,
    }));
    render(<DestinationsPageClient destinations={noCoords} />);
    expect(screen.queryByText("Explore the Coast")).not.toBeInTheDocument();
  });

  it("shows empty state when only departure point exists", () => {
    const onlyDeparture = [
      makeDestination({
        slug: "dubai-harbour",
        name: "Dubai Harbour",
      }),
    ];
    render(<DestinationsPageClient destinations={onlyDeparture} />);
    expect(
      screen.getByText(/No destinations available yet/i)
    ).toBeInTheDocument();
  });

  it("shows empty state when destinations array is empty", () => {
    render(<DestinationsPageClient destinations={[]} />);
    expect(
      screen.getByText(/No destinations available yet/i)
    ).toBeInTheDocument();
  });
});
