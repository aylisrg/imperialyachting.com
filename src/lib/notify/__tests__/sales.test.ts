import { describe, it, expect, vi, beforeEach } from "vitest";

const sendEmail = vi.fn();
const sendTelegram = vi.fn();
vi.mock("../email", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...a) }));
vi.mock("../telegram", () => ({
  sendTelegram: (...a: unknown[]) => sendTelegram(...a),
  escapeTelegramMarkdown: (s: string) => s.replace(/([_*[\]`])/g, "\\$1"),
}));

import { notifySaleDownload, salesNotifyEmail } from "../sales";
import { saleDownloadAdmin, saleMaterialsRequester, type SaleDownloadEvent } from "../templates";

const event: SaleDownloadEvent = {
  listingTitle: "VanDutch 40 “Van Dutch Connect”",
  listingUrl: "https://imperialyachting.com/yachts-for-sale/vandutch-40-van-dutch-connect",
  email: "broker@example.com",
  isBroker: true,
  company: "Blue <Water>",
  clientName: "Mr. K",
  materials: [{ title: "Spec", files: [{ name: "Spec.pdf", url: "https://x/spec?t=1&a=2" }] }],
  at: new Date("2026-09-25T10:00:00Z"),
  country: "DE",
};

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.SALES_NOTIFY_EMAIL;
  delete process.env.BOOKING_ADMIN_EMAIL;
});

describe("sale download templates", () => {
  it("tells the owner who downloaded what", () => {
    const t = saleDownloadAdmin(event);
    expect(t.subject).toBe("Broker downloaded VanDutch 40 “Van Dutch Connect”: broker@example.com");
    expect(t.html).toContain("Blue &lt;Water&gt;");
    expect(t.text).toContain("Client registered: Mr. K");
  });

  it("gives the requester the links and a timestamped client registration", () => {
    const t = saleMaterialsRequester(event);
    expect(t.html).toContain("Client registration confirmed");
    expect(t.html).toContain("https://x/spec?t=1&amp;a=2");
    expect(t.text).toContain("Spec.pdf: https://x/spec?t=1&a=2");
    expect(saleMaterialsRequester({ ...event, clientName: null }).html).not.toContain("registration");
  });
});

describe("notifySaleDownload", () => {
  it("emails the owner (reply-to requester), the requester, and Telegram", async () => {
    process.env.SALES_NOTIFY_EMAIL = "owner@example.com";
    await notifySaleDownload(event);

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@example.com", replyTo: "broker@example.com" }));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "broker@example.com" }));
    expect(sendTelegram).toHaveBeenCalledWith(expect.stringContaining("Broker downloaded materials"), { parseMode: "Markdown" });
  });

  it("falls back to the booking admin inbox", () => {
    process.env.BOOKING_ADMIN_EMAIL = "admin@example.com";
    expect(salesNotifyEmail()).toBe("admin@example.com");
  });

  it("never throws when a channel fails", async () => {
    sendEmail.mockRejectedValue(new Error("resend down"));
    await expect(notifySaleDownload(event)).resolves.toBeUndefined();
  });
});
