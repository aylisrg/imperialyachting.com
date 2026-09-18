import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { sendEmail, isEmailConfigured } from "../email";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function MockResend() {
    return { emails: { send: mockSend } };
  }),
}));

const originalApiKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.BOOKING_FROM_EMAIL;

describe("sendEmail / isEmailConfigured", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalFrom === undefined) delete process.env.BOOKING_FROM_EMAIL;
    else process.env.BOOKING_FROM_EMAIL = originalFrom;
  });

  it("is not configured, and sendEmail is skipped, when RESEND_API_KEY is unset", async () => {
    delete process.env.RESEND_API_KEY;

    expect(isEmailConfigured()).toBe(false);

    const result = await sendEmail({
      to: "someone@example.com",
      subject: "Subject",
      html: "<p>hi</p>",
    });

    expect(result).toEqual({ ok: false, skipped: true });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends via Resend with the default from address when configured", async () => {
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.BOOKING_FROM_EMAIL;
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    expect(isEmailConfigured()).toBe(true);

    const result = await sendEmail({
      to: "someone@example.com",
      subject: "Subject",
      html: "<p>hi</p>",
      text: "hi",
      replyTo: "lead@example.com",
    });

    expect(result).toEqual({ ok: true, id: "email-1" });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Imperial Yachting <booking@imperialyachting.com>",
        to: "someone@example.com",
        subject: "Subject",
        html: "<p>hi</p>",
        text: "hi",
        replyTo: "lead@example.com",
      })
    );
  });

  it("uses BOOKING_FROM_EMAIL when set", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.BOOKING_FROM_EMAIL = "Custom <custom@example.com>";
    mockSend.mockResolvedValue({ data: { id: "email-2" }, error: null });

    await sendEmail({ to: "a@example.com", subject: "S", html: "<p>x</p>" });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: "Custom <custom@example.com>" })
    );
  });

  it("returns ok:false when Resend responds with an error", async () => {
    process.env.RESEND_API_KEY = "test-key";
    mockSend.mockResolvedValue({ data: null, error: { message: "bad request" } });

    const result = await sendEmail({ to: "a@example.com", subject: "S", html: "<p>x</p>" });

    expect(result).toEqual({ ok: false });
  });

  it("returns ok:false (never throws) when Resend throws", async () => {
    process.env.RESEND_API_KEY = "test-key";
    mockSend.mockRejectedValue(new Error("network error"));

    await expect(
      sendEmail({ to: "a@example.com", subject: "S", html: "<p>x</p>" })
    ).resolves.toEqual({ ok: false });
  });
});
