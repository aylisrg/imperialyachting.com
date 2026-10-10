import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import {
  createAccessLinkToken,
  createSessionToken,
  isDocumentsAuthConfigured,
  normalizeEmail,
  verifyAccessLinkToken,
  verifySessionToken,
  DOCUMENTS_LINK_TTL,
  DOCUMENTS_SESSION_MAX_AGE,
} from "@/lib/documents-auth";

const ORIGINAL = { ...process.env };

beforeEach(() => {
  process.env.DOCUMENTS_SESSION_SECRET = "test-docs-secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("documents access tokens", () => {
  it("round-trips a sign-in link to its lowercased email", () => {
    const token = createAccessLinkToken("  Jane@Acme.COM ")!;
    expect(verifyAccessLinkToken(token)).toBe("jane@acme.com");
  });

  it("round-trips a session", () => {
    const token = createSessionToken("jane@acme.com")!;
    expect(verifySessionToken(token)).toBe("jane@acme.com");
  });

  it("never accepts a link token as a session, or the other way round", () => {
    expect(verifySessionToken(createAccessLinkToken("jane@acme.com"))).toBeNull();
    expect(verifyAccessLinkToken(createSessionToken("jane@acme.com"))).toBeNull();
  });

  it("expires links after 24h and sessions after 30 days", () => {
    const now = Date.now();
    const link = createAccessLinkToken("jane@acme.com", now)!;
    expect(verifyAccessLinkToken(link, now + (DOCUMENTS_LINK_TTL - 60) * 1000)).toBe("jane@acme.com");
    expect(verifyAccessLinkToken(link, now + (DOCUMENTS_LINK_TTL + 1) * 1000)).toBeNull();

    const session = createSessionToken("jane@acme.com", now)!;
    expect(verifySessionToken(session, now + (DOCUMENTS_SESSION_MAX_AGE + 1) * 1000)).toBeNull();
  });

  it("rejects tampered, foreign-key and garbage tokens", () => {
    const token = createSessionToken("jane@acme.com")!;
    const [, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ p: "session", m: "evil@x.com", x: 9999999999 })).toString("base64url");
    expect(verifySessionToken(`${forged}.${sig}`)).toBeNull();
    expect(verifySessionToken("nonsense")).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
    // The old shared-password cookie was a bare hex digest.
    expect(verifySessionToken("a".repeat(64))).toBeNull();

    process.env.DOCUMENTS_SESSION_SECRET = "rotated";
    expect(verifySessionToken(token)).toBeNull();
  });

  it("derives a key from the service-role key, and fails closed without any secret", () => {
    delete process.env.DOCUMENTS_SESSION_SECRET;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    expect(isDocumentsAuthConfigured()).toBe(true);
    expect(verifySessionToken(createSessionToken("a@b.co"))).toBe("a@b.co");

    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(isDocumentsAuthConfigured()).toBe(false);
    expect(createAccessLinkToken("a@b.co")).toBeNull();
    expect(verifySessionToken("x.y")).toBeNull();
  });

  it("normalizes emails", () => {
    expect(normalizeEmail(" A@B.Co ")).toBe("a@b.co");
  });
});
