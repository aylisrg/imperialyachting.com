import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DestinationsPageClient } from "../DestinationsPageClient";
import type { Destination } from "@/types/common";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

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
    slug: "palm",
    name: "Palm Jumeirah",
    category: "destination",
  }),
  makeDestination({
    slug: "world",
    name: "World Islands",
    category: "destination",
  }),
  makeDestination({
    slug: "efoil",
    name: "Efoil Trip",
    category: "experience",
  }),
  makeDestination({
    slug: "fishing",
    name: "Deep Sea Fishing",
    category: "activity",
  }),
];

describe("DestinationsPageClient", () => {
  it("renders the hero heading", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(
      screen.getByText(/Dubai's Finest Yacht Experiences/i)
    ).toBeInTheDocument();
  });

  it("renders all filter tabs with correct counts", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    // All (4), Destinations (2), Experiences (1), Activities (1)
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    // Both experience and activity have count "1" — use getAllByText
    const onesSpans = screen.getAllByText("1");
    expect(onesSpans.length).toBeGreaterThanOrEqual(2);
  });

  it("renders destination cards for all destinations by default", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(screen.getByText("Palm Jumeirah")).toBeInTheDocument();
    expect(screen.getByText("World Islands")).toBeInTheDocument();
    expect(screen.getByText("Efoil Trip")).toBeInTheDocument();
    expect(screen.getByText("Deep Sea Fishing")).toBeInTheDocument();
  });

  it("renders Explore Our Routes heading for map section", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(screen.getByText("Explore Our Routes")).toBeInTheDocument();
  });

  it("renders seasonal guide section", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(screen.getByText("When to Charter")).toBeInTheDocument();
    expect(screen.getByText("Peak Season")).toBeInTheDocument();
    expect(screen.getByText("Summer Season")).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);
    expect(
      screen.getByText(/Ready to Explore Dubai's Coastline/i)
    ).toBeInTheDocument();
  });

  it("hides map section when no destinations have coordinates", () => {
    const noCoords = testDestinations.map((d) => ({
      ...d,
      latitude: null,
      longitude: null,
    }));
    render(<DestinationsPageClient destinations={noCoords} />);
    expect(screen.queryByText("Explore Our Routes")).not.toBeInTheDocument();
  });

  it("shows empty state text when empty destinations array", () => {
    render(<DestinationsPageClient destinations={[]} />);
    expect(screen.getByText(/No.*destinations available yet/i)).toBeInTheDocument();
  });

  it("filters destinations by tab click", () => {
    render(<DestinationsPageClient destinations={testDestinations} />);

    // Find and click the button containing the Destinations count "2"
    // Tab buttons contain: icon + label + count
    const allButtons = screen.getAllByRole("button");
    // Find the Destinations tab — it has count "2"
    const destinationsTab = allButtons.find((btn) =>
      btn.textContent?.includes("Destinations")
    );

    if (destinationsTab) {
      fireEvent.click(destinationsTab);
      // After clicking, should show only destinations
      expect(screen.getByText("Palm Jumeirah")).toBeInTheDocument();
      expect(screen.getByText("World Islands")).toBeInTheDocument();
      // Experiences and activities should be hidden
      expect(screen.queryByText("Efoil Trip")).not.toBeInTheDocument();
      expect(screen.queryByText("Deep Sea Fishing")).not.toBeInTheDocument();
    }
  });
});
