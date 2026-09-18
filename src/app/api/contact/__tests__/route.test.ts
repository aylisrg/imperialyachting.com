import { describe, it, expect, vi, beforeEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";

const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

const mockIsAdminSupabaseConfigured = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: vi.fn(() => ({ from: mockFrom })),
  isAdminSupabaseConfigured: () => mockIsAdminSupabaseConfigured(),
}));

const mockNotifyLead = vi.fn();
vi.mock("@/lib/notify", () => ({
  notifyLead: (...args: unknown[]) => mockNotifyLead(...args),
}));

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+971500000000",
  inquiryType: "Charter",
  preferredDate: "2026-10-01",
  message: "Looking for a half-day charter for 8 guests.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStateForTests();
    mockIsAdminSupabaseConfigured.mockReturnValue(true);
    mockSingle.mockResolvedValue({ data: { id: "lead-1" }, error: null });
    mockNotifyLead.mockResolvedValue(undefined);
  });

  it("returns 400 on an invalid body", async () => {
    const { POST } = await import("../route");
    const response = await POST(makeRequest({ ...validBody, email: "not-an-email" }));

    expect(response.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockNotifyLead).not.toHaveBeenCalled();
  });

  it("returns 200 silently and stores nothing when the honeypot is filled", async () => {
    const { POST } = await import("../route");
    const response = await POST(makeRequest({ ...validBody, website: "http://spam.example" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true });
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockNotifyLead).not.toHaveBeenCalled();
  });

  it("inserts the lead and notifies on a valid submission", async () => {
    const { POST } = await import("../route");
    const response = await POST(makeRequest(validBody, "9.9.9.9"));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true, id: "lead-1" });

    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        email: "jane@example.com",
        inquiry_type: "Charter",
        message: validBody.message,
        source: "contact_form",
      })
    );

    expect(mockNotifyLead).toHaveBeenCalledTimes(1);
  });

  it("still notifies (without an id) when the admin client is not configured", async () => {
    mockIsAdminSupabaseConfigured.mockReturnValue(false);

    const { POST } = await import("../route");
    const response = await POST(makeRequest(validBody, "8.8.8.8"));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true, id: undefined });
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockNotifyLead).toHaveBeenCalledTimes(1);
  });

  it("rate limits after 5 requests per IP within the window", async () => {
    const { POST } = await import("../route");
    const ip = "5.5.5.5";

    for (let i = 0; i < 5; i++) {
      const response = await POST(makeRequest(validBody, ip));
      expect(response.status).toBe(200);
    }

    const blocked = await POST(makeRequest(validBody, ip));
    expect(blocked.status).toBe(429);
  });
});
