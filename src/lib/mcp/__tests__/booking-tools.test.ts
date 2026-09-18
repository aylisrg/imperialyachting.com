import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Yacht } from "@/types/yacht";
import type { Booking, BookingExtra } from "@/types/booking";

const fetchAllYachts = vi.fn();
const fetchYachtBySlug = vi.fn();
vi.mock("@/lib/yachts-db", () => ({
  fetchAllYachts: (...args: unknown[]) => fetchAllYachts(...args),
  fetchYachtBySlug: (...args: unknown[]) => fetchYachtBySlug(...args),
}));

const getYachtBookingInfo = vi.fn();
const getBookingWithExtras = vi.fn();
vi.mock("@/lib/booking/bookings-db", () => ({
  getYachtBookingInfo: (...args: unknown[]) => getYachtBookingInfo(...args),
  getBookingWithExtras: (...args: unknown[]) => getBookingWithExtras(...args),
}));

const getAvailableSlots = vi.fn();
vi.mock("@/lib/booking/availability", async () => {
  const actual = await vi.importActual<typeof import("@/lib/booking/availability")>(
    "@/lib/booking/availability"
  );
  return {
    ...actual,
    getAvailableSlots: (...args: unknown[]) => getAvailableSlots(...args),
  };
});

const createQuoteDomain = vi.fn();
vi.mock("@/lib/booking/quotes", () => ({
  createQuote: (...args: unknown[]) => createQuoteDomain(...args),
}));

const createCheckoutDomain = vi.fn();
vi.mock("@/lib/booking/checkout", () => ({
  createCheckout: (...args: unknown[]) => createCheckoutDomain(...args),
}));

const yacht: Yacht = {
  slug: "monte-carlo-6",
  name: "Monte Carlo 6",
  tagline: "Dubai's flagship flybridge motor yacht",
  description: "A spacious 60ft flybridge motor yacht for large groups.",
  builder: "Beneteau",
  year: 2021,
  length: { feet: 60, meters: 18.3 },
  capacity: 18,
  cabins: 3,
  location: "Dubai Harbour Yacht Club",
  images: ["/media/mc6-hero.jpg"],
  heroImage: "/media/mc6-hero.jpg",
  specs: [],
  amenities: [],
  pricing: [
    {
      season: "Summer",
      period: "Weekday",
      hourly: 1200,
      daily: null,
      weekly: null,
      monthly: null,
      validFrom: null,
      validTo: null,
      isWeekend: false,
    },
  ],
  included: [],
  featured: true,
  youtubeShorts: [],
  youtubeVideo: "",
  showVideos: false,
  dailyRules: "",
  weeklyRules: "",
  minHoursWeekday: 2,
  minHoursWeekend: 4,
  bookingEnabled: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// check_availability
// ---------------------------------------------------------------------------

describe("checkAvailability tool", () => {
  it("converts slots to Dubai-local HH:MM and flags an unchecked calendar with a note", async () => {
    fetchYachtBySlug.mockResolvedValue(yacht);
    getYachtBookingInfo.mockResolvedValue({
      id: "yacht-1",
      slug: "monte-carlo-6",
      name: "Monte Carlo 6",
      calendarId: null,
      bookingEnabled: true,
    });
    getAvailableSlots.mockResolvedValue({
      date: "2099-01-05",
      slots: [
        { start: "2099-01-05T06:00:00.000Z", end: "2099-01-05T10:00:00.000Z", hours: 4 },
        { start: "2099-01-05T10:00:00.000Z", end: "2099-01-05T12:00:00.000Z", hours: 2 },
      ],
      busy: [],
      calendarChecked: false,
    });

    const { checkAvailability } = await import("../tools/check-availability");
    const { structured, isError } = await checkAvailability({
      yachtSlug: "monte-carlo-6",
      date: "2099-01-05",
    });

    expect(isError).toBeUndefined();
    expect(structured.yachtName).toBe("Monte Carlo 6");
    expect(structured.calendarChecked).toBe(false);
    expect(structured.note).toMatch(/provisional/);
    // Dubai is UTC+4: 06:00Z -> 10:00 local, 10:00Z -> 14:00 local.
    expect(structured.slots[0]).toMatchObject({ start: "10:00", end: "14:00", hours: 4 });
  });

  it("filters slots by requested hours and omits the note when the calendar was checked", async () => {
    fetchYachtBySlug.mockResolvedValue(yacht);
    getYachtBookingInfo.mockResolvedValue({
      id: "yacht-1",
      slug: "monte-carlo-6",
      name: "Monte Carlo 6",
      calendarId: "cal-1",
      bookingEnabled: true,
    });
    getAvailableSlots.mockResolvedValue({
      date: "2099-01-05",
      slots: [{ start: "2099-01-05T06:00:00.000Z", end: "2099-01-05T14:00:00.000Z", hours: 8 }],
      busy: [],
      calendarChecked: true,
    });

    const { checkAvailability } = await import("../tools/check-availability");
    const { structured } = await checkAvailability({
      yachtSlug: "monte-carlo-6",
      date: "2099-01-05",
      hours: 6,
    });

    expect(structured.note).toBeUndefined();
    expect(structured.requestedHours).toBe(6);
    expect(structured.slots).toHaveLength(1);
    expect(getAvailableSlots).toHaveBeenCalledWith(
      expect.objectContaining({ minHours: 6 })
    );
  });

  it("returns isError with valid slugs for an unknown yacht", async () => {
    fetchYachtBySlug.mockResolvedValue(null);
    fetchAllYachts.mockResolvedValue([yacht]);

    const { checkAvailability } = await import("../tools/check-availability");
    const { structured, isError } = await checkAvailability({
      yachtSlug: "nope",
      date: "2099-01-05",
    });

    expect(isError).toBe(true);
    expect(structured.validSlugs).toEqual(["monte-carlo-6"]);
  });

  it("returns isError for a past date", async () => {
    fetchYachtBySlug.mockResolvedValue(yacht);

    const { checkAvailability } = await import("../tools/check-availability");
    const { isError, text } = await checkAvailability({
      yachtSlug: "monte-carlo-6",
      date: "2000-01-01",
    });

    expect(isError).toBe(true);
    expect(text).toMatch(/past/);
  });
});

// ---------------------------------------------------------------------------
// create_quote
// ---------------------------------------------------------------------------

describe("createQuote tool", () => {
  it("maps a successful domain result onto the tool's output shape", async () => {
    createQuoteDomain.mockResolvedValue({
      ok: true,
      quoteId: "11111111-1111-1111-1111-111111111111",
      yacht: { slug: "monte-carlo-6", name: "Monte Carlo 6" },
      startsAt: "2099-01-05T06:00:00.000Z",
      endsAt: "2099-01-05T10:00:00.000Z",
      expiresAt: "2099-01-05T05:30:00.000Z",
      availability: { available: true, calendarChecked: true, conflicts: [] },
      summary: "Charter Quote — Monte Carlo 6",
      quote: {
        ok: true,
        currency: "AED",
        hourlyRate: 1200,
        hours: 4,
        bonusHours: 1,
        totalHours: 5,
        baseAmount: 4800,
        extras: [],
        extrasAmount: 0,
        totalAmount: 4800,
        depositAmount: 2400,
        balanceAmount: 2400,
        season: "Summer",
        isWeekend: false,
        minHours: 2,
        endsAt: new Date("2099-01-05T10:00:00.000Z"),
      },
    });

    const { createQuote } = await import("../tools/create-quote");
    const { structured, isError } = await createQuote({
      yachtSlug: "monte-carlo-6",
      date: "2099-01-05",
      startHour: 10,
      hours: 4,
      guests: 4,
    });

    expect(isError).toBeUndefined();
    expect(structured.ok).toBe(true);
    expect(structured.quoteId).toBe("11111111-1111-1111-1111-111111111111");
    expect(structured.totalAmount).toBe(4800);
    expect(structured.depositAmount).toBe(2400);
    expect(structured.nextStep).toMatch(/create_checkout/);
    expect(createQuoteDomain).toHaveBeenCalledWith(
      expect.objectContaining({ yachtSlug: "monte-carlo-6", source: "mcp" })
    );
  });

  it("passes through a domain failure as isError with code/message", async () => {
    createQuoteDomain.mockResolvedValue({
      ok: false,
      code: "min_hours",
      message: "Minimum charter length is 4 hours for this date.",
      errors: [{ code: "min_hours", message: "Minimum charter length is 4 hours for this date." }],
    });

    const { createQuote } = await import("../tools/create-quote");
    const { structured, isError } = await createQuote({
      yachtSlug: "monte-carlo-6",
      date: "2099-01-05",
      startHour: 10,
      hours: 1,
      guests: 4,
    });

    expect(isError).toBe(true);
    expect(structured.ok).toBe(false);
    expect(structured.code).toBe("min_hours");
    expect(structured.errors).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// create_checkout
// ---------------------------------------------------------------------------

describe("createCheckout tool", () => {
  it("gates on customerConsent without calling the domain layer", async () => {
    const { createCheckout } = await import("../tools/create-checkout");
    const { structured, isError } = await createCheckout({
      quoteId: "11111111-1111-1111-1111-111111111111",
      customer: { name: "Jane Doe", email: "jane@example.com" },
      customerConsent: false,
    });

    expect(isError).toBe(true);
    expect(structured.code).toBe("consent_required");
    expect(createCheckoutDomain).not.toHaveBeenCalled();
  });

  it("returns a checkout URL and instructions on success", async () => {
    createCheckoutDomain.mockResolvedValue({
      ok: true,
      bookingId: "11111111-1111-1111-1111-111111111111",
      checkoutUrl: "https://checkout.stripe.com/session/abc",
      expiresAt: "2099-01-05T05:30:00.000Z",
      depositAmount: 2400,
      currency: "AED",
    });

    const { createCheckout } = await import("../tools/create-checkout");
    const { structured, isError } = await createCheckout({
      quoteId: "11111111-1111-1111-1111-111111111111",
      customer: { name: "Jane Doe", email: "jane@example.com" },
      customerConsent: true,
    });

    expect(isError).toBeUndefined();
    expect(structured.checkoutUrl).toBe("https://checkout.stripe.com/session/abc");
    expect(structured.instructions).toMatch(/Stripe/);
    expect(createCheckoutDomain).toHaveBeenCalledWith(
      expect.objectContaining({ quoteId: "11111111-1111-1111-1111-111111111111" })
    );
  });

  it("passes through a domain failure code/message", async () => {
    createCheckoutDomain.mockResolvedValue({
      ok: false,
      code: "expired",
      message: "This quote has expired. Please request a new quote.",
    });

    const { createCheckout } = await import("../tools/create-checkout");
    const { structured, isError } = await createCheckout({
      quoteId: "11111111-1111-1111-1111-111111111111",
      customer: { name: "Jane Doe", email: "jane@example.com" },
      customerConsent: true,
    });

    expect(isError).toBe(true);
    expect(structured.code).toBe("expired");
  });
});

// ---------------------------------------------------------------------------
// get_booking
// ---------------------------------------------------------------------------

describe("getBooking tool", () => {
  it("masks customer email/phone and hides Stripe ids and notes", async () => {
    const booking: Booking = {
      id: "11111111-1111-1111-1111-111111111111",
      yachtId: "yacht-1",
      status: "deposit_paid",
      startsAt: "2099-01-05T06:00:00.000Z",
      endsAt: "2099-01-05T10:00:00.000Z",
      hours: 4,
      guests: 4,
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      customerPhone: "+971501234567",
      source: "mcp",
      baseAmount: 4800,
      extrasAmount: 0,
      bonusHours: 1,
      totalAmount: 4800,
      depositAmount: 2400,
      currency: "AED",
      quoteExpiresAt: null,
      holdExpiresAt: null,
      stripeCheckoutId: "cs_test_secret",
      stripePaymentIntentId: "pi_test_secret",
      gcalEventId: null,
      notes: "internal note that should never leak",
      createdAt: "2099-01-01T00:00:00.000Z",
      updatedAt: "2099-01-01T00:00:00.000Z",
    };
    const extras: (BookingExtra & { name: string; slug: string })[] = [
      { id: "be1", bookingId: booking.id, extraId: "e1", qty: 1, unitPrice: 200, amount: 200, name: "Catering", slug: "catering" },
    ];

    getBookingWithExtras.mockResolvedValue({
      booking,
      extras,
      yachtName: "Monte Carlo 6",
      yachtSlug: "monte-carlo-6",
    });

    const { getBooking } = await import("../tools/get-booking");
    const { structured, text } = await getBooking({ bookingId: booking.id });

    expect(structured.found).toBe(true);
    expect(structured.paid).toBe(true);
    expect(structured.customer?.email).toBe("j***@example.com");
    expect(structured.customer?.phone).toBe("***67");
    expect(JSON.stringify(structured)).not.toContain("cs_test_secret");
    expect(JSON.stringify(structured)).not.toContain("pi_test_secret");
    expect(JSON.stringify(structured)).not.toContain("internal note");
    expect(text).not.toContain("cs_test_secret");
  });

  it("returns found: false for an unknown booking id", async () => {
    getBookingWithExtras.mockResolvedValue(null);

    const { getBooking } = await import("../tools/get-booking");
    const { structured, isError } = await getBooking({
      bookingId: "22222222-2222-2222-2222-222222222222",
    });

    expect(structured.found).toBe(false);
    expect(isError).toBe(true);
  });
});
