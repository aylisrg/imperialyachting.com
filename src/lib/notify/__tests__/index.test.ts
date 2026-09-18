import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendEmail = vi.fn();
const mockSendTelegram = vi.fn();

vi.mock("../email", () => ({
  sendEmail: mockSendEmail,
}));

vi.mock("../telegram", () => ({
  sendTelegram: mockSendTelegram,
  escapeTelegramMarkdown: (s: string) => s,
}));

describe("notifyLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ ok: true, id: "email-1" });
    mockSendTelegram.mockResolvedValue(true);
  });

  it("sends admin email, auto-reply, and telegram summary", async () => {
    const { notifyLead } = await import("../index");

    await notifyLead({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+971500000000",
      inquiry_type: "Charter",
      preferred_date: null,
      message: "Looking for a charter.",
    });

    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockSendTelegram).toHaveBeenCalledTimes(1);

    const [adminCall, autoReplyCall] = mockSendEmail.mock.calls.map((c) => c[0]);
    expect(adminCall.to).toBe("booking@imperialyachting.com");
    expect(adminCall.replyTo).toBe("jane@example.com");
    expect(autoReplyCall.to).toBe("jane@example.com");
  });

  it("never throws even if all channels fail", async () => {
    mockSendEmail.mockRejectedValue(new Error("email failed"));
    mockSendTelegram.mockRejectedValue(new Error("telegram failed"));

    const { notifyLead } = await import("../index");

    await expect(
      notifyLead({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: null,
        inquiry_type: "General",
        preferred_date: null,
        message: "Hello there.",
      })
    ).resolves.toBeUndefined();
  });
});
