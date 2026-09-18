import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRunHealthChecks = vi.fn();

vi.mock("@/lib/health/checks", async () => {
  const actual = await vi.importActual<typeof import("../checks")>("../checks");
  return {
    ...actual,
    runHealthChecks: (...args: unknown[]) => mockRunHealthChecks(...args),
  };
});

function makeReport(overrides: Record<string, unknown> = {}) {
  return {
    status: "healthy",
    checks: {
      database: { ok: true, configured: true },
      adminClient: { ok: true, configured: true },
      stripe: { ok: true, configured: true },
      googleCalendar: { ok: false, configured: false },
      email: { ok: false, configured: false },
      telegram: { ok: false, configured: false },
      mcp: { ok: true, configured: true },
      indexnow: { ok: false, configured: false },
    },
    timestamp: "2026-09-18T00:00:00.000Z",
    meta: { yachts: 5, destinations: 3 },
    ...overrides,
  };
}

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BOOKING_CRON_SECRET;
    delete process.env.ANALYTICS_CRON_SECRET;
  });

  it("returns a shallow, backward-compatible report for a plain GET", async () => {
    mockRunHealthChecks.mockResolvedValue(makeReport());

    const { GET } = await import("@/app/api/health/route");
    const res = await GET(new Request("https://example.com/api/health"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.yachts).toEqual({ count: 5 });
    expect(body.destinations).toEqual({ count: 3 });
    expect(body.checks.database.ok).toBe(true);
    expect(mockRunHealthChecks).toHaveBeenCalledWith(
      expect.objectContaining({ deep: false })
    );
  });

  it("returns 503 when the overall status is error", async () => {
    mockRunHealthChecks.mockResolvedValue(
      makeReport({
        status: "error",
        checks: {
          database: { ok: false, configured: true, detail: "connection refused" },
        },
        meta: {},
      })
    );

    const { GET } = await import("@/app/api/health/route");
    const res = await GET(new Request("https://example.com/api/health"));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.yachts).toEqual({ error: "connection refused" });
  });

  it("rejects a deep health check without a valid bearer token", async () => {
    process.env.BOOKING_CRON_SECRET = "top-secret";

    const { GET } = await import("@/app/api/health/route");
    const res = await GET(new Request("https://example.com/api/health?deep=1"));

    expect(res.status).toBe(401);
    expect(mockRunHealthChecks).not.toHaveBeenCalled();
  });

  it("runs a deep health check with a valid bearer token", async () => {
    process.env.BOOKING_CRON_SECRET = "top-secret";
    mockRunHealthChecks.mockResolvedValue(makeReport());

    const { GET } = await import("@/app/api/health/route");
    const res = await GET(
      new Request("https://example.com/api/health?deep=1", {
        headers: { authorization: "Bearer top-secret" },
      })
    );

    expect(res.status).toBe(200);
    expect(mockRunHealthChecks).toHaveBeenCalledWith(
      expect.objectContaining({ deep: true, origin: "https://example.com" })
    );
  });

  it("falls back to ANALYTICS_CRON_SECRET when BOOKING_CRON_SECRET is unset", async () => {
    process.env.ANALYTICS_CRON_SECRET = "analytics-secret";
    mockRunHealthChecks.mockResolvedValue(makeReport());

    const { GET } = await import("@/app/api/health/route");
    const res = await GET(
      new Request("https://example.com/api/health?deep=1", {
        headers: { authorization: "Bearer analytics-secret" },
      })
    );

    expect(res.status).toBe(200);
  });
});
