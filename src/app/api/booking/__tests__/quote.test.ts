import { describe, it, expect, vi, beforeEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";

const mockCreateQuote = vi.fn();
vi.mock("@/lib/booking/quotes", () => ({
  createQuote: (...args: unknown[]) => mockCreateQuote(...args),
}));

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("https://example.com/api/booking/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const validBody = {
  yachtSlug: "test-yacht",
  date: "2026-10-01",
  startHour: 10,
  hours: 4,
  guests: 6,
  extras: [{ slug: "chef", qty: 1 }],
};

describe("POST /api/booking/quote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStateForTests();
  });

  it("returns 400 with validation_error on an invalid body", async () => {
    const { POST } = await import("../quote/route");
    const response = await POST(makeRequest({ ...validBody, hours: 0 }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("validation_error");
    expect(mockCreateQuote).not.toHaveBeenCalled();
  });

  it("forwards a valid body to createQuote with source: web", async () => {
    mockCreateQuote.mockResolvedValue({
      ok: true,
      quoteId: "booking-1",
      quote: { totalAmount: 4000 },
      yacht: { slug: "test-yacht", name: "Test Yacht" },
      startsAt: "2026-10-01T06:00:00.000Z",
      endsAt: "2026-10-01T10:00:00.000Z",
      expiresAt: "2026-10-01T06:30:00.000Z",
      summary: "Charter Quote",
    });

    const { POST } = await import("../quote/route");
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.quoteId).toBe("booking-1");
    expect(mockCreateQuote).toHaveBeenCalledWith(
      expect.objectContaining({ yachtSlug: "test-yacht", source: "web" })
    );
  });

  it("returns 400 with the error code/message/errors on failure", async () => {
    mockCreateQuote.mockResolvedValue({
      ok: false,
      code: "quote_invalid",
      message: "Unable to generate a quote",
      errors: [{ code: "min_hours", message: "Minimum charter length is 6 hours." }],
    });

    const { POST } = await import("../quote/route");
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("quote_invalid");
    expect(json.errors).toEqual([{ code: "min_hours", message: "Minimum charter length is 6 hours." }]);
  });

  it("includes conflicts when code is unavailable", async () => {
    mockCreateQuote.mockResolvedValue({
      ok: false,
      code: "unavailable",
      message: "Not available",
      conflicts: [{ source: "booking", start: new Date(), end: new Date() }],
    });

    const { POST } = await import("../quote/route");
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("unavailable");
    expect(json.conflicts).toHaveLength(1);
  });

  it("rate limits after 10 requests per IP within the window", async () => {
    mockCreateQuote.mockResolvedValue({ ok: true, quoteId: "b1", quote: {}, yacht: {}, startsAt: "", endsAt: "", expiresAt: "", summary: "" });
    const { POST } = await import("../quote/route");
    const ip = "9.9.9.9";

    for (let i = 0; i < 10; i++) {
      const response = await POST(makeRequest(validBody, ip));
      expect(response.status).toBe(200);
    }

    const blocked = await POST(makeRequest(validBody, ip));
    expect(blocked.status).toBe(429);
  });
});
