import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const recordLinkRequest = vi.fn();
vi.mock("@/lib/documents-access", () => ({
  accessContextFromRequest: () => ({ ip: "1.2.3.4", userAgent: null, country: "DE", referrer: null }),
  recordLinkRequest: (...args: unknown[]) => recordLinkRequest(...args),
}));

const sendEmail = vi.fn();
const isEmailConfigured = vi.fn();
vi.mock("@/lib/notify", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/notify")>()),
  sendEmail: (...args: unknown[]) => sendEmail(...args),
  isEmailConfigured: () => isEmailConfigured(),
}));

const ORIGINAL = { ...process.env };

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("https://imperialyachting.com/api/documents/request-link", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/documents/request-link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStateForTests();
    process.env.DOCUMENTS_SESSION_SECRET = "test-docs-secret";
    isEmailConfigured.mockReturnValue(true);
    sendEmail.mockResolvedValue({ ok: true, id: "em_1" });
    recordLinkRequest.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("rejects a missing or invalid email", async () => {
    const { POST } = await import("../request-link/route");
    expect((await POST(makeRequest({ email: "" }))).status).toBe(400);
    expect((await POST(makeRequest({ email: "nope" }))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("stores the contact and emails a working sign-in link", async () => {
    const { POST } = await import("../request-link/route");
    const { verifyAccessLinkToken } = await import("@/lib/documents-auth");

    const res = await POST(makeRequest({ email: " Jane@Acme.com ", name: "Jane", company: "Acme" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(recordLinkRequest).toHaveBeenCalledWith(
      { email: "jane@acme.com", name: "Jane", company: "Acme" },
      expect.objectContaining({ country: "DE" })
    );

    const mail = sendEmail.mock.calls[0][0];
    expect(mail.to).toBe("jane@acme.com");
    const link = mail.text.match(/https:\/\/\S+/)![0];
    const url = new URL(link);
    expect(url.pathname).toBe("/api/documents/verify");
    expect(verifyAccessLinkToken(url.searchParams.get("token"))).toBe("jane@acme.com");
  });

  it("uses the canonical domain for links in production", async () => {
    process.env.VERCEL_ENV = "production";
    const { POST } = await import("../request-link/route");
    const req = new Request("https://evil.example/api/documents/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jane@acme.com" }),
    });
    await POST(req);
    expect(sendEmail.mock.calls[0][0].text).toContain("https://imperialyachting.com/api/documents/verify?token=");
  });

  it("silently accepts honeypot submissions", async () => {
    const { POST } = await import("../request-link/route");
    const res = await POST(makeRequest({ email: "bot@spam.com", website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(recordLinkRequest).not.toHaveBeenCalled();
  });

  it("limits repeated links to the same address", async () => {
    const { POST } = await import("../request-link/route");
    for (let i = 0; i < 3; i++) {
      expect((await POST(makeRequest({ email: "jane@acme.com" }, `10.0.0.${i}`))).status).toBe(200);
    }
    expect((await POST(makeRequest({ email: "JANE@acme.com" }, "10.0.0.9"))).status).toBe(429);
  });

  it("reports when the email cannot be sent", async () => {
    const { POST } = await import("../request-link/route");
    sendEmail.mockResolvedValue({ ok: false });
    expect((await POST(makeRequest({ email: "jane@acme.com" }))).status).toBe(502);
  });

  it("fails closed without a signing secret", async () => {
    delete process.env.DOCUMENTS_SESSION_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { POST } = await import("../request-link/route");
    expect((await POST(makeRequest({ email: "jane@acme.com" }))).status).toBe(503);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
