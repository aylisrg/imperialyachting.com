import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCreateServerSupabase = vi.fn();
const mockIsAdminSupabaseConfigured = vi.fn();
const mockCreateAdminSupabase = vi.fn();
const mockIsCalendarConfigured = vi.fn();
const mockGetBusyIntervals = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: (...args: unknown[]) => mockCreateAdminSupabase(...args),
  isAdminSupabaseConfigured: (...args: unknown[]) => mockIsAdminSupabaseConfigured(...args),
}));

vi.mock("@/lib/google/calendar", () => ({
  isCalendarConfigured: (...args: unknown[]) => mockIsCalendarConfigured(...args),
  getBusyIntervals: (...args: unknown[]) => mockGetBusyIntervals(...args),
}));

function healthySupabase(yachtCount = 3) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ count: yachtCount, error: null })),
    })),
  };
}

describe("health/checks", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.RESEND_API_KEY;
    delete process.env.BOOKING_FROM_EMAIL;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.INDEXNOW_KEY;

    mockIsAdminSupabaseConfigured.mockReturnValue(false);
    mockIsCalendarConfigured.mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns a shallow report with configured-only flags, no network calls", async () => {
    let call = 0;
    mockCreateServerSupabase.mockImplementation(async () => ({
      from: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ count: call++ === 0 ? 5 : 2, error: null })),
      })),
    }));

    const { runHealthChecks } = await import("../checks");
    const report = await runHealthChecks({ deep: false });

    expect(report.checks.database.ok).toBe(true);
    expect(report.meta?.yachts).toBe(5);
    expect(report.meta?.destinations).toBe(2);

    // No deep calls should have been attempted.
    expect(mockCreateAdminSupabase).not.toHaveBeenCalled();
    expect(mockGetBusyIntervals).not.toHaveBeenCalled();

    // Unconfigured integrations reported honestly.
    expect(report.checks.adminClient.configured).toBe(false);
    expect(report.checks.stripe.configured).toBe(false);
    expect(report.checks.googleCalendar.configured).toBe(false);
    expect(report.checks.email.configured).toBe(false);
    expect(report.checks.telegram.configured).toBe(false);
    expect(report.checks.indexnow.configured).toBe(false);

    expect(report.status).toBe("warning"); // adminClient/stripe unconfigured
  });

  it("marks the overall status as error when the database query fails", async () => {
    mockCreateServerSupabase.mockImplementation(async () => ({
      from: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ count: null, error: { message: "connection refused" } })),
      })),
    }));

    const { runHealthChecks } = await import("../checks");
    const report = await runHealthChecks({ deep: false });

    expect(report.status).toBe("error");
    expect(report.checks.database.ok).toBe(false);
    expect(report.checks.database.detail).toBe("connection refused");
  });

  it("reports warning (not error) when the database is reachable but empty", async () => {
    mockCreateServerSupabase.mockImplementation(async () => healthySupabase(0));

    const { runHealthChecks, DB_EMPTY_WARNING } = await import("../checks");
    const report = await runHealthChecks({ deep: false });

    expect(report.status).toBe("warning");
    expect(report.checks.database.ok).toBe(true);
    expect(report.checks.database.detail).toBe(DB_EMPTY_WARNING);
  });

  it("reports healthy when the database has data and booking-critical integrations are configured", async () => {
    mockCreateServerSupabase.mockImplementation(async () => healthySupabase(3));
    mockIsAdminSupabaseConfigured.mockReturnValue(true);
    process.env.STRIPE_SECRET_KEY = "sk_test_123";

    const { runHealthChecks } = await import("../checks");
    const report = await runHealthChecks({ deep: false });

    expect(report.status).toBe("healthy");
    expect(report.checks.adminClient.configured).toBe(true);
    expect(report.checks.stripe.configured).toBe(true);
  });

  it("runs the deep adminClient check against the admin client when configured", async () => {
    mockCreateServerSupabase.mockImplementation(async () => healthySupabase(3));
    mockIsAdminSupabaseConfigured.mockReturnValue(true);
    const limit = vi.fn(() => Promise.resolve({ data: [{ id: "1" }], error: null }));
    mockCreateAdminSupabase.mockReturnValue({
      from: vi.fn(() => ({ select: vi.fn(() => ({ limit })) })),
    });

    const { runHealthChecks } = await import("../checks");
    const report = await runHealthChecks({ deep: true });

    expect(mockCreateAdminSupabase).toHaveBeenCalled();
    expect(report.checks.adminClient.ok).toBe(true);
  });

  it("skips the deep googleCalendar freebusy check when no yacht has a calendar_id", async () => {
    mockIsCalendarConfigured.mockReturnValue(true);
    let call = 0;
    mockCreateServerSupabase.mockImplementation(async () => ({
      from: vi.fn(() => {
        call++;
        if (call === 3) {
          // third call is the calendar_id lookup
          return {
            select: vi.fn(() => ({
              not: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
            })),
          };
        }
        return { select: vi.fn(() => Promise.resolve({ count: 1, error: null })) };
      }),
    }));

    const { runHealthChecks } = await import("../checks");
    const report = await runHealthChecks({ deep: true });

    expect(mockGetBusyIntervals).not.toHaveBeenCalled();
    expect(report.checks.googleCalendar.ok).toBe(true);
    expect(report.checks.googleCalendar.detail).toMatch(/skipped/i);
  });
});
