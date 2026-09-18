import { describe, it, expect, vi, beforeEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";

const mockGetBookingWithExtras = vi.fn();
vi.mock("@/lib/booking/bookings-db", () => ({
  getBookingWithExtras: (...args: unknown[]) => mockGetBookingWithExtras(...args),
}));

function makeRequest(ip = "1.2.3.4") {
  return new Request("https://example.com/api/booking/booking-1", {
    headers: { "x-forwarded-for": ip },
  });
}

const params = Promise.resolve({ id: "booking-1" });

const bookingData = {
  booking: {
    id: "booking-1",
    yachtId: "yacht-1",
    status: "deposit_paid",
    startsAt: "2026-10-01T06:00:00.000Z",
    endsAt: "2026-10-01T10:00:00.000Z",
    hours: 4,
    guests: 6,
    customerName: "Jane Doe",
    customerEmail: "jane.doe@example.com",
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
    stripeCheckoutId: "cs_test_secret",
    stripePaymentIntentId: "pi_test_secret",
    gcalEventId: null,
    notes: "internal note — never expose",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  extras: [{ id: "be-1", bookingId: "booking-1", extraId: "extra-1", qty: 1, unitPrice: 500, amount: 500, name: "Chef", slug: "chef" }],
  yachtName: "Test Yacht",
  yachtSlug: "test-yacht",
};

describe("GET /api/booking/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStateForTests();
  });

  it("returns 404 for an unknown booking", async () => {
    mockGetBookingWithExtras.mockResolvedValue(null);
    const { GET } = await import("../[id]/route");
    const response = await GET(makeRequest(), { params });

    expect(response.status).toBe(404);
  });

  it("returns a public-safe summary with a masked email and no stripe ids, notes or phone", async () => {
    mockGetBookingWithExtras.mockResolvedValue(bookingData);
    const { GET } = await import("../[id]/route");
    const response = await GET(makeRequest(), { params });

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.id).toBe("booking-1");
    expect(json.status).toBe("deposit_paid");
    expect(json.yacht).toEqual({ slug: "test-yacht", name: "Test Yacht" });
    expect(json.customer.name).toBe("Jane Doe");
    expect(json.customer.email).not.toBe("jane.doe@example.com");
    expect(json.customer.email).toMatch(/^j\*+@example\.com$/);

    const serialized = JSON.stringify(json);
    expect(serialized).not.toContain("cs_test_secret");
    expect(serialized).not.toContain("pi_test_secret");
    expect(serialized).not.toContain("internal note");
    expect(serialized).not.toContain("+971500000000");
  });

  it("rate limits after 30 requests per IP within the window", async () => {
    mockGetBookingWithExtras.mockResolvedValue(bookingData);
    const { GET } = await import("../[id]/route");
    const ip = "7.7.7.7";

    for (let i = 0; i < 30; i++) {
      const response = await GET(makeRequest(ip), { params });
      expect(response.status).toBe(200);
    }

    const blocked = await GET(makeRequest(ip), { params });
    expect(blocked.status).toBe(429);
  });
});
