import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateAdminSupabase = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: (...args: unknown[]) => mockCreateAdminSupabase(...args),
  isAdminSupabaseConfigured: () => true,
}));

type QueryResult = { data: unknown; error: unknown };

/** A chainable fake query builder: every listed method returns itself, and
 * the object is both awaitable directly (mirrors Supabase's PostgrestBuilder
 * being thenable) and exposes `.single()` for the common single-row case. */
function buildChain(result: QueryResult) {
  const chain: Record<string, unknown> = {};
  const passthrough = ["select", "eq", "in", "lt", "order", "update", "insert"];
  for (const method of passthrough) {
    chain[method] = vi.fn(() => chain);
  }
  chain.single = vi.fn(() => Promise.resolve(result));
  chain.then = (resolve: (v: QueryResult) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}

/** Builds a fake admin Supabase client. Each `.from(table)` call consumes
 * the next queued response for that table (the last queued response is
 * reused once the queue is exhausted). */
function makeSupabase(tableQueues: Record<string, QueryResult[]>) {
  const counters: Record<string, number> = {};
  const from = vi.fn((table: string) => {
    const queue = tableQueues[table] ?? [];
    const i = counters[table] ?? 0;
    counters[table] = i + 1;
    const result = queue[i] ?? queue[queue.length - 1] ?? { data: null, error: null };
    return buildChain(result);
  });
  return { from };
}

beforeEach(() => {
  vi.clearAllMocks();
});

const RAW_BOOKING = {
  id: "booking-1",
  yacht_id: "yacht-1",
  status: "quote",
  starts_at: "2026-12-10T06:00:00.000Z",
  ends_at: "2026-12-10T10:00:00.000Z",
  hours: 4,
  guests: 6,
  customer_name: null,
  customer_email: null,
  customer_phone: null,
  source: "web",
  base_amount: 4000,
  extras_amount: 500,
  bonus_hours: 1,
  total_amount: 4500,
  deposit_amount: 2250,
  currency: "AED",
  quote_expires_at: "2026-12-10T05:30:00.000Z",
  hold_expires_at: null,
  stripe_checkout_id: null,
  stripe_payment_intent_id: null,
  gcal_event_id: null,
  notes: "",
  created_at: "2026-12-01T00:00:00.000Z",
  updated_at: "2026-12-01T00:00:00.000Z",
};

describe("getYachtBookingInfo", () => {
  it("maps a yachts row to the booking-relevant fields", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({
        yachts: [
          {
            data: { id: "yacht-1", slug: "test-yacht", name: "Test Yacht", calendar_id: "cal-1", booking_enabled: true },
            error: null,
          },
        ],
      })
    );
    const { getYachtBookingInfo } = await import("../bookings-db");

    const result = await getYachtBookingInfo("test-yacht");

    expect(result).toEqual({
      id: "yacht-1",
      slug: "test-yacht",
      name: "Test Yacht",
      calendarId: "cal-1",
      bookingEnabled: true,
    });
  });

  it("returns null when the yacht is not found", async () => {
    mockCreateAdminSupabase.mockReturnValue(makeSupabase({ yachts: [{ data: null, error: { message: "not found" } }] }));
    const { getYachtBookingInfo } = await import("../bookings-db");

    expect(await getYachtBookingInfo("nope")).toBeNull();
  });
});

describe("insertBooking", () => {
  it("inserts a row and returns the mapped booking", async () => {
    mockCreateAdminSupabase.mockReturnValue(makeSupabase({ bookings: [{ data: RAW_BOOKING, error: null }] }));
    const { insertBooking } = await import("../bookings-db");

    const result = await insertBooking({
      yacht_id: "yacht-1",
      starts_at: RAW_BOOKING.starts_at,
      ends_at: RAW_BOOKING.ends_at,
      hours: 4,
      guests: 6,
    });

    expect(result.id).toBe("booking-1");
    expect(result.totalAmount).toBe(4500);
    expect(result.status).toBe("quote");
  });

  it("throws when the insert fails", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({ bookings: [{ data: null, error: { message: "insert failed" } }] })
    );
    const { insertBooking } = await import("../bookings-db");

    await expect(
      insertBooking({ yacht_id: "yacht-1", starts_at: "x", ends_at: "y", hours: 1, guests: 1 })
    ).rejects.toThrow(/insert failed/);
  });
});

describe("insertBookingExtras", () => {
  it("is a no-op for an empty array", async () => {
    const supabase = makeSupabase({});
    mockCreateAdminSupabase.mockReturnValue(supabase);
    const { insertBookingExtras } = await import("../bookings-db");

    await insertBookingExtras([]);

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("inserts rows and throws on error", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({ booking_extras: [{ data: null, error: { message: "boom" } }] })
    );
    const { insertBookingExtras } = await import("../bookings-db");

    await expect(
      insertBookingExtras([{ booking_id: "booking-1", extra_id: "extra-1", qty: 1, unit_price: 500, amount: 500 }])
    ).rejects.toThrow(/boom/);
  });
});

describe("getBookingById", () => {
  it("returns the mapped booking", async () => {
    mockCreateAdminSupabase.mockReturnValue(makeSupabase({ bookings: [{ data: RAW_BOOKING, error: null }] }));
    const { getBookingById } = await import("../bookings-db");

    const result = await getBookingById("booking-1");

    expect(result?.id).toBe("booking-1");
    expect(result?.depositAmount).toBe(2250);
  });

  it("returns null when not found", async () => {
    mockCreateAdminSupabase.mockReturnValue(makeSupabase({ bookings: [{ data: null, error: { message: "no rows" } }] }));
    const { getBookingById } = await import("../bookings-db");

    expect(await getBookingById("missing")).toBeNull();
  });
});

describe("getBookingWithExtras", () => {
  it("assembles the booking, yacht name/slug, and enriched extras", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({
        bookings: [{ data: RAW_BOOKING, error: null }],
        yachts: [{ data: { name: "Test Yacht", slug: "test-yacht" }, error: null }],
        booking_extras: [
          {
            data: [{ id: "be-1", booking_id: "booking-1", extra_id: "extra-1", qty: 1, unit_price: 500, amount: 500 }],
            error: null,
          },
        ],
        extras: [{ data: [{ id: "extra-1", name: "Photographer (2h)", slug: "photographer" }], error: null }],
      })
    );
    const { getBookingWithExtras } = await import("../bookings-db");

    const result = await getBookingWithExtras("booking-1");

    expect(result).not.toBeNull();
    expect(result?.yachtName).toBe("Test Yacht");
    expect(result?.yachtSlug).toBe("test-yacht");
    expect(result?.extras).toEqual([
      { id: "be-1", bookingId: "booking-1", extraId: "extra-1", qty: 1, unitPrice: 500, amount: 500, name: "Photographer (2h)", slug: "photographer" },
    ]);
  });

  it("returns null when the booking itself is not found", async () => {
    mockCreateAdminSupabase.mockReturnValue(makeSupabase({ bookings: [{ data: null, error: { message: "no rows" } }] }));
    const { getBookingWithExtras } = await import("../bookings-db");

    expect(await getBookingWithExtras("missing")).toBeNull();
  });

  it("returns null when the booking's yacht cannot be found", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({
        bookings: [{ data: RAW_BOOKING, error: null }],
        yachts: [{ data: null, error: { message: "no rows" } }],
      })
    );
    const { getBookingWithExtras } = await import("../bookings-db");

    expect(await getBookingWithExtras("booking-1")).toBeNull();
  });

  it("returns an empty extras array when there are none", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({
        bookings: [{ data: RAW_BOOKING, error: null }],
        yachts: [{ data: { name: "Test Yacht", slug: "test-yacht" }, error: null }],
        booking_extras: [{ data: [], error: null }],
      })
    );
    const { getBookingWithExtras } = await import("../bookings-db");

    const result = await getBookingWithExtras("booking-1");
    expect(result?.extras).toEqual([]);
  });
});

describe("updateBooking", () => {
  it("applies the patch and returns the updated booking", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({ bookings: [{ data: { ...RAW_BOOKING, status: "hold" }, error: null }] })
    );
    const { updateBooking } = await import("../bookings-db");

    const result = await updateBooking("booking-1", { status: "hold" });

    expect(result?.status).toBe("hold");
  });

  it("returns null on failure", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({ bookings: [{ data: null, error: { message: "update failed" } }] })
    );
    const { updateBooking } = await import("../bookings-db");

    expect(await updateBooking("booking-1", { status: "hold" })).toBeNull();
  });
});

describe("expireStaleQuotesAndHolds", () => {
  it("sums expired rows across both the quote and hold sweeps", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({
        bookings: [
          { data: [{ id: "a" }, { id: "b" }], error: null }, // stale quotes
          { data: [{ id: "c" }], error: null }, // stale holds
        ],
      })
    );
    const { expireStaleQuotesAndHolds } = await import("../bookings-db");

    const result = await expireStaleQuotesAndHolds();

    expect(result).toEqual({ expired: 3 });
  });

  it("treats a failed sweep as zero expired rather than throwing", async () => {
    mockCreateAdminSupabase.mockReturnValue(
      makeSupabase({
        bookings: [
          { data: null, error: { message: "boom" } },
          { data: [{ id: "c" }], error: null },
        ],
      })
    );
    const { expireStaleQuotesAndHolds } = await import("../bookings-db");

    const result = await expireStaleQuotesAndHolds();

    expect(result).toEqual({ expired: 1 });
  });
});
