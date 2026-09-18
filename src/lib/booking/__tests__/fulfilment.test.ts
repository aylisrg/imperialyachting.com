import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookingWithExtras } from "../bookings-db";
import type { Booking } from "@/types/booking";
import type { StripeCheckoutSessionLike } from "../fulfilment";

const mockGetBookingWithExtras = vi.fn();
const mockUpdateBooking = vi.fn();
const mockCreateCharterEvent = vi.fn();
const mockSendEmail = vi.fn();
const mockSendTelegram = vi.fn();

const mockInsert = vi.fn();
const mockYachtSingle = vi.fn();
const mockYachtEq = vi.fn(() => ({ single: mockYachtSingle }));
const mockYachtSelect = vi.fn(() => ({ eq: mockYachtEq }));
const mockFrom = vi.fn((table: string) => {
  if (table === "stripe_events") return { insert: mockInsert };
  if (table === "yachts") return { select: mockYachtSelect };
  throw new Error(`unexpected table ${table}`);
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: () => ({ from: mockFrom }),
}));

vi.mock("../bookings-db", () => ({
  getBookingWithExtras: (...args: unknown[]) => mockGetBookingWithExtras(...args),
  updateBooking: (...args: unknown[]) => mockUpdateBooking(...args),
}));

vi.mock("@/lib/google/calendar", () => ({
  createCharterEvent: (...args: unknown[]) => mockCreateCharterEvent(...args),
}));

vi.mock("@/lib/notify", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/notify")>();
  return {
    ...actual,
    sendEmail: (...args: unknown[]) => mockSendEmail(...args),
    sendTelegram: (...args: unknown[]) => mockSendTelegram(...args),
  };
});

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    yachtId: "yacht-1",
    status: "hold",
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
    quoteExpiresAt: null,
    holdExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    stripeCheckoutId: "cs_test_1",
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
    extras: [
      {
        id: "be-1",
        bookingId: "booking-1",
        extraId: "extra-1",
        qty: 1,
        unitPrice: 500,
        amount: 500,
        name: "Photographer (2h)",
        slug: "photographer",
      },
    ],
    yachtName: "Test Yacht",
    yachtSlug: "test-yacht",
  };
}

function makeSession(overrides: Partial<StripeCheckoutSessionLike> = {}): StripeCheckoutSessionLike {
  return {
    id: "cs_test_1",
    client_reference_id: "booking-1",
    payment_intent: "pi_test_1",
    metadata: { booking_id: "booking-1", payment_stage: "deposit" },
    customer_details: { email: "jane@example.com", name: "Jane Doe", phone: "+971500000000" },
    amount_total: 225000,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockInsert.mockResolvedValue({ error: null });
  mockYachtSingle.mockResolvedValue({ data: { calendar_id: "cal-1" }, error: null });
  mockUpdateBooking.mockImplementation(async (id: string, patch: Record<string, unknown>) =>
    makeBooking({ id, ...patch })
  );
  mockCreateCharterEvent.mockResolvedValue("gcal-event-1");
  mockSendEmail.mockResolvedValue({ ok: true, id: "email-1" });
  mockSendTelegram.mockResolvedValue(true);
});

describe("markStripeEventProcessed", () => {
  it("returns true and inserts the event when it hasn't been seen before", async () => {
    const { markStripeEventProcessed } = await import("../fulfilment");

    const result = await markStripeEventProcessed("evt_1", "checkout.session.completed");

    expect(result).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({ id: "evt_1", type: "checkout.session.completed" });
  });

  it("returns false on a unique-violation (duplicate delivery)", async () => {
    mockInsert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    const { markStripeEventProcessed } = await import("../fulfilment");

    const result = await markStripeEventProcessed("evt_1", "checkout.session.completed");

    expect(result).toBe(false);
  });

  it("throws on any other database error", async () => {
    mockInsert.mockResolvedValue({ error: { code: "500", message: "connection refused" } });
    const { markStripeEventProcessed } = await import("../fulfilment");

    await expect(markStripeEventProcessed("evt_1", "checkout.session.completed")).rejects.toThrow(
      /connection refused/
    );
  });
});

describe("handleCheckoutCompleted", () => {
  it("flips a hold booking to deposit_paid, saves the payment intent and fills in customer details", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1" });
    expect(mockUpdateBooking).toHaveBeenCalledWith(
      "booking-1",
      expect.objectContaining({
        status: "deposit_paid",
        stripe_payment_intent_id: "pi_test_1",
        customer_name: "Jane Doe",
        customer_email: "jane@example.com",
        customer_phone: "+971500000000",
      })
    );
  });

  it("creates a Google Calendar event and saves gcal_event_id", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    const { handleCheckoutCompleted } = await import("../fulfilment");

    await handleCheckoutCompleted(makeSession());

    expect(mockCreateCharterEvent).toHaveBeenCalledTimes(1);
    const [calendarId, input] = mockCreateCharterEvent.mock.calls[0];
    expect(calendarId).toBe("cal-1");
    expect(input.summary).toContain("Test Yacht");
    expect(input.summary).toContain("Jane Doe");
    expect(input.summary).toContain("deposit paid");
    expect(input.description).toContain("Photographer (2h)");
    expect(input.description).toContain("/admin/bookings/booking-1");

    expect(mockUpdateBooking).toHaveBeenCalledWith("booking-1", { gcal_event_id: "gcal-event-1" });
  });

  it("sends the customer email, admin email and telegram summary", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    const { handleCheckoutCompleted } = await import("../fulfilment");

    await handleCheckoutCompleted(makeSession());

    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    const recipients = mockSendEmail.mock.calls.map((call) => call[0].to);
    expect(recipients).toContain("jane@example.com");

    expect(mockSendTelegram).toHaveBeenCalledTimes(1);
    const [message] = mockSendTelegram.mock.calls[0];
    expect(message).toContain("Test Yacht");
    expect(message).toContain("Jane Doe");
  });

  it("is a no-op (skipped) when the booking is already deposit_paid", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "deposit_paid" }));
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1", skipped: "already_processed" });
    expect(mockUpdateBooking).not.toHaveBeenCalled();
    expect(mockCreateCharterEvent).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("is a no-op (skipped) when the booking is already paid", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "paid" }));
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1", skipped: "already_processed" });
  });

  it("sets status to paid and skips calendar/notifications for a balance payment", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(
      makeSession({ metadata: { booking_id: "booking-1", payment_stage: "balance" } })
    );

    expect(result).toEqual({ ok: true, bookingId: "booking-1" });
    expect(mockUpdateBooking).toHaveBeenCalledWith(
      "booking-1",
      expect.objectContaining({ status: "paid" })
    );
    expect(mockCreateCharterEvent).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockSendTelegram).not.toHaveBeenCalled();
  });

  it("resolves booking id from metadata.booking_id when client_reference_id is missing", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(
      makeSession({ client_reference_id: null, metadata: { booking_id: "booking-1" } })
    );

    expect(result.ok).toBe(true);
    expect(mockGetBookingWithExtras).toHaveBeenCalledWith("booking-1");
  });

  it("returns skipped when there is no booking id on the session", async () => {
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(
      makeSession({ client_reference_id: null, metadata: {} })
    );

    expect(result).toEqual({ ok: false, skipped: "no_booking_id" });
    expect(mockGetBookingWithExtras).not.toHaveBeenCalled();
  });

  it("never throws even when calendar/email/telegram all fail", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    mockCreateCharterEvent.mockRejectedValue(new Error("calendar down"));
    mockSendEmail.mockRejectedValue(new Error("resend down"));
    mockSendTelegram.mockRejectedValue(new Error("telegram down"));
    const { handleCheckoutCompleted } = await import("../fulfilment");

    const result = await handleCheckoutCompleted(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1" });
  });
});

describe("handleCheckoutExpired", () => {
  it("flips a hold booking to expired and clears hold_expires_at", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "hold" }));
    const { handleCheckoutExpired } = await import("../fulfilment");

    const result = await handleCheckoutExpired(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1" });
    expect(mockUpdateBooking).toHaveBeenCalledWith("booking-1", {
      status: "expired",
      hold_expires_at: null,
    });
  });

  it("leaves a deposit_paid booking untouched", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "deposit_paid" }));
    const { handleCheckoutExpired } = await import("../fulfilment");

    const result = await handleCheckoutExpired(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1", skipped: "not_hold" });
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });
});

describe("handleAsyncPaymentFailed", () => {
  it("flips a hold booking to expired, same as an expired session", async () => {
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "hold" }));
    const { handleAsyncPaymentFailed } = await import("../fulfilment");

    const result = await handleAsyncPaymentFailed(makeSession());

    expect(result).toEqual({ ok: true, bookingId: "booking-1" });
    expect(mockUpdateBooking).toHaveBeenCalledWith("booking-1", {
      status: "expired",
      hold_expires_at: null,
    });
  });
});
