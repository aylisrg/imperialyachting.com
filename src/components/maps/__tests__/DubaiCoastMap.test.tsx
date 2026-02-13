import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DubaiCoastMap } from "../DubaiCoastMap";
import type { Destination } from "@/types/common";

const makeDestination = (
  overrides: Partial<Destination> = {}
): Destination => ({
  slug: "palm-jumeirah",
  name: "Palm Jumeirah",
  description: "Test description",
  shortDescription: "Short desc",
  sailingTime: "15-30 min",
  bestFor: ["Sightseeing"],
  image: "/img.jpg",
  coverImage: "/img.jpg",
  galleryImages: [],
  highlights: [],
  category: "destination",
  duration: "1-2 hours",
  priceFrom: null,
  latitude: 25.1124,
  longitude: 55.138,
  mapLabel: "Palm Jumeirah",
  videoUrl: "",
  featured: true,
  whatIncluded: [],
  itinerary: [],
  ...overrides,
});

const destinations = [
  makeDestination({ slug: "palm-jumeirah", name: "Palm Jumeirah", latitude: 25.1124, longitude: 55.138 }),
  makeDestination({ slug: "world-islands", name: "World Islands", latitude: 25.22, longitude: 55.17, mapLabel: "World Islands" }),
  makeDestination({ slug: "dubai-harbour", name: "Dubai Harbour", latitude: 25.0805, longitude: 55.1403 }),
];

describe("DubaiCoastMap", () => {
  it("renders with accessibility label", () => {
    render(<DubaiCoastMap destinations={destinations} />);
    expect(
      screen.getByRole("img", {
        name: "Interactive map of Dubai yacht destinations",
      })
    ).toBeInTheDocument();
  });

  it("renders correct number of marker buttons", () => {
    render(<DubaiCoastMap destinations={destinations} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("renders accessible marker labels with destination names", () => {
    render(<DubaiCoastMap destinations={destinations} />);
    expect(screen.getByLabelText("View Palm Jumeirah")).toBeInTheDocument();
    expect(screen.getByLabelText("View World Islands")).toBeInTheDocument();
    expect(screen.getByLabelText("View Dubai Harbour")).toBeInTheDocument();
  });

  it("calls onMarkerClick with correct slug when clicked", () => {
    const handleClick = vi.fn();
    render(
      <DubaiCoastMap destinations={destinations} onMarkerClick={handleClick} />
    );

    fireEvent.click(screen.getByLabelText("View Palm Jumeirah"));
    expect(handleClick).toHaveBeenCalledWith("palm-jumeirah");

    fireEvent.click(screen.getByLabelText("View World Islands"));
    expect(handleClick).toHaveBeenCalledWith("world-islands");
  });

  it("renders Arabian Gulf label text", () => {
    render(<DubaiCoastMap destinations={destinations} />);
    expect(screen.getByText(/Arabian Gulf/)).toBeInTheDocument();
  });

  it("handles empty destinations array", () => {
    render(<DubaiCoastMap destinations={[]} />);
    expect(
      screen.getByRole("img", {
        name: "Interactive map of Dubai yacht destinations",
      })
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("filters out destinations without coordinates", () => {
    const mixed = [
      makeDestination({ slug: "with-coords", name: "With Coords", latitude: 25.1, longitude: 55.15 }),
      makeDestination({ slug: "no-coords", name: "No Coords", latitude: null, longitude: null }),
    ];
    render(<DubaiCoastMap destinations={mixed} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByLabelText("View With Coords")).toBeInTheDocument();
  });
});
