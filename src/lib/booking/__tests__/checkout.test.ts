import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookingWithExtras } from "../bookings-db";
import type { Booking } from "@/types/booking";

const mockSessionsCreate = vi.fn();
const mockSessionsRetrieve = vi.fn();
const mockGetBookingWithExtras = vi.fn();
const mockGetYachtBookingInfo = vi.fn();
const mockUpdateBooking = vi.fn();
const mockCheckAvailability = vi.fn();

vi.mock("stripe", () => {
  class MockStripe {
    checkout = {
      sessions: {
        create: mockSessionsCreate,
        retrieve: mockSessionsRetrieve,
      },
    };
  }
  return { default: MockStripe };
});

vi.mock("../bookings-db", () => ({
  getBookingWithExtras: (...args: unknown[]) => mockGetBookingWithExtras(...args),
  getYachtBookingInfo: (...args: unknown[]) => mockGetYachtBookingInfo(...args),
  updateBooking: (...args: unknown[]) => mockUpdateBooking(...args),
}));

vi.mock("../availability", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../availability")>();
  return {
    ...actual,
    checkAvailability: (...args: unknown[]) => mockCheckAvailability(...args),
  };
});

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    yachtId: "yacht-1",
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
    quoteExpiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    holdExpiresAt: null,
    stripeCheckoutId: null,
    stripePaymentIntentId: null,
    gcalEventId: null,
    notes: "",
    createdAt: "2026-12-01T00:00:00.000Z",
    updatedAt: "2026-12-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeData(bookingOverrides: Partial<Booking> = {}): BookingWithExtras {
  return {
    booking: makeBooking(bookingOverrides),
    extras: [{ id: "be-1", bookingId: "booking-1", extraId: "extra-1", qty: 1, unitPrice: 500, amount: 500, name: "Photographer (2h)", slug: "photographer" }],
    yachtName: "Test Yacht",
    yachtSlug: "test-yacht",
  };
}

const CUSTOMER = { name: "Jane Doe", email: "jane@example.com", phone: "+971500000000" };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_123";
  mockGetYachtBookingInfo.mockResolvedValue({
    id: "yacht-1",
    slug: "test-yacht",
    name: "Test Yacht",
    calendarId: "cal-1",
    bookingEnabled: true,
  });
  mockCheckAvailability.mockResolvedValue({ available: true, conflicts: [], calendarChecked: true });
  mockUpdateBooking.mockResolvedValue(makeBooking());
  mockSessionsCreate.mockResolvedValue({
    id: "cs_test_1",
    url: "https://checkout.stripe.com/pay/cs_test_1",
    status: "open",
  });
});

describe("createCheckout", () => {
  it("returns not_configured when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { createCheckout } = await import("../checkout");

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "not_configured", message: expect.any(String) });
    expect(mockGetBookingWithExtras).not.toHaveBeenCalled();
  });

  it("happy path: builds a session with fils amount, metadata, idempotency key, and a clamped expiry", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(makeData());

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({
      ok: true,
      bookingId: "booking-1",
      checkoutUrl: "https://checkout.stripe.com/pay/cs_test_1",
      expiresAt: expect.any(String),
      depositAmount: 2250,
      currency: "AED",
    });

    expect(mockUpdateBooking).toHaveBeenCalledWith(
      "booking-1",
      expect.objectContaining({ status: "hold", customer_email: "jane@example.com" })
    );

    expect(mockSessionsCreate).toHaveBeenCalledTimes(1);
    const [params, options] = mockSessionsCreate.mock.calls[0];
    expect(options).toEqual({ idempotencyKey: "checkout-booking-1" });
    expect(params.mode).toBe("payment");
    expect(params.line_items[0].price_data.unit_amount).toBe(225000); // 2250 AED in fils
    expect(params.line_items[0].price_data.currency).toBe("aed");
    expect(params.metadata).toEqual({
      booking_id: "booking-1",
      yacht_slug: "test-yacht",
      payment_stage: "deposit",
      source: "web",
    });
    expect(params.client_reference_id).toBe("booking-1");
    expect(params.success_url).toContain("/booking/booking-1?status=success");
    expect(params.cancel_url).toContain("/booking/booking-1?status=cancelled");

    const nowSec = Math.floor(Date.now() / 1000);
    expect(params.expires_at).toBeGreaterThanOrEqual(nowSec + 30 * 60);
    expect(params.expires_at).toBeLessThanOrEqual(nowSec + 35 * 60);

    expect(mockUpdateBooking).toHaveBeenCalledWith("booking-1", { stripe_checkout_id: "cs_test_1" });
  });

  it("returns expired when the quote has already expired", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(
      makeData({ quoteExpiresAt: new Date(Date.now() - 60_000).toISOString() })
    );

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "expired", message: expect.any(String) });
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns unavailable when the slot conflicts before flipping to hold", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    mockCheckAvailability.mockResolvedValue({ available: false, conflicts: [{ source: "booking", start: new Date(), end: new Date() }], calendarChecked: true });

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "unavailable", message: expect.any(String) });
    expect(mockUpdateBooking).not.toHaveBeenCalled();
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("already in hold with a live unexpired session returns the same checkout URL again (idempotent)", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(
      makeData({
        status: "hold",
        stripeCheckoutId: "cs_existing",
        holdExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      })
    );
    mockSessionsRetrieve.mockResolvedValue({
      id: "cs_existing",
      url: "https://checkout.stripe.com/pay/cs_existing",
      status: "open",
    });

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.checkoutUrl).toBe("https://checkout.stripe.com/pay/cs_existing");
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("already in hold with a completed session returns already_paid", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(
      makeData({
        status: "hold",
        stripeCheckoutId: "cs_existing",
        holdExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      })
    );
    mockSessionsRetrieve.mockResolvedValue({ id: "cs_existing", url: null, status: "complete" });

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "already_paid", message: expect.any(String) });
  });

  it("reverts the booking to quote status when Stripe session creation fails", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    mockSessionsCreate.mockRejectedValue(new Error("stripe is down"));

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "stripe_error", message: "stripe is down" });
    expect(mockUpdateBooking).toHaveBeenCalledWith("booking-1", { status: "quote", hold_expires_at: null });
  });

  it("returns already_paid for a deposit_paid booking", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "deposit_paid" }));

    const result = await createCheckout({ quoteId: "booking-1", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "already_paid", message: expect.any(String) });
  });

  it("returns not_found when the booking does not exist", async () => {
    const { createCheckout } = await import("../checkout");
    mockGetBookingWithExtras.mockResolvedValue(null);

    const result = await createCheckout({ quoteId: "missing", customer: CUSTOMER });

    expect(result).toEqual({ ok: false, code: "not_found", message: expect.any(String) });
  });
});

describe("describeBookingForHumans", () => {
  it("includes booking id, status, totals and extras", async () => {
    const { describeBookingForHumans } = await import("../checkout");
    const summary = describeBookingForHumans(makeData());

    expect(summary).toContain("booking-1");
    expect(summary).toContain("Test Yacht");
    expect(summary).toContain("Photographer (2h)");
    expect(summary).toContain("4,500");
    expect(summary).toContain("2,250");
  });
});
