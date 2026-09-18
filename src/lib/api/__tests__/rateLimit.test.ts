import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, getClientIp, __resetRateLimitStateForTests } from "../rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimitStateForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const r1 = rateLimit("ip:1", { limit: 3, windowMs: 1000 });
    const r2 = rateLimit("ip:1", { limit: 3, windowMs: 1000 });
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks requests once the limit is reached", () => {
    rateLimit("ip:2", { limit: 2, windowMs: 1000 });
    rateLimit("ip:2", { limit: 2, windowMs: 1000 });
    const blocked = rateLimit("ip:2", { limit: 2, windowMs: 1000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window elapses (sliding window)", () => {
    rateLimit("ip:3", { limit: 1, windowMs: 1000 });
    const blocked = rateLimit("ip:3", { limit: 1, windowMs: 1000 });
    expect(blocked.ok).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:00:01.100Z"));
    const allowed = rateLimit("ip:3", { limit: 1, windowMs: 1000 });
    expect(allowed.ok).toBe(true);
  });

  it("tracks separate keys independently", () => {
    rateLimit("a", { limit: 1, windowMs: 1000 });
    const other = rateLimit("b", { limit: 1, windowMs: 1000 });
    expect(other.ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("reads the first entry of x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(request)).toBe("9.9.9.9");
  });

  it("falls back to unknown when no headers are present", () => {
    const request = new Request("https://example.com");
    expect(getClientIp(request)).toBe("unknown");
  });
});
