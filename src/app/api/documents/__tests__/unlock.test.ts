import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";
import { DOCUMENTS_COOKIE, verifySessionToken } from "@/lib/documents-auth";
import { PASSWORD_SESSION_LABEL } from "@/lib/documents-session";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const ORIGINAL = { ...process.env };

function makeRequest(body: unknown, ip = "5.6.7.8") {
  return new Request("https://imperialyachting.com/api/documents/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function sessionCookie(res: Response): string | null {
  const header = res.headers.get("set-cookie") ?? "";
  const match = header.match(new RegExp(`${DOCUMENTS_COOKIE}=([^;]*)`));
  return match ? match[1] : null;
}

describe("POST /api/documents/unlock", () => {
  beforeEach(() => {
    __resetRateLimitStateForTests();
    process.env.DOCUMENTS_SESSION_SECRET = "test-docs-secret";
    process.env.DOCUMENTS_PASSWORD = "test-shared-password";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("starts a password session for the right password", async () => {
    const { POST } = await import("../unlock/route");
    const res = await POST(makeRequest({ password: "test-shared-password" }));
    expect(res.status).toBe(200);
    expect(verifySessionToken(sessionCookie(res))).toBe(PASSWORD_SESSION_LABEL);
  });

  it("refuses a wrong or empty password without a cookie", async () => {
    const { POST } = await import("../unlock/route");
    for (const password of ["nope", "", 123, null]) {
      const res = await POST(makeRequest({ password }));
      expect(res.status).toBe(401);
      expect(sessionCookie(res)).toBeNull();
    }
  });

  it("is off when DOCUMENTS_PASSWORD is not set", async () => {
    delete process.env.DOCUMENTS_PASSWORD;
    const { POST } = await import("../unlock/route");
    const res = await POST(makeRequest({ password: "anything" }));
    expect(res.status).toBe(503);
    expect(sessionCookie(res)).toBeNull();
  });

  it("rejects a malformed body", async () => {
    const { POST } = await import("../unlock/route");
    expect((await POST(makeRequest("{not json"))).status).toBe(400);
  });

  it("limits guessing from one address", async () => {
    const { POST } = await import("../unlock/route");
    let last = 0;
    for (let i = 0; i < 11; i++) {
      last = (await POST(makeRequest({ password: "nope" }, "9.9.9.9"))).status;
    }
    expect(last).toBe(429);
  });
});
