import { describe, it, expect, vi, beforeEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";

const mockCreateCheckout = vi.fn();
vi.mock("@/lib/booking/checkout", () => ({
  createCheckout: (...args: unknown[]) => mockCreateCheckout(...args),
}));

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("https://example.com/api/booking/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const validBody = {
  quoteId: "booking-1",
  customer: { name: "Jane Doe", email: "jane@example.com", phone: "+971500000000" },
  acceptTerms: true,
};

describe("POST /api/booking/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStateForTests();
  });

  it("returns 400 validation_error when acceptTerms is missing", async () => {
    const { acceptTerms: _unused, ...withoutTerms } = validBody;
    void _unused;
    const { POST } = await import("../checkout/route");
    const response = await POST(makeRequest(withoutTerms));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("validation_error");
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("returns 400 validation_error on an invalid email", async () => {
    const { POST } = await import("../checkout/route");
    const response = await POST(makeRequest({ ...validBody, customer: { ...validBody.customer, email: "nope" } }));

    expect(response.status).toBe(400);
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("forwards a valid body to createCheckout and returns the checkout URL", async () => {
    mockCreateCheckout.mockResolvedValue({
      ok: true,
      bookingId: "booking-1",
      checkoutUrl: "https://checkout.stripe.com/session-1",
      expiresAt: "2026-10-01T07:00:00.000Z",
      depositAmount: 2000,
      currency: "AED",
    });

    const { POST } = await import("../checkout/route");
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      checkoutUrl: "https://checkout.stripe.com/session-1",
      bookingId: "booking-1",
      expiresAt: "2026-10-01T07:00:00.000Z",
    });
    expect(mockCreateCheckout).toHaveBeenCalledWith({
      quoteId: "booking-1",
      customer: validBody.customer,
    });
  });

  it("returns 400 with the error code/message on failure", async () => {
    mockCreateCheckout.mockResolvedValue({
      ok: false,
      code: "expired",
      message: "This quote has expired. Please request a new quote.",
    });

    const { POST } = await import("../checkout/route");
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({
      error: "expired",
      message: "This quote has expired. Please request a new quote.",
    });
  });

  it("rate limits after 5 requests per IP within the window", async () => {
    mockCreateCheckout.mockResolvedValue({
      ok: true,
      bookingId: "b1",
      checkoutUrl: "https://checkout.stripe.com/x",
      expiresAt: "",
      depositAmount: 1,
      currency: "AED",
    });
    const { POST } = await import("../checkout/route");
    const ip = "8.8.8.8";

    for (let i = 0; i < 5; i++) {
      const response = await POST(makeRequest(validBody, ip));
      expect(response.status).toBe(200);
    }

    const blocked = await POST(makeRequest(validBody, ip));
    expect(blocked.status).toBe(429);
  });
});
