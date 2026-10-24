import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { contactRow } from "@/lib/pms/__tests__/fixtures";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => {
    void task();
  },
}));

const recordLogin = vi.fn();
const syncContactWithPms = vi.fn();
vi.mock("@/lib/documents-access", () => ({
  accessContextFromRequest: () => ({ ip: "1.2.3.4", userAgent: null, country: "AE", referrer: null }),
  recordLogin: (...args: unknown[]) => recordLogin(...args),
  syncContactWithPms: (...args: unknown[]) => syncContactWithPms(...args),
}));

const notifyDocumentsLogin = vi.fn();
vi.mock("@/lib/notify", () => ({
  notifyDocumentsLogin: (...args: unknown[]) => notifyDocumentsLogin(...args),
}));

const ORIGINAL = { ...process.env };

function verifyRequest(token: string | null) {
  const url = new URL("https://imperialyachting.com/api/documents/verify");
  if (token !== null) url.searchParams.set("token", token);
  return new Request(url);
}

describe("GET /api/documents/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DOCUMENTS_SESSION_SECRET = "test-docs-secret";
    recordLogin.mockResolvedValue(contactRow({ login_count: 3 }));
    syncContactWithPms.mockResolvedValue(undefined);
    notifyDocumentsLogin.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("sends invalid or expired links back to the form without a session", async () => {
    const { GET } = await import("../verify/route");
    for (const token of [null, "garbage"]) {
      const res = await GET(verifyRequest(token));
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("https://imperialyachting.com/documents?access=expired#access");
      expect(res.headers.get("set-cookie")).toBeNull();
    }
    expect(recordLogin).not.toHaveBeenCalled();
  });

  it("does not accept a session token as a sign-in link", async () => {
    const { GET } = await import("../verify/route");
    const { createSessionToken } = await import("@/lib/documents-auth");
    const res = await GET(verifyRequest(createSessionToken("jane@acme.com")));
    expect(res.headers.get("location")).toContain("access=expired");
  });

  it("starts a session, logs the login, alerts the team and hands off to the PMS", async () => {
    const { GET } = await import("../verify/route");
    const { createAccessLinkToken, verifySessionToken, DOCUMENTS_COOKIE } = await import("@/lib/documents-auth");

    const res = await GET(verifyRequest(createAccessLinkToken("jane@acme.com")));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://imperialyachting.com/documents?access=granted#library");

    const cookie = res.cookies.get(DOCUMENTS_COOKIE)!;
    expect(cookie.httpOnly).toBe(true);
    expect(verifySessionToken(cookie.value)).toBe("jane@acme.com");

    expect(recordLogin).toHaveBeenCalledWith("jane@acme.com", expect.objectContaining({ country: "AE" }));
    expect(notifyDocumentsLogin).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@acme.com", company: "Acme Ltd", loginCount: 3 })
    );
    expect(syncContactWithPms).toHaveBeenCalledWith(expect.objectContaining({ email: "jane@acme.com" }));
  });

  it("still signs the visitor in when the database is unavailable", async () => {
    recordLogin.mockResolvedValue(null);
    const { GET } = await import("../verify/route");
    const { createAccessLinkToken, DOCUMENTS_COOKIE } = await import("@/lib/documents-auth");

    const res = await GET(verifyRequest(createAccessLinkToken("jane@acme.com")));
    expect(res.cookies.get(DOCUMENTS_COOKIE)).toBeDefined();
    expect(notifyDocumentsLogin).toHaveBeenCalledWith(expect.objectContaining({ email: "jane@acme.com", loginCount: 1 }));
    expect(syncContactWithPms).not.toHaveBeenCalled();
  });
});
