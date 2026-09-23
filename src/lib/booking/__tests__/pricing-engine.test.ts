import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import {
  calculateQuote,
  resolveSeason,
  isWeekendOrHoliday,
  getMinHours,
  formatQuoteSummary,
} from "../pricing-engine";
import type { Yacht, SeasonPricing } from "@/types/yacht";
import type { Extra } from "@/types/booking";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// Freeze "now" so the fixed reference dates below stay in the future and the
// past_date check doesn't start failing once the calendar passes them.
const FROZEN_NOW = new Date("2026-01-01T00:00:00+04:00");

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(FROZEN_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

// Reference dates (Dubai local, UTC+4), all after FROZEN_NOW so past_date
// checks don't trip unrelated tests. Verified weekdays (UAE weekend = Fri/Sat):
//   2026-12-10 Thu (weekday)
//   2026-12-11 Fri (weekend)
//   2026-12-12 Sat (weekend)
//   2026-12-13 Sun (weekday, working day in UAE)
//   2026-12-02 Wed (UAE National Day holiday -> treated as weekend)
const WEEKDAY_DATE = "2026-12-10T12:00:00+04:00";
const FRIDAY_DATE = "2026-12-11T12:00:00+04:00";
const SATURDAY_DATE = "2026-12-12T12:00:00+04:00";
const SUNDAY_DATE = "2026-12-13T12:00:00+04:00";
const HOLIDAY_DATE = "2026-12-02T12:00:00+04:00";

const winterWeekday: SeasonPricing = {
  season: "Winter",
  period: "Oct - Apr",
  hourly: 1000,
  daily: null,
  weekly: null,
  monthly: null,
  hourlyB2B: 900,
  validFrom: "10-01",
  validTo: "04-30",
  isWeekend: false,
};

const winterWeekend: SeasonPricing = {
  season: "Winter",
  period: "Oct - Apr",
  hourly: 1200,
  daily: null,
  weekly: null,
  monthly: null,
  hourlyB2B: 1100,
  validFrom: "10-01",
  validTo: "04-30",
  isWeekend: true,
};

const summerWeekday: SeasonPricing = {
  season: "Summer",
  period: "May - Sep",
  hourly: 800,
  daily: null,
  weekly: null,
  monthly: null,
  validFrom: "05-01",
  validTo: "09-30",
  isWeekend: false,
};

function makeYacht(overrides: Partial<Yacht> = {}): Yacht {
  return {
    slug: "test-yacht",
    name: "Test Yacht",
    tagline: "",
    description: "",
    builder: "",
    year: 2020,
    length: { feet: 80, meters: 24 },
    capacity: 12,
    location: "Dubai Marina",
    images: [],
    heroImage: "",
    specs: [],
    amenities: [],
    pricing: [winterWeekday, winterWeekend, summerWeekday],
    included: [],
    featured: false,
    youtubeShorts: [],
    youtubeVideo: "",
    showVideos: false,
    dailyRules: "",
    weeklyRules: "",
    minHoursWeekday: 2,
    minHoursWeekend: 4,
    currency: "AED",
    bookingEnabled: true,
    ...overrides,
  };
}

function makeExtra(overrides: Partial<Extra> = {}): Extra {
  return {
    id: "extra-1",
    slug: "captain",
    name: "Captain",
    description: "",
    price: 100,
    unit: "per_booking",
    category: "service",
    image: "",
    active: true,
    sortOrder: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isWeekendOrHoliday / getMinHours
// ---------------------------------------------------------------------------

describe("isWeekendOrHoliday", () => {
  it("returns false for a Thursday", () => {
    expect(isWeekendOrHoliday(new Date(WEEKDAY_DATE))).toBe(false);
  });

  it("returns true for Friday", () => {
    expect(isWeekendOrHoliday(new Date(FRIDAY_DATE))).toBe(true);
  });

  it("returns true for Saturday", () => {
    expect(isWeekendOrHoliday(new Date(SATURDAY_DATE))).toBe(true);
  });

  it("returns false for Sunday (working day in UAE)", () => {
    expect(isWeekendOrHoliday(new Date(SUNDAY_DATE))).toBe(false);
  });

  it("returns true for a public holiday that falls on a weekday", () => {
    expect(isWeekendOrHoliday(new Date(HOLIDAY_DATE))).toBe(true);
  });
});

describe("getMinHours", () => {
  it("uses minHoursWeekday on a weekday", () => {
    const yacht = makeYacht({ minHoursWeekday: 3 });
    expect(getMinHours(yacht, new Date(WEEKDAY_DATE))).toBe(3);
  });

  it("uses minHoursWeekend on a weekend", () => {
    const yacht = makeYacht({ minHoursWeekend: 5 });
    expect(getMinHours(yacht, new Date(FRIDAY_DATE))).toBe(5);
  });

  it("falls back to MIN_HOURS_FALLBACK when unset", () => {
    const yacht = makeYacht({ minHoursWeekday: undefined, minHoursWeekend: undefined });
    expect(getMinHours(yacht, new Date(WEEKDAY_DATE))).toBe(2);
    expect(getMinHours(yacht, new Date(FRIDAY_DATE))).toBe(4);
  });

  it("treats a holiday weekday as a weekend for min hours", () => {
    const yacht = makeYacht({ minHoursWeekday: 2, minHoursWeekend: 6 });
    expect(getMinHours(yacht, new Date(HOLIDAY_DATE))).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// resolveSeason
// ---------------------------------------------------------------------------

describe("resolveSeason", () => {
  it("resolves the exact weekday row within a year-wrapping range (Oct -> Apr)", () => {
    const result = resolveSeason([winterWeekday, winterWeekend, summerWeekday], new Date(WEEKDAY_DATE), false);
    expect(result?.hourly).toBe(1000);
  });

  it("resolves the exact weekend row within a year-wrapping range", () => {
    const result = resolveSeason([winterWeekday, winterWeekend, summerWeekday], new Date(FRIDAY_DATE), true);
    expect(result?.hourly).toBe(1200);
  });

  it("resolves the summer season for a mid-year date", () => {
    const result = resolveSeason(
      [winterWeekday, winterWeekend, summerWeekday],
      new Date("2026-07-15T12:00:00+04:00"),
      false
    );
    expect(result?.hourly).toBe(800);
  });

  it("falls back to a matching-date row with any isWeekend when the exact isWeekend match is missing", () => {
    const onlyWeekend: SeasonPricing = { ...winterWeekend };
    const result = resolveSeason([onlyWeekend], new Date(WEEKDAY_DATE), false);
    expect(result?.hourly).toBe(1200);
  });

  it("falls back to the lowest non-null hourly rate when no row has date ranges", () => {
    const noRanges: SeasonPricing[] = [
      { ...winterWeekday, validFrom: undefined, validTo: undefined, hourly: 1500 },
      { ...summerWeekday, validFrom: undefined, validTo: undefined, hourly: 700 },
    ];
    const result = resolveSeason(noRanges, new Date(WEEKDAY_DATE), false);
    expect(result?.hourly).toBe(700);
  });

  it("returns null when no row has an hourly rate at all", () => {
    const noHourly: SeasonPricing[] = [
      { ...winterWeekday, hourly: null },
      { ...summerWeekday, hourly: null },
    ];
    const result = resolveSeason(noHourly, new Date(WEEKDAY_DATE), false);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateQuote — bonus hours
// ---------------------------------------------------------------------------

describe("calculateQuote — bonus hours", () => {
  it("gives 0 bonus hours for 3 paid hours", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.bonusHours).toBe(0);
      expect(q.totalHours).toBe(3);
    }
  });

  it("gives 1 bonus hour for 4 paid hours", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 4,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.bonusHours).toBe(1);
      expect(q.totalHours).toBe(5);
    }
  });

  it("gives 2 bonus hours for 8 paid hours", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 8,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.bonusHours).toBe(2);
      expect(q.totalHours).toBe(10);
    }
  });
});

// ---------------------------------------------------------------------------
// calculateQuote — extras
// ---------------------------------------------------------------------------

describe("calculateQuote — extras", () => {
  it("charges per_booking extras once regardless of hours/guests", () => {
    const extra = makeExtra({ unit: "per_booking", price: 500 });
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 4,
      guests: 6,
      extras: [{ extra, qty: 1 }],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.extras[0].amount).toBe(500);
      expect(q.extrasAmount).toBe(500);
    }
  });

  it("charges per_hour extras by paid hours (not total incl. bonus)", () => {
    const extra = makeExtra({ unit: "per_hour", price: 50, slug: "fuel" });
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 4, // 1 bonus hour -> totalHours 5, but per_hour uses paid hours only
      guests: 6,
      extras: [{ extra, qty: 1 }],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.extras[0].amount).toBe(50 * 4);
    }
  });

  it("charges per_guest extras by guest count", () => {
    const extra = makeExtra({ unit: "per_guest", price: 75, slug: "catering" });
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 8,
      extras: [{ extra, qty: 1 }],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.extras[0].amount).toBe(75 * 8);
    }
  });

  it("multiplies by qty for any unit type", () => {
    const extra = makeExtra({ unit: "per_booking", price: 200, slug: "decoration" });
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [{ extra, qty: 3 }],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.extras[0].amount).toBe(600);
    }
  });

  it("reports invalid_extra_qty for a zero or negative quantity", () => {
    const extra = makeExtra({ unit: "per_booking", price: 200 });
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [{ extra, qty: 0 }],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "invalid_extra_qty")).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// calculateQuote — errors
// ---------------------------------------------------------------------------

describe("calculateQuote — validation errors", () => {
  it("reports capacity error when guests exceed yacht capacity", () => {
    const q = calculateQuote({
      yacht: makeYacht({ capacity: 10 }),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 15,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "capacity")).toBe(true);
    }
  });

  it("reports min_hours error on a weekend when below minHoursWeekend", () => {
    const q = calculateQuote({
      yacht: makeYacht({ minHoursWeekend: 4 }),
      startsAt: new Date(FRIDAY_DATE),
      hours: 2,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "min_hours")).toBe(true);
    }
  });

  it("reports max_hours error when hours exceed MAX_HOURS", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 13,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "max_hours")).toBe(true);
    }
  });

  it("reports outside_operating_hours when starting before 08:00 Dubai time", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date("2026-12-10T07:00:00+04:00"),
      hours: 3,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "outside_operating_hours")).toBe(true);
    }
  });

  it("reports outside_operating_hours when the bonus hour pushes the end past 22:00", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date("2026-12-10T21:00:00+04:00"),
      hours: 4, // + 1 bonus hour -> ends 02:00, past 22:00
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "outside_operating_hours")).toBe(true);
    }
  });

  it("reports past_date for a date in the past", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date("2020-01-01T12:00:00+04:00"),
      hours: 3,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "past_date")).toBe(true);
    }
  });

  it("reports no_pricing when the yacht has no hourly rate anywhere", () => {
    const q = calculateQuote({
      yacht: makeYacht({
        pricing: [
          { ...winterWeekday, hourly: null, hourlyB2B: null },
          { ...summerWeekday, hourly: null },
        ],
      }),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "no_pricing")).toBe(true);
    }
  });

  it("reports booking_disabled when the yacht has bookings turned off", () => {
    const q = calculateQuote({
      yacht: makeYacht({ bookingEnabled: false }),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      expect(q.errors.some((e) => e.code === "booking_disabled")).toBe(true);
    }
  });

  it("collects multiple errors in a single call rather than stopping at the first", () => {
    const q = calculateQuote({
      yacht: makeYacht({ capacity: 5, minHoursWeekend: 4 }),
      startsAt: new Date(FRIDAY_DATE),
      hours: 1, // below min_hours
      guests: 20, // over capacity
      extras: [],
    });
    expect(q.ok).toBe(false);
    if (!q.ok) {
      const codes = q.errors.map((e) => e.code);
      expect(codes).toContain("min_hours");
      expect(codes).toContain("capacity");
    }
  });
});

// ---------------------------------------------------------------------------
// calculateQuote — money
// ---------------------------------------------------------------------------

describe("calculateQuote — money", () => {
  it("rounds the deposit up (Math.ceil) when total is odd", () => {
    // hourly 1000 * 3 hours = 3000 (even) -> add an odd extra to force rounding.
    const extra = makeExtra({ unit: "per_booking", price: 1 });
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [{ extra, qty: 1 }],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.totalAmount).toBe(3001);
      expect(q.depositAmount).toBe(Math.ceil(3001 * 0.5));
      expect(q.depositAmount).toBe(1501);
      expect(q.balanceAmount).toBe(q.totalAmount - q.depositAmount);
    }
  });

  it("uses the b2b hourly rate when b2b is true and hourlyB2B is present", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 4,
      extras: [],
      b2b: true,
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.hourlyRate).toBe(900); // winterWeekday.hourlyB2B
      expect(q.baseAmount).toBe(2700);
    }
  });

  it("falls back to the retail hourly rate when b2b is true but hourlyB2B is absent", () => {
    const q = calculateQuote({
      yacht: makeYacht({
        pricing: [{ ...summerWeekday, hourlyB2B: undefined }],
      }),
      startsAt: new Date("2026-09-23T12:00:00+04:00"),
      hours: 3,
      guests: 4,
      extras: [],
      b2b: true,
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.hourlyRate).toBe(800);
    }
  });

  it("returns the season name and weekend flag on a successful quote", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(FRIDAY_DATE),
      hours: 4,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(q.season).toBe("Winter");
      expect(q.isWeekend).toBe(true);
    }
  });

  it("computes endsAt including bonus hours", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date("2026-12-10T08:00:00+04:00"),
      hours: 8,
      guests: 4,
      extras: [],
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      // 8 paid + 2 bonus = 10 total hours -> 08:00 + 10h = 18:00
      const endsAtDubai = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(q.endsAt);
      expect(endsAtDubai).toBe("18:00");
    }
  });
});

// ---------------------------------------------------------------------------
// formatQuoteSummary
// ---------------------------------------------------------------------------

describe("formatQuoteSummary", () => {
  it("produces a readable summary for a successful quote", () => {
    const q = calculateQuote({
      yacht: makeYacht(),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 4,
      guests: 4,
      extras: [],
    });
    const text = formatQuoteSummary(q, "Majesty 88");
    expect(text).toContain("Majesty 88");
    expect(text).toContain("Deposit");
    expect(text).toContain("Balance");
  });

  it("produces a readable error summary for a failed quote", () => {
    const q = calculateQuote({
      yacht: makeYacht({ capacity: 2 }),
      startsAt: new Date(WEEKDAY_DATE),
      hours: 3,
      guests: 10,
      extras: [],
    });
    const text = formatQuoteSummary(q, "Majesty 88");
    expect(text).toContain("Unable to generate a quote");
  });
});
