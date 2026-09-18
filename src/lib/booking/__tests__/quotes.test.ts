import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Yacht, SeasonPricing } from "@/types/yacht";
import type { Extra } from "@/types/booking";

const mockFetchYachtBySlug = vi.fn();
const mockFetchActiveExtras = vi.fn();
const mockIsAdminSupabaseConfigured = vi.fn();
const mockGetYachtBookingInfo = vi.fn();
const mockInsertBooking = vi.fn();
const mockInsertBookingExtras = vi.fn();
const mockGetBookingWithExtras = vi.fn();
const mockCheckAvailability = vi.fn();

vi.mock("@/lib/yachts-db", () => ({
  fetchYachtBySlug: (...args: unknown[]) => mockFetchYachtBySlug(...args),
}));

vi.mock("@/lib/booking/extras-db", () => ({
  fetchActiveExtras: (...args: unknown[]) => mockFetchActiveExtras(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  isAdminSupabaseConfigured: (...args: unknown[]) => mockIsAdminSupabaseConfigured(...args),
  createAdminSupabase: vi.fn(),
}));

vi.mock("../bookings-db", () => ({
  getYachtBookingInfo: (...args: unknown[]) => mockGetYachtBookingInfo(...args),
  insertBooking: (...args: unknown[]) => mockInsertBooking(...args),
  insertBookingExtras: (...args: unknown[]) => mockInsertBookingExtras(...args),
  getBookingWithExtras: (...args: unknown[]) => mockGetBookingWithExtras(...args),
}));

vi.mock("../availability", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../availability")>();
  return {
    ...actual,
    checkAvailability: (...args: unknown[]) => mockCheckAvailability(...args),
  };
});

// ---------------------------------------------------------------------------
// Fixtures (mirrors src/lib/booking/__tests__/pricing-engine.test.ts)
// ---------------------------------------------------------------------------

const WEEKDAY_DATE = "2026-12-10"; // Thursday, Dubai local

const winterWeekday: SeasonPricing = {
  season: "Winter",
  period: "Oct - Apr",
  hourly: 1000,
  daily: null,
  weekly: null,
  monthly: null,
  validFrom: "10-01",
  validTo: "04-30",
  isWeekend: false,
};

function makeYacht(overrides: Partial<Yacht> = {}): Yacht {
  return {
    slug: "test-yacht",
    name: "Test Yacht",
    tagline: "",
    description: "",
    builder: "",
    year: 2020,
    length: { feet: 80, meters: 24 },
    capacity: 12,
    location: "Dubai Marina",
    images: [],
    heroImage: "",
    specs: [],
    amenities: [],
    pricing: [winterWeekday],
    included: [],
    featured: false,
    youtubeShorts: [],
    youtubeVideo: "",
    showVideos: false,
    dailyRules: "",
    weeklyRules: "",
    minHoursWeekday: 2,
    minHoursWeekend: 4,
    currency: "AED",
    bookingEnabled: true,
    ...overrides,
  };
}

function makeExtra(overrides: Partial<Extra> = {}): Extra {
  return {
    id: "extra-1",
    slug: "photographer",
    name: "Photographer (2h)",
    description: "",
    price: 500,
    unit: "per_booking",
    category: "service",
    image: "",
    active: true,
    sortOrder: 0,
    ...overrides,
  };
}

const YACHT_INFO = {
  id: "yacht-uuid-1",
  slug: "test-yacht",
  name: "Test Yacht",
  calendarId: "cal-1",
  bookingEnabled: true,
};

const AVAILABLE = { available: true, conflicts: [], calendarChecked: true };

beforeEach(() => {
  vi.clearAllMocks();
  mockIsAdminSupabaseConfigured.mockReturnValue(true);
  mockFetchYachtBySlug.mockResolvedValue(makeYacht());
  mockGetYachtBookingInfo.mockResolvedValue(YACHT_INFO);
  mockCheckAvailability.mockResolvedValue(AVAILABLE);
  mockInsertBooking.mockImplementation(async (row: Record<string, unknown>) => ({
    id: "booking-1",
    yachtId: row.yacht_id,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    hours: row.hours,
    guests: row.guests,
    customerName: null,
    customerEmail: null,
    customerPhone: null,
    source: row.source,
    baseAmount: row.base_amount,
    extrasAmount: row.extras_amount,
    bonusHours: row.bonus_hours,
    totalAmount: row.total_amount,
    depositAmount: row.deposit_amount,
    currency: row.currency,
    quoteExpiresAt: row.quote_expires_at,
    holdExpiresAt: null,
    stripeCheckoutId: null,
    stripePaymentIntentId: null,
    gcalEventId: null,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  mockInsertBookingExtras.mockResolvedValue(undefined);
});

describe("createQuote", () => {
  it("happy path: computes amounts, persists a quote row with expiry, and inserts extras", async () => {
    const { createQuote } = await import("../quotes");
    mockFetchActiveExtras.mockResolvedValue([makeExtra()]);

    const result = await createQuote({
      yachtSlug: "test-yacht",
      date: WEEKDAY_DATE,
      startHour: 10,
      hours: 4,
      guests: 6,
      extras: [{ slug: "photographer", qty: 1 }],
      source: "web",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");

    expect(result.quoteId).toBe("booking-1");
    expect(result.quote.baseAmount).toBe(4000); // 1000/hr * 4h
    expect(result.quote.extrasAmount).toBe(500);
    expect(result.quote.totalAmount).toBe(4500);
    expect(result.quote.depositAmount).toBe(2250); // 50%
    expect(result.yacht).toEqual({ slug: "test-yacht", name: "Test Yacht" });
    expect(result.availability.available).toBe(true);
    expect(typeof result.summary).toBe("string");
    expect(result.summary).toContain("Test Yacht");

    expect(mockInsertBooking).toHaveBeenCalledTimes(1);
    const insertedRow = mockInsertBooking.mock.calls[0][0];
    expect(insertedRow.status).toBe("quote");
    expect(insertedRow.source).toBe("web");
    expect(new Date(insertedRow.quote_expires_at).getTime()).toBeGreaterThan(Date.now());

    expect(mockInsertBookingExtras).toHaveBeenCalledTimes(1);
    const extraRows = mockInsertBookingExtras.mock.calls[0][0];
    expect(extraRows).toEqual([
      { booking_id: "booking-1", extra_id: "extra-1", qty: 1, unit_price: 500, amount: 500 },
    ]);
  });

  it("returns not_configured when the admin Supabase client is unavailable", async () => {
    const { createQuote } = await import("../quotes");
    mockIsAdminSupabaseConfigured.mockReturnValue(false);

    const result = await createQuote({
      yachtSlug: "test-yacht",
      date: WEEKDAY_DATE,
      startHour: 10,
      hours: 4,
      guests: 6,
      source: "web",
    });

    expect(result).toEqual({
      ok: false,
      code: "not_configured",
      message: expect.any(String),
    });
    expect(mockFetchYachtBySlug).not.toHaveBeenCalled();
  });

  it("returns yacht_not_found for an unknown slug", async () => {
    const { createQuote } = await import("../quotes");
    mockFetchYachtBySlug.mockResolvedValue(null);
    mockGetYachtBookingInfo.mockResolvedValue(null);

    const result = await createQuote({
      yachtSlug: "nope",
      date: WEEKDAY_DATE,
      startHour: 10,
      hours: 4,
      guests: 6,
      source: "web",
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.code).toBe("yacht_not_found");
    expect(mockInsertBooking).not.toHaveBeenCalled();
  });

  it("returns unknown_extra for an extra slug not in the active catalogue", async () => {
    const { createQuote } = await import("../quotes");
    mockFetchActiveExtras.mockResolvedValue([makeExtra()]);

    const result = await createQuote({
      yachtSlug: "test-yacht",
      date: WEEKDAY_DATE,
      startHour: 10,
      hours: 4,
      guests: 6,
      extras: [{ slug: "does-not-exist", qty: 1 }],
      source: "mcp",
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.code).toBe("unknown_extra");
    expect(result.message).toContain("does-not-exist");
    expect(mockInsertBooking).not.toHaveBeenCalled();
  });

  it("passes through pricing-engine validation errors as quote_invalid", async () => {
    const { createQuote } = await import("../quotes");

    // hours below min (minHoursWeekday: 2) -> below 1 hour triggers min_hours.
    const result = await createQuote({
      yachtSlug: "test-yacht",
      date: WEEKDAY_DATE,
      startHour: 10,
      hours: 1,
      guests: 6,
      source: "web",
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.code).toBe("quote_invalid");
    expect(result.errors?.some((e) => e.code === "min_hours")).toBe(true);
    expect(mockCheckAvailability).not.toHaveBeenCalled();
    expect(mockInsertBooking).not.toHaveBeenCalled();
  });

  it("returns unavailable with conflicts and does not persist a booking", async () => {
    const { createQuote } = await import("../quotes");
    const conflict = {
      source: "booking" as const,
      start: new Date("2026-12-10T10:00:00Z"),
      end: new Date("2026-12-10T14:00:00Z"),
    };
    mockCheckAvailability.mockResolvedValue({ available: false, conflicts: [conflict], calendarChecked: true });

    const result = await createQuote({
      yachtSlug: "test-yacht",
      date: WEEKDAY_DATE,
      startHour: 10,
      hours: 4,
      guests: 6,
      source: "web",
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.code).toBe("unavailable");
    expect(result.conflicts).toEqual([conflict]);
    expect(mockInsertBooking).not.toHaveBeenCalled();
  });
});

describe("getQuote", () => {
  it("maps a stored booking + extras back into the quote shape without recomputing pricing", async () => {
    const { getQuote } = await import("../quotes");
    mockFetchActiveExtras.mockResolvedValue([makeExtra()]);
    mockGetBookingWithExtras.mockResolvedValue({
      booking: {
        id: "booking-2",
        yachtId: "yacht-uuid-1",
        status: "quote",
        startsAt: "2026-12-10T06:00:00.000Z",
        endsAt: "2026-12-10T10:00:00.000Z",
        hours: 4,
        guests: 6,
        customerName: null,
        customerEmail: null,
        customerPhone: null,
        source: "web",
        baseAmount: 4000,
        extrasAmount: 500,
        bonusHours: 1,
        totalAmount: 4500,
        depositAmount: 2250,
        currency: "AED",
        quoteExpiresAt: "2026-12-10T05:30:00.000Z",
        holdExpiresAt: null,
        stripeCheckoutId: null,
        stripePaymentIntentId: null,
        gcalEventId: null,
        notes: "",
        createdAt: "2026-12-01T00:00:00.000Z",
        updatedAt: "2026-12-01T00:00:00.000Z",
      },
      extras: [{ id: "be-1", bookingId: "booking-2", extraId: "extra-1", qty: 1, unitPrice: 500, amount: 500, name: "Photographer (2h)", slug: "photographer" }],
      yachtName: "Test Yacht",
      yachtSlug: "test-yacht",
    });

    const result = await getQuote("booking-2");

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.quoteId).toBe("booking-2");
    expect(result.quote.totalAmount).toBe(4500);
    expect(result.quote.extras).toEqual([
      { slug: "photographer", name: "Photographer (2h)", qty: 1, unitPrice: 500, unit: "per_booking", amount: 500 },
    ]);
  });

  it("returns not_found when there is no matching booking", async () => {
    const { getQuote } = await import("../quotes");
    mockGetBookingWithExtras.mockResolvedValue(null);

    const result = await getQuote("missing");

    expect(result).toEqual({ ok: false, code: "not_found", message: expect.any(String) });
  });
});
