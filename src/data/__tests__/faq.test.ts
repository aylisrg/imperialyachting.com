import { describe, it, expect } from "vitest";
import { buildYachtFAQ, fleetFAQ } from "../faq";

const SAMPLE_YACHT = {
  name: "Monte Carlo 6",
  capacity: 18,
  length: { feet: 60 },
  builder: "Beneteau",
  cabins: 3,
  minHoursWeekday: 2,
  minHoursWeekend: 4,
};

describe("buildYachtFAQ", () => {
  it("returns 6 FAQ items", () => {
    const items = buildYachtFAQ(SAMPLE_YACHT);
    expect(items).toHaveLength(6);
  });

  it("every item has a question and answer", () => {
    const items = buildYachtFAQ(SAMPLE_YACHT);
    for (const item of items) {
      expect(item.question).toBeTruthy();
      expect(item.answer).toBeTruthy();
    }
  });

  it("mentions the yacht name and capacity in the capacity question", () => {
    const [capacityItem] = buildYachtFAQ(SAMPLE_YACHT);
    expect(capacityItem.question).toContain(SAMPLE_YACHT.name);
    expect(capacityItem.answer).toContain(String(SAMPLE_YACHT.capacity));
    expect(capacityItem.answer).toContain(String(SAMPLE_YACHT.length.feet));
    expect(capacityItem.answer).toContain(SAMPLE_YACHT.builder);
  });

  it("mentions the minimum hours in the duration question", () => {
    const items = buildYachtFAQ(SAMPLE_YACHT);
    const durationItem = items[1];
    expect(durationItem.answer).toContain("2 hour");
    expect(durationItem.answer).toContain("4 hours");
  });

  it("falls back to default minimum hours when not provided", () => {
    const rest = { ...SAMPLE_YACHT };
    delete (rest as Partial<typeof SAMPLE_YACHT>).minHoursWeekday;
    delete (rest as Partial<typeof SAMPLE_YACHT>).minHoursWeekend;
    const items = buildYachtFAQ(rest);
    expect(items[1].answer).toContain("2 hour");
    expect(items[1].answer).toContain("4 hours");
  });

  it("mentions Dubai Harbour in the departure question", () => {
    const items = buildYachtFAQ(SAMPLE_YACHT);
    const departureItem = items[3];
    expect(departureItem.answer).toContain("Dubai Harbour");
  });

  it("appends two items from fleetFAQ", () => {
    const items = buildYachtFAQ(SAMPLE_YACHT);
    expect(items[4]).toEqual(fleetFAQ[1]);
    expect(items[5]).toEqual(fleetFAQ[2]);
  });

  it("omits cabins language when cabins is not provided", () => {
    const rest = { ...SAMPLE_YACHT };
    delete (rest as Partial<typeof SAMPLE_YACHT>).cabins;
    const [capacityItem] = buildYachtFAQ(rest);
    expect(capacityItem.answer).not.toContain("cabin");
  });
});
