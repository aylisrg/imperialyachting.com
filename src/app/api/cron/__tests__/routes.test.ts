import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExpireStaleQuotesAndHolds = vi.fn();
const mockRunBalanceReminders = vi.fn();

vi.mock("@/lib/booking/bookings-db", () => ({
  expireStaleQuotesAndHolds: (...args: unknown[]) => mockExpireStaleQuotesAndHolds(...args),
}));

vi.mock("@/lib/booking/balance", () => ({
  runBalanceReminders: (...args: unknown[]) => mockRunBalanceReminders(...args),
}));

function makeRequest(token?: string): Request {
  return new Request("https://example.com/api/cron/whatever", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  delete process.env.BOOKING_CRON_SECRET;
  delete process.env.CRON_SECRET;
});

describe("GET/POST /api/cron/expire-holds", () => {
  it("401s with no auth header", async () => {
    process.env.BOOKING_CRON_SECRET = "secret-1";
    const { GET } = await import("../expire-holds/route");

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(mockExpireStaleQuotesAndHolds).not.toHaveBeenCalled();
  });

  it("401s with a wrong token", async () => {
    process.env.BOOKING_CRON_SECRET = "secret-1";
    const { POST } = await import("../expire-holds/route");

    const response = await POST(makeRequest("wrong-token"));

    expect(response.status).toBe(401);
  });

  it("accepts BOOKING_CRON_SECRET", async () => {
    process.env.BOOKING_CRON_SECRET = "secret-1";
    mockExpireStaleQuotesAndHolds.mockResolvedValue({ expired: 3 });
    const { POST } = await import("../expire-holds/route");

    const response = await POST(makeRequest("secret-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, expired: 3 });
    expect(mockExpireStaleQuotesAndHolds).toHaveBeenCalledTimes(1);
  });

  it("accepts CRON_SECRET (Vercel Cron)", async () => {
    process.env.CRON_SECRET = "vercel-secret";
    mockExpireStaleQuotesAndHolds.mockResolvedValue({ expired: 0 });
    const { GET } = await import("../expire-holds/route");

    const response = await GET(makeRequest("vercel-secret"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, expired: 0 });
  });
});

describe("GET/POST /api/cron/balance-reminders", () => {
  it("401s with no auth header", async () => {
    process.env.BOOKING_CRON_SECRET = "secret-1";
    const { GET } = await import("../balance-reminders/route");

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(mockRunBalanceReminders).not.toHaveBeenCalled();
  });

  it("401s with a wrong token", async () => {
    process.env.BOOKING_CRON_SECRET = "secret-1";
    const { POST } = await import("../balance-reminders/route");

    const response = await POST(makeRequest("wrong-token"));

    expect(response.status).toBe(401);
  });

  it("accepts BOOKING_CRON_SECRET and returns the reminder tally", async () => {
    process.env.BOOKING_CRON_SECRET = "secret-1";
    mockRunBalanceReminders.mockResolvedValue({ processed: 2, sent: 2, failed: 0 });
    const { POST } = await import("../balance-reminders/route");

    const response = await POST(makeRequest("secret-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, processed: 2, sent: 2, failed: 0 });
  });

  it("accepts CRON_SECRET (Vercel Cron)", async () => {
    process.env.CRON_SECRET = "vercel-secret";
    mockRunBalanceReminders.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });
    const { GET } = await import("../balance-reminders/route");

    const response = await GET(makeRequest("vercel-secret"));

    expect(response.status).toBe(200);
  });
});
