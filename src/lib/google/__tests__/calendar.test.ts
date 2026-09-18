import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFreebusyQuery = vi.fn();
const mockEventsInsert = vi.fn();
const mockEventsDelete = vi.fn();

vi.mock("googleapis", () => {
  class FakeJWT {
    opts: unknown;
    constructor(opts: unknown) {
      this.opts = opts;
    }
  }
  return {
    google: {
      auth: {
        JWT: FakeJWT,
      },
      calendar: vi.fn(() => ({
        freebusy: { query: mockFreebusyQuery },
        events: { insert: mockEventsInsert, delete: mockEventsDelete },
      })),
    },
  };
});

const validKey = Buffer.from(
  JSON.stringify({ client_email: "svc@example.iam.gserviceaccount.com", private_key: "fake-key" })
).toString("base64");

describe("google/calendar", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("isCalendarConfigured", () => {
    it("is false when no key env vars are set", async () => {
      const { isCalendarConfigured } = await import("../calendar");
      expect(isCalendarConfigured()).toBe(false);
    });

    it("is true when GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY is set", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      const { isCalendarConfigured } = await import("../calendar");
      expect(isCalendarConfigured()).toBe(true);
    });

    it("falls back to GOOGLE_SERVICE_ACCOUNT_KEY", async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY = validKey;
      const { isCalendarConfigured } = await import("../calendar");
      expect(isCalendarConfigured()).toBe(true);
    });
  });

  describe("getBusyIntervals", () => {
    it("returns source 'unavailable' with empty busy when not configured", async () => {
      const { getBusyIntervals } = await import("../calendar");
      const result = await getBusyIntervals("cal-1", new Date("2026-01-01"), new Date("2026-01-02"));
      expect(result).toEqual({ busy: [], source: "unavailable" });
    });

    it("returns busy intervals from freebusy.query when configured", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockFreebusyQuery.mockResolvedValue({
        data: {
          calendars: {
            "cal-1": {
              busy: [{ start: "2026-01-01T08:00:00.000Z", end: "2026-01-01T10:00:00.000Z" }],
            },
          },
        },
      });

      const { getBusyIntervals, __clearBusyCacheForTests } = await import("../calendar");
      __clearBusyCacheForTests();

      const result = await getBusyIntervals("cal-1", new Date("2026-01-01T00:00:00Z"), new Date("2026-01-02T00:00:00Z"));
      expect(result.source).toBe("google");
      expect(result.busy).toHaveLength(1);
      expect(result.busy[0].start.toISOString()).toBe("2026-01-01T08:00:00.000Z");
    });

    it("caches results for 60s per calendar+window", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockFreebusyQuery.mockResolvedValue({ data: { calendars: { "cal-1": { busy: [] } } } });

      const { getBusyIntervals, __clearBusyCacheForTests } = await import("../calendar");
      __clearBusyCacheForTests();

      const timeMin = new Date("2026-01-01T00:00:00Z");
      const timeMax = new Date("2026-01-02T00:00:00Z");
      await getBusyIntervals("cal-1", timeMin, timeMax);
      await getBusyIntervals("cal-1", timeMin, timeMax);

      expect(mockFreebusyQuery).toHaveBeenCalledTimes(1);
    });

    it("returns 'unavailable' and logs when the API call fails", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockFreebusyQuery.mockRejectedValue(new Error("boom"));
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { getBusyIntervals, __clearBusyCacheForTests } = await import("../calendar");
      __clearBusyCacheForTests();

      const result = await getBusyIntervals("cal-1", new Date("2026-01-01"), new Date("2026-01-02"));
      expect(result).toEqual({ busy: [], source: "unavailable" });
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });
  });

  describe("createCharterEvent", () => {
    it("returns null when not configured", async () => {
      const { createCharterEvent } = await import("../calendar");
      const result = await createCharterEvent("cal-1", {
        summary: "Charter",
        start: new Date("2026-01-01T10:00:00Z"),
        end: new Date("2026-01-01T14:00:00Z"),
      });
      expect(result).toBeNull();
    });

    it("returns the created event id on success", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockEventsInsert.mockResolvedValue({ data: { id: "evt-123" } });

      const { createCharterEvent } = await import("../calendar");
      const result = await createCharterEvent("cal-1", {
        summary: "Charter",
        description: "desc",
        start: new Date("2026-01-01T10:00:00Z"),
        end: new Date("2026-01-01T14:00:00Z"),
        attendeesEmail: "guest@example.com",
      });

      expect(result).toBe("evt-123");
      expect(mockEventsInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: "cal-1",
          requestBody: expect.objectContaining({
            summary: "Charter",
            start: expect.objectContaining({ timeZone: "Asia/Dubai" }),
            end: expect.objectContaining({ timeZone: "Asia/Dubai" }),
            attendees: [{ email: "guest@example.com" }],
          }),
        })
      );
    });

    it("returns null and logs when the API call fails", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockEventsInsert.mockRejectedValue(new Error("boom"));
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { createCharterEvent } = await import("../calendar");
      const result = await createCharterEvent("cal-1", {
        summary: "Charter",
        start: new Date("2026-01-01T10:00:00Z"),
        end: new Date("2026-01-01T14:00:00Z"),
      });

      expect(result).toBeNull();
      errSpy.mockRestore();
    });
  });

  describe("deleteCharterEvent", () => {
    it("returns false when not configured", async () => {
      const { deleteCharterEvent } = await import("../calendar");
      expect(await deleteCharterEvent("cal-1", "evt-1")).toBe(false);
    });

    it("returns true on success", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockEventsDelete.mockResolvedValue({});
      const { deleteCharterEvent } = await import("../calendar");
      expect(await deleteCharterEvent("cal-1", "evt-1")).toBe(true);
      expect(mockEventsDelete).toHaveBeenCalledWith({ calendarId: "cal-1", eventId: "evt-1" });
    });

    it("returns false and logs on failure", async () => {
      process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY = validKey;
      mockEventsDelete.mockRejectedValue(new Error("boom"));
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { deleteCharterEvent } = await import("../calendar");
      expect(await deleteCharterEvent("cal-1", "evt-1")).toBe(false);
      errSpy.mockRestore();
    });
  });
});
