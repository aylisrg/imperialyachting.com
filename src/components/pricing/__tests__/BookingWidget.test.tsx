import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BookingWidget } from "../BookingWidget";

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("BookingWidget", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/api/booking/extras")) {
          return jsonResponse({ extras: [] });
        }
        if (url.includes("/api/booking/availability")) {
          return jsonResponse({
            date: "2026-10-01",
            minHours: 6,
            slots: [],
            calendarChecked: false,
          });
        }
        return jsonResponse({});
      })
    );
  });

  it("renders step 1 (date, guests, hours) and the Get Quote CTA", async () => {
    render(
      <BookingWidget yachtSlug="test-yacht" yachtName="Test Yacht" hourlyRate={1000} capacity={10} />
    );

    expect(screen.getByText("Build Your Charter")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Guests")).toBeInTheDocument();
    expect(screen.getByText("Get Quote")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId("min-hours-hint")).toBeInTheDocument());
  });

  it("shows a min-hours hint once availability reports a higher minimum than the selected hours", async () => {
    render(
      <BookingWidget yachtSlug="test-yacht" yachtName="Test Yacht" hourlyRate={1000} capacity={10} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("min-hours-hint")).toHaveTextContent(
        "Minimum charter length for this date is 6 hours."
      );
    });
  });

  it("disables Get Quote until a start time is chosen", async () => {
    render(
      <BookingWidget yachtSlug="test-yacht" yachtName="Test Yacht" hourlyRate={1000} capacity={10} />
    );

    const button = screen.getByText("Get Quote").closest("button");
    expect(button).toBeDisabled();

    await waitFor(() => expect(screen.getByTestId("min-hours-hint")).toBeInTheDocument());
  });
});
