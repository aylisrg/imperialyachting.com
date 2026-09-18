import { describe, it, expect, vi, beforeEach } from "vitest";

const mockConstructEvent = vi.fn();
const mockMarkStripeEventProcessed = vi.fn();
const mockHandleCheckoutCompleted = vi.fn();
const mockHandleCheckoutExpired = vi.fn();
const mockHandleAsyncPaymentFailed = vi.fn();

vi.mock("stripe", () => {
  class MockStripe {
    webhooks = { constructEvent: mockConstructEvent };
  }
  return { default: MockStripe };
});

vi.mock("@/lib/booking/fulfilment", () => ({
  markStripeEventProcessed: (...args: unknown[]) => mockMarkStripeEventProcessed(...args),
  handleCheckoutCompleted: (...args: unknown[]) => mockHandleCheckoutCompleted(...args),
  handleCheckoutExpired: (...args: unknown[]) => mockHandleCheckoutExpired(...args),
  handleAsyncPaymentFailed: (...args: unknown[]) => mockHandleAsyncPaymentFailed(...args),
}));

function makeRequest(body: string, headers: Record<string, string> = { "stripe-signature": "sig_test" }) {
  return new Request("https://example.com/api/stripe/webhook", {
    method: "POST",
    headers,
    body,
  });
}

function makeEvent(type: string, session: Record<string, unknown> = { id: "cs_test_1" }) {
  return { id: "evt_1", type, data: { object: session } };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_123";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
  mockMarkStripeEventProcessed.mockResolvedValue(true);
  mockHandleCheckoutCompleted.mockResolvedValue({ ok: true, bookingId: "booking-1" });
  mockHandleCheckoutExpired.mockResolvedValue({ ok: true, bookingId: "booking-1" });
  mockHandleAsyncPaymentFailed.mockResolvedValue({ ok: true, bookingId: "booking-1" });
});

describe("POST /api/stripe/webhook", () => {
  it("returns 400 when the stripe-signature header is missing", async () => {
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}", {}));

    expect(response.status).toBe(400);
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(400);
  });

  it("returns 400 on an invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("signature mismatch");
    });
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("invalid_signature");
    expect(mockMarkStripeEventProcessed).not.toHaveBeenCalled();
  });

  it("returns 200 with duplicate:true and skips fulfilment for an already-seen event", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    mockMarkStripeEventProcessed.mockResolvedValue(false);
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ received: true, duplicate: true });
    expect(mockHandleCheckoutCompleted).not.toHaveBeenCalled();
  });

  it("returns 500 when recording the event fails (database unreachable)", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    mockMarkStripeEventProcessed.mockRejectedValue(new Error("connection refused"));
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(500);
  });

  it("dispatches checkout.session.completed to handleCheckoutCompleted", async () => {
    const session = { id: "cs_test_1", client_reference_id: "booking-1" };
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.completed", session));
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ received: true });
    expect(mockHandleCheckoutCompleted).toHaveBeenCalledWith(session);
  });

  it("dispatches checkout.session.async_payment_succeeded to handleCheckoutCompleted", async () => {
    const session = { id: "cs_test_1" };
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.async_payment_succeeded", session));
    const { POST } = await import("../webhook/route");

    await POST(makeRequest("{}"));

    expect(mockHandleCheckoutCompleted).toHaveBeenCalledWith(session);
  });

  it("dispatches checkout.session.expired to handleCheckoutExpired", async () => {
    const session = { id: "cs_test_1" };
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.expired", session));
    const { POST } = await import("../webhook/route");

    await POST(makeRequest("{}"));

    expect(mockHandleCheckoutExpired).toHaveBeenCalledWith(session);
    expect(mockHandleCheckoutCompleted).not.toHaveBeenCalled();
  });

  it("dispatches checkout.session.async_payment_failed to handleAsyncPaymentFailed", async () => {
    const session = { id: "cs_test_1" };
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.async_payment_failed", session));
    const { POST } = await import("../webhook/route");

    await POST(makeRequest("{}"));

    expect(mockHandleAsyncPaymentFailed).toHaveBeenCalledWith(session);
  });

  it("returns 200 and ignores unrelated event types", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("payment_intent.created"));
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(mockHandleCheckoutCompleted).not.toHaveBeenCalled();
    expect(mockHandleCheckoutExpired).not.toHaveBeenCalled();
    expect(mockHandleAsyncPaymentFailed).not.toHaveBeenCalled();
  });

  it("still returns 200 when the fulfilment handler itself throws", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.completed"));
    mockHandleCheckoutCompleted.mockRejectedValue(new Error("unexpected"));
    const { POST } = await import("../webhook/route");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
  });
});

describe("GET /api/stripe/webhook", () => {
  it("returns 405", async () => {
    const { GET } = await import("../webhook/route");

    const response = await GET();

    expect(response.status).toBe(405);
  });
});
