import { describe, it, expect, vi, beforeEach } from "vitest";

const mockIsAdminSupabaseConfigured = vi.fn();
const mockCreateAdminSupabase = vi.fn();
const mockGetBusyIntervals = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: (...args: unknown[]) => mockCreateAdminSupabase(...args),
  isAdminSupabaseConfigured: (...args: unknown[]) => mockIsAdminSupabaseConfigured(...args),
}));

vi.mock("@/lib/google/calendar", () => ({
  getBusyIntervals: (...args: unknown[]) => mockGetBusyIntervals(...args),
}));

/** Builds a fake Supabase query chain: from().select().eq().in().lt().gt() -> {data, error}. */
function buildSupabaseChain(data: unknown[] | null, error: { message: string } | null = null) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.lt = vi.fn(() => chain);
  chain.gt = vi.fn(() => Promise.resolve({ data, error }));
  return { from: vi.fn(() => chain) };
}

describe("booking/availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAdminSupabaseConfigured.mockReturnValue(true);
  });

  describe("intervalsOverlap", () => {
    it("detects direct overlap with no buffer", async () => {
      const { intervalsOverlap } = await import("../availability");
      const a = { start: new Date("2026-01-01T10:00:00Z"), end: new Date("2026-01-01T12:00:00Z") };
      const b = { start: new Date("2026-01-01T11:00:00Z"), end: new Date("2026-01-01T13:00:00Z") };
      expect(intervalsOverlap(a, b, 0)).toBe(true);
    });

    it("treats adjacent (touching) intervals as non-overlapping with no buffer", async () => {
      const { intervalsOverlap } = await import("../availability");
      const a = { start: new Date("2026-01-01T10:00:00Z"), end: new Date("2026-01-01T12:00:00Z") };
      const b = { start: new Date("2026-01-01T12:00:00Z"), end: new Date("2026-01-01T14:00:00Z") };
      expect(intervalsOverlap(a, b, 0)).toBe(false);
    });

    it("treats adjacent intervals as overlapping once a turnaround buffer is applied", async () => {
      const { intervalsOverlap } = await import("../availability");
      const a = { start: new Date("2026-01-01T10:00:00Z"), end: new Date("2026-01-01T12:00:00Z") };
      const b = { start: new Date("2026-01-01T12:00:00Z"), end: new Date("2026-01-01T14:00:00Z") };
      expect(intervalsOverlap(a, b, 60)).toBe(true);
    });

    it("does not overlap when gap exceeds buffer", async () => {
      const { intervalsOverlap } = await import("../availability");
      const a = { start: new Date("2026-01-01T10:00:00Z"), end: new Date("2026-01-01T12:00:00Z") };
      const b = { start: new Date("2026-01-01T13:30:00Z"), end: new Date("2026-01-01T14:00:00Z") };
      expect(intervalsOverlap(a, b, 60)).toBe(false);
    });
  });

  describe("dubaiLocalToUtc", () => {
    it("converts a Dubai local hour to the correct UTC instant (UTC+4)", async () => {
      const { dubaiLocalToUtc } = await import("../availability");
      const result = dubaiLocalToUtc("2026-01-01", 8);
      expect(result.toISOString()).toBe("2026-01-01T04:00:00.000Z");
    });
  });

  describe("getBookedIntervals", () => {
    it("returns [] and warns when admin supabase is not configured", async () => {
      mockIsAdminSupabaseConfigured.mockReturnValue(false);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { getBookedIntervals } = await import("../availability");
      const result = await getBookedIntervals("yacht-1", new Date("2026-01-01"), new Date("2026-01-02"));
      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("includes active holds but excludes expired holds", async () => {
      const now = Date.now();
      const rows = [
        {
          starts_at: "2026-01-01T10:00:00.000Z",
          ends_at: "2026-01-01T12:00:00.000Z",
          status: "hold",
          hold_expires_at: new Date(now + 60_000).toISOString(), // active
        },
        {
          starts_at: "2026-01-01T14:00:00.000Z",
          ends_at: "2026-01-01T16:00:00.000Z",
          status: "hold",
          hold_expires_at: new Date(now - 60_000).toISOString(), // expired
        },
        {
          starts_at: "2026-01-01T18:00:00.000Z",
          ends_at: "2026-01-01T20:00:00.000Z",
          status: "paid",
          hold_expires_at: null,
        },
      ];
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain(rows));

      const { getBookedIntervals } = await import("../availability");
      const result = await getBookedIntervals("yacht-1", new Date("2026-01-01"), new Date("2026-01-02"));

      expect(result).toHaveLength(2);
      expect(result[0].start.toISOString()).toBe("2026-01-01T10:00:00.000Z");
      expect(result[1].start.toISOString()).toBe("2026-01-01T18:00:00.000Z");
    });

    it("returns [] and logs on a Supabase error", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain(null, { message: "db down" }));
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getBookedIntervals } = await import("../availability");
      const result = await getBookedIntervals("yacht-1", new Date("2026-01-01"), new Date("2026-01-02"));
      expect(result).toEqual([]);
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });
  });

  describe("checkAvailability", () => {
    it("is available when there are no booking or calendar conflicts", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain([]));
      mockGetBusyIntervals.mockResolvedValue({ busy: [], source: "google" });

      const { checkAvailability } = await import("../availability");
      const result = await checkAvailability({
        yachtId: "yacht-1",
        calendarId: "cal-1",
        startsAt: new Date("2026-01-01T10:00:00Z"),
        endsAt: new Date("2026-01-01T14:00:00Z"),
      });

      expect(result).toEqual({ available: true, conflicts: [], calendarChecked: true });
    });

    it("flags a booking conflict with the turnaround buffer applied", async () => {
      mockCreateAdminSupabase.mockReturnValue(
        buildSupabaseChain([
          {
            starts_at: "2026-01-01T14:00:00.000Z",
            ends_at: "2026-01-01T16:00:00.000Z",
            status: "paid",
            hold_expires_at: null,
          },
        ])
      );
      mockGetBusyIntervals.mockResolvedValue({ busy: [], source: "google" });

      const { checkAvailability } = await import("../availability");
      // Ends exactly when the next booking starts — within the 60min buffer.
      const result = await checkAvailability({
        yachtId: "yacht-1",
        calendarId: "cal-1",
        startsAt: new Date("2026-01-01T10:00:00Z"),
        endsAt: new Date("2026-01-01T14:00:00Z"),
      });

      expect(result.available).toBe(false);
      expect(result.conflicts).toEqual([
        { source: "booking", start: new Date("2026-01-01T14:00:00.000Z"), end: new Date("2026-01-01T16:00:00.000Z") },
      ]);
    });

    it("returns calendarChecked=false but still trusts the booking-based result when the calendar is unavailable", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain([]));
      mockGetBusyIntervals.mockResolvedValue({ busy: [], source: "unavailable" });

      const { checkAvailability } = await import("../availability");
      const result = await checkAvailability({
        yachtId: "yacht-1",
        calendarId: "cal-1",
        startsAt: new Date("2026-01-01T10:00:00Z"),
        endsAt: new Date("2026-01-01T14:00:00Z"),
      });

      expect(result.calendarChecked).toBe(false);
      expect(result.available).toBe(true);
      expect(result.conflicts).toEqual([]);
    });

    it("skips the calendar check entirely when no calendarId is provided", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain([]));

      const { checkAvailability } = await import("../availability");
      const result = await checkAvailability({
        yachtId: "yacht-1",
        calendarId: null,
        startsAt: new Date("2026-01-01T10:00:00Z"),
        endsAt: new Date("2026-01-01T14:00:00Z"),
      });

      expect(result.calendarChecked).toBe(false);
      expect(mockGetBusyIntervals).not.toHaveBeenCalled();
    });
  });

  describe("getAvailableSlots", () => {
    it("enumerates hour-step slots and shortens runs around a 12:00-14:00 Dubai-local busy block", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain([]));
      // Busy 12:00-14:00 Dubai local == 08:00-10:00 UTC.
      mockGetBusyIntervals.mockResolvedValue({
        busy: [{ start: new Date("2026-01-01T08:00:00.000Z"), end: new Date("2026-01-01T10:00:00.000Z") }],
        source: "google",
      });

      const { getAvailableSlots } = await import("../availability");
      const result = await getAvailableSlots({
        yachtId: "yacht-1",
        calendarId: "cal-1",
        date: "2026-01-01",
        minHours: 2,
        maxHours: 12,
      });

      expect(result.calendarChecked).toBe(true);

      // A slot starting at 08:00 Dubai local (04:00Z) should be capped by the
      // buffered busy start (12:00 Dubai local minus 60min turnaround = 11:00 local).
      const slot8 = result.slots.find((s) => s.start === "2026-01-01T04:00:00.000Z");
      expect(slot8).toBeDefined();
      expect(slot8?.hours).toBe(3); // 08:00 -> 11:00 local (3h before the buffered busy start)

      // A slot starting inside the buffered busy window (11:00-15:00 local)
      // should not appear at all, since availableHours < minHours (2).
      const slot12 = result.slots.find((s) => s.start === "2026-01-01T08:00:00.000Z");
      expect(slot12).toBeUndefined();

      // A slot starting right after the buffered window (15:00 local = 11:00Z)
      // should be available up to closing time (22:00 local).
      const slot15 = result.slots.find((s) => s.start === "2026-01-01T11:00:00.000Z");
      expect(slot15).toBeDefined();
      expect(slot15?.hours).toBe(7); // 15:00 -> 22:00 local
    });

    it("returns calendarChecked=false when the calendar is unavailable but still returns booking-based slots", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain([]));
      mockGetBusyIntervals.mockResolvedValue({ busy: [], source: "unavailable" });

      const { getAvailableSlots } = await import("../availability");
      const result = await getAvailableSlots({
        yachtId: "yacht-1",
        calendarId: "cal-1",
        date: "2026-01-01",
        minHours: 2,
        maxHours: 12,
      });

      expect(result.calendarChecked).toBe(false);
      // Full operating window free -> first slot should run the full maxHours.
      const firstSlot = result.slots.find((s) => s.start === "2026-01-01T04:00:00.000Z");
      expect(firstSlot?.hours).toBe(12);
    });

    it("excludes runs shorter than minHours", async () => {
      mockCreateAdminSupabase.mockReturnValue(buildSupabaseChain([]));
      // Busy for almost the whole day, leaving only a 1-hour gap at the end.
      mockGetBusyIntervals.mockResolvedValue({
        busy: [{ start: new Date("2026-01-01T04:00:00.000Z"), end: new Date("2026-01-01T16:30:00.000Z") }],
        source: "google",
      });

      const { getAvailableSlots } = await import("../availability");
      const result = await getAvailableSlots({
        yachtId: "yacht-1",
        calendarId: "cal-1",
        date: "2026-01-01",
        minHours: 2,
        maxHours: 12,
      });

      // Remaining window after buffer (17:30Z) to close (18:00Z local 22:00) is only 0.5h, below minHours=2.
      expect(result.slots).toEqual([]);
    });
  });
});
