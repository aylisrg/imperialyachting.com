import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

const mockUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabase: vi.fn(() => ({
    from: mockFrom,
  })),
}));

function setupAdminChain(existing: { notes: string } | null, updated: Record<string, unknown> | null) {
  // First call: .from("bookings").select("notes").eq("id", id).single()
  // Second call: .from("bookings").update(...).eq("id", id).select().single()
  let callCount = 0;
  mockFrom.mockImplementation(() => {
    callCount += 1;
    if (callCount === 1) {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: existing, error: existing ? null : { message: "not found" } }),
          }),
        }),
      };
    }
    return {
      update: mockUpdate.mockReturnValue({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: updated, error: updated ? null : { message: "update failed" } }),
          }),
        }),
      }),
    };
  });
}

function makeRequest(body: unknown) {
  return new Request("https://example.com/api/admin/bookings/booking-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: "booking-1" });

describe("PATCH /api/admin/bookings/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no logged-in user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { PATCH } = await import("../[id]/route");
    const response = await PATCH(makeRequest({ action: "cancel" }), { params });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("unauthorized");
  });

  it("returns 400 on an invalid body", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const { PATCH } = await import("../[id]/route");
    const response = await PATCH(makeRequest({ action: "not_a_real_action" }), { params });

    expect(response.status).toBe(400);
  });

  it("maps 'cancel' to status 'cancelled'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    setupAdminChain({ notes: "" }, { id: "booking-1", status: "cancelled" });

    const { PATCH } = await import("../[id]/route");
    const response = await PATCH(makeRequest({ action: "cancel" }), { params });

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
  });

  it("maps 'mark_paid' to status 'paid' and appends a timestamped note", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    setupAdminChain({ notes: "existing note" }, { id: "booking-1", status: "paid" });

    const { PATCH } = await import("../[id]/route");
    const response = await PATCH(
      makeRequest({ action: "mark_paid", notes: "balance received via bank transfer" }),
      { params }
    );

    expect(response.status).toBe(200);
    const call = mockUpdate.mock.calls[0][0];
    expect(call.status).toBe("paid");
    expect(call.notes).toContain("existing note");
    expect(call.notes).toContain("mark_paid: balance received via bank transfer");
  });

  it("maps 'confirm_offline' to status 'deposit_paid'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    setupAdminChain({ notes: "" }, { id: "booking-1", status: "deposit_paid" });

    const { PATCH } = await import("../[id]/route");
    const response = await PATCH(makeRequest({ action: "confirm_offline" }), { params });

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "deposit_paid" })
    );
  });

  it("returns 404 when the booking does not exist", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    setupAdminChain(null, null);

    const { PATCH } = await import("../[id]/route");
    const response = await PATCH(makeRequest({ action: "cancel" }), { params });

    expect(response.status).toBe(404);
  });
});
