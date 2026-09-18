import { describe, it, expect } from "vitest";
import {
  leadReceivedAdmin,
  leadAutoReply,
  bookingDepositPaidCustomer,
  bookingDepositPaidAdmin,
  bookingBalanceReminder,
  formatDubai,
  type LeadLike,
  type BookingNotificationBase,
} from "../templates";
import { SITE_CONFIG } from "@/lib/constants";

const lead: LeadLike = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+971500000000",
  inquiry_type: "Charter",
  preferred_date: "2026-10-01",
  message: "Looking for a half-day charter for 8 guests.",
};

const booking: BookingNotificationBase = {
  yachtName: "Majesty 88",
  startsAt: new Date("2026-10-05T10:00:00.000Z"),
  hours: 4,
  bonusHours: 1,
  guests: 8,
  extras: [{ name: "Jet Ski", qty: 1, amount: 500 }],
  totalAmount: 5000,
  depositAmount: 2500,
  balanceAmount: 2500,
  currency: "AED",
  bookingId: "booking-123",
};

describe("formatDubai", () => {
  it("formats a date in Dubai local time", () => {
    const formatted = formatDubai(new Date("2026-10-05T10:00:00.000Z"));
    expect(formatted).toContain("Dubai time");
    expect(formatted).toContain("2026");
  });
});

describe("leadReceivedAdmin", () => {
  it("includes the lead's key fields in subject and body", () => {
    const { subject, html, text } = leadReceivedAdmin(lead);

    expect(subject).toContain("Jane Doe");
    expect(subject).toContain("Charter");

    for (const target of [html, text]) {
      expect(target).toContain("Jane Doe");
      expect(target).toContain("jane@example.com");
      expect(target).toContain("+971500000000");
      expect(target).toContain("Charter");
      expect(target).toContain("Looking for a half-day charter for 8 guests.");
    }
  });
});

describe("leadAutoReply", () => {
  it("addresses the lead by name and mentions the company", () => {
    const { subject, html, text } = leadAutoReply(lead);

    expect(subject).toContain(SITE_CONFIG.name);
    expect(html).toContain("Jane Doe");
    expect(html).toContain("Charter");
    expect(text).toContain("Jane Doe");
    expect(text).toContain(SITE_CONFIG.phone);
  });
});

describe("bookingDepositPaidCustomer", () => {
  it("includes booking details", () => {
    const { subject, html, text } = bookingDepositPaidCustomer(booking);

    expect(subject).toContain("Majesty 88");
    for (const target of [html, text]) {
      expect(target).toContain("Majesty 88");
      expect(target).toContain("booking-123");
      expect(target).toContain("AED 5,000");
      expect(target).toContain("AED 2,500");
      expect(target).toContain("Jet Ski");
    }
  });
});

describe("bookingDepositPaidAdmin", () => {
  it("includes customer and booking details", () => {
    const { subject, html, text } = bookingDepositPaidAdmin({
      ...booking,
      customer: { name: "Jane Doe", email: "jane@example.com", phone: "+971500000000" },
      source: "stripe_webhook",
    });

    expect(subject).toContain("Jane Doe");
    expect(subject).toContain("Majesty 88");
    for (const target of [html, text]) {
      expect(target).toContain("Jane Doe");
      expect(target).toContain("jane@example.com");
      expect(target).toContain("stripe_webhook");
      expect(target).toContain("Majesty 88");
    }
  });
});

describe("bookingBalanceReminder", () => {
  it("includes booking details and balance amount", () => {
    const { subject, html, text } = bookingBalanceReminder(booking);

    expect(subject).toContain("Majesty 88");
    for (const target of [html, text]) {
      expect(target).toContain("Majesty 88");
      expect(target).toContain("AED 2,500");
    }
  });
});
