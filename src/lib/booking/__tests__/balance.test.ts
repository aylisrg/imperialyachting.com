import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookingWithExtras } from "../bookings-db";
import type { Booking } from "@/types/booking";

const mockSessionsCreate = vi.fn();
const mockGetBookingWithExtras = vi.fn();
const mockUpdateBooking = vi.fn();
const mockSendEmail = vi.fn();
const mockSendTelegram = vi.fn();
const mockFrom = vi.fn();

vi.mock("stripe", () => {
  class MockStripe {
    checkout = {
      sessions: {
        create: mockSessionsCreate,
      },
    };
  }
  return { default: MockStripe };
});

vi.mock("../bookings-db", () => ({
  getBookingWithExtras: (...args: unknown[]) => mockGetBookingWithExtras(...args),
  updateBooking: (...args: unknown[]) => mockUpdateBooking(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/notify", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  sendTelegram: (...args: unknown[]) => mockSendTelegram(...args),
  bookingBalanceReminder: (booking: { bookingId: string; yachtName: string }) => ({
    subject: `Balance due soon — ${booking.yachtName}`,
    html: `<html><body><p>Balance reminder for ${booking.bookingId}</p></body></html>`,
    text: `Balance reminder for ${booking.bookingId}`,
  }),
}));

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    yachtId: "yacht-1",
    status: "deposit_paid",
    startsAt: new Date(Date.now() + 48 * 60 * 60_000).toISOString(),
    endsAt: new Date(Date.now() + 52 * 60 * 60_000).toISOString(),
    hours: 4,
    guests: 6,
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    customerPhone: "+971500000000",
    source: "web",
    baseAmount: 4000,
    extrasAmount: 500,
    bonusHours: 1,
    totalAmount: 4500,
    depositAmount: 2250,
    currency: "AED",
    quoteExpiresAt: null,
    holdExpiresAt: null,
    stripeCheckoutId: "cs_deposit",
    stripePaymentIntentId: "pi_deposit",
    gcalEventId: null,
    notes: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeData(bookingOverrides: Partial<Booking> = {}): BookingWithExtras {
  return {
    booking: makeBooking(bookingOverrides),
    extras: [
      { id: "be-1", bookingId: "booking-1", extraId: "extra-1", qty: 1, unitPrice: 500, amount: 500, name: "Photographer (2h)", slug: "photographer" },
    ],
    yachtName: "Test Yacht",
    yachtSlug: "test-yacht",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_123";
  mockUpdateBooking.mockResolvedValue(makeBooking());
  mockSessionsCreate.mockResolvedValue({
    id: "cs_balance_1",
    url: "https://checkout.stripe.com/pay/cs_balance_1",
    status: "open",
  });
  mockSendEmail.mockResolvedValue({ ok: true, id: "email-1" });
  mockSendTelegram.mockResolvedValue(true);
});

describe("createBalanceCheckout", () => {
  it("returns not_configured when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { createBalanceCheckout } = await import("../balance");

    const result = await createBalanceCheckout("booking-1");

    expect(result).toEqual({ ok: false, code: "not_configured", message: expect.any(String) });
    expect(mockGetBookingWithExtras).not.toHaveBeenCalled();
  });

  it("returns not_found when the booking does not exist", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(null);

    const result = await createBalanceCheckout("missing");

    expect(result).toEqual({ ok: false, code: "not_found", message: expect.any(String) });
  });

  it("returns wrong_status for a booking not in deposit_paid", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "hold" }));

    const result = await createBalanceCheckout("booking-1");

    expect(result).toEqual({ ok: false, code: "wrong_status", message: expect.any(String) });
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns nothing_due when the balance is zero or negative", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ totalAmount: 2250, depositAmount: 2250 }));

    const result = await createBalanceCheckout("booking-1");

    expect(result).toEqual({ ok: false, code: "nothing_due", message: expect.any(String) });
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("happy path: computes balance = total - deposit, builds session, appends marker to notes", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ notes: "existing note" }));

    const result = await createBalanceCheckout("booking-1");

    expect(result).toEqual({ ok: true, url: "https://checkout.stripe.com/pay/cs_balance_1" });

    expect(mockSessionsCreate).toHaveBeenCalledTimes(1);
    const [params, options] = mockSessionsCreate.mock.calls[0];
    expect(options).toEqual({ idempotencyKey: "balance-booking-1" });
    expect(params.mode).toBe("payment");
    expect(params.line_items[0].price_data.unit_amount).toBe(225000); // (4500-2250) AED in fils
    expect(params.line_items[0].price_data.currency).toBe("aed");
    expect(params.line_items[0].price_data.product_data.name).toContain("Balance — Test Yacht");
    expect(params.client_reference_id).toBe("booking-1");
    expect(params.metadata).toEqual({
      booking_id: "booking-1",
      payment_stage: "balance",
      yacht_slug: "test-yacht",
    });
    expect(params.success_url).toContain("/booking/booking-1?status=success&stage=balance");
    expect(params.cancel_url).toContain("/booking/booking-1?status=cancelled&stage=balance");

    expect(mockUpdateBooking).toHaveBeenCalledTimes(1);
    const [, patch] = mockUpdateBooking.mock.calls[0];
    expect(patch.notes).toContain("existing note");
    expect(patch.notes).toContain("[balance-link-sent]");
  });

  it("clamps expires_at between now+30min and now+24h even for a far-future charter", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(
      makeData({ startsAt: new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString() })
    );

    await createBalanceCheckout("booking-1");

    const [params] = mockSessionsCreate.mock.calls[0];
    const nowSec = Math.floor(Date.now() / 1000);
    expect(params.expires_at).toBeGreaterThanOrEqual(nowSec + 30 * 60);
    expect(params.expires_at).toBeLessThanOrEqual(nowSec + 24 * 60 * 60);
  });

  it("clamps expires_at up to at least now+30min for a charter starting very soon", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(
      makeData({ startsAt: new Date(Date.now() + 45 * 60_000).toISOString() })
    );

    await createBalanceCheckout("booking-1");

    const [params] = mockSessionsCreate.mock.calls[0];
    const nowSec = Math.floor(Date.now() / 1000);
    expect(params.expires_at).toBeGreaterThanOrEqual(nowSec + 30 * 60);
  });

  it("returns stripe_error when session creation fails, without touching notes", async () => {
    const { createBalanceCheckout } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData());
    mockSessionsCreate.mockRejectedValue(new Error("stripe is down"));

    const result = await createBalanceCheckout("booking-1");

    expect(result).toEqual({ ok: false, code: "stripe_error", message: "stripe is down" });
    expect(mockUpdateBooking).not.toHaveBeenCalled();
  });
});

describe("findBookingsDueForBalance", () => {
  function mockQueryResult(rows: Array<{ id: string; notes: string | null }>) {
    const builder: Record<string, unknown> = {};
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.gte = vi.fn(() => builder);
    builder.lte = vi.fn(() => Promise.resolve({ data: rows, error: null }));
    mockFrom.mockReturnValue(builder);
    return builder;
  }

  it("excludes bookings whose notes already contain the balance-link-sent marker", async () => {
    const { findBookingsDueForBalance } = await import("../balance");
    mockQueryResult([
      { id: "booking-1", notes: "" },
      { id: "booking-2", notes: "reminded already [balance-link-sent] 2026-01-01T00:00:00.000Z" },
      { id: "booking-3", notes: null },
    ]);

    const ids = await findBookingsDueForBalance({});

    expect(ids).toEqual(["booking-1", "booking-3"]);
  });

  it("returns an empty array on a query error", async () => {
    const { findBookingsDueForBalance } = await import("../balance");
    const builder: Record<string, unknown> = {};
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.gte = vi.fn(() => builder);
    builder.lte = vi.fn(() => Promise.resolve({ data: null, error: new Error("db down") }));
    mockFrom.mockReturnValue(builder);

    const ids = await findBookingsDueForBalance({});

    expect(ids).toEqual([]);
  });
});

describe("sendBalanceReminder", () => {
  it("returns skipped when the booking cannot be found", async () => {
    const { sendBalanceReminder } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(null);

    const result = await sendBalanceReminder("missing");

    expect(result).toEqual({ ok: false, skipped: "not_found" });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns skipped with the checkout error code when checkout creation fails", async () => {
    const { sendBalanceReminder } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ status: "hold" }));

    const result = await sendBalanceReminder("booking-1");

    expect(result).toEqual({ ok: false, skipped: "wrong_status" });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("happy path: emails the customer with the payment link and notifies Telegram", async () => {
    const { sendBalanceReminder } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData());

    const result = await sendBalanceReminder("booking-1");

    expect(result).toEqual({ ok: true });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const [emailArgs] = mockSendEmail.mock.calls[0];
    expect(emailArgs.to).toBe("jane@example.com");
    expect(emailArgs.html).toContain("https://checkout.stripe.com/pay/cs_balance_1");
    expect(emailArgs.text).toContain("https://checkout.stripe.com/pay/cs_balance_1");

    expect(mockSendTelegram).toHaveBeenCalledTimes(1);
    expect(mockSendTelegram.mock.calls[0][0]).toContain("booking-1");
  });

  it("still reports ok when email is skipped (no customer email) but Telegram succeeds", async () => {
    const { sendBalanceReminder } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ customerEmail: null }));

    const result = await sendBalanceReminder("booking-1");

    expect(result).toEqual({ ok: true });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("reports not ok when both channels fail", async () => {
    const { sendBalanceReminder } = await import("../balance");
    mockGetBookingWithExtras.mockResolvedValue(makeData({ customerEmail: null }));
    mockSendTelegram.mockResolvedValue(false);

    const result = await sendBalanceReminder("booking-1");

    expect(result).toEqual({ ok: false });
  });
});

describe("runBalanceReminders", () => {
  it("tallies processed/sent/failed across multiple bookings", async () => {
    const { runBalanceReminders } = await import("../balance");

    const builder: Record<string, unknown> = {};
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.gte = vi.fn(() => builder);
    builder.lte = vi.fn(() =>
      Promise.resolve({
        data: [
          { id: "booking-1", notes: "" },
          { id: "booking-2", notes: "" },
        ],
        error: null,
      })
    );
    mockFrom.mockReturnValue(builder);

    mockGetBookingWithExtras.mockImplementation((id: string) =>
      Promise.resolve(id === "booking-2" ? makeData({ status: "hold" }) : makeData())
    );

    const result = await runBalanceReminders();

    expect(result).toEqual({ processed: 2, sent: 1, failed: 1 });
  });

  it("returns all zeros when nothing is due", async () => {
    const { runBalanceReminders } = await import("../balance");

    const builder: Record<string, unknown> = {};
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.gte = vi.fn(() => builder);
    builder.lte = vi.fn(() => Promise.resolve({ data: [], error: null }));
    mockFrom.mockReturnValue(builder);

    const result = await runBalanceReminders();

    expect(result).toEqual({ processed: 0, sent: 0, failed: 0 });
  });
});
