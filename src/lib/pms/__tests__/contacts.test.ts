import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildPmsContactPayload,
  isPmsConfigured,
  syncContactToPms,
} from "@/lib/pms/contacts";
import { contactRow } from "./fixtures";

const ORIGINAL = { ...process.env };

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.unstubAllGlobals();
});

describe("PMS contact hand-off", () => {
  it("builds the agreed payload contract", () => {
    const payload = buildPmsContactPayload(contactRow(), new Date("2026-10-02T00:00:00.000Z"));
    expect(payload).toEqual({
      event: "docs_contact.verified",
      occurredAt: "2026-10-02T00:00:00.000Z",
      source: "imperialyachting.com/documents",
      contact: {
        email: "jane@acme.com",
        name: "Jane Doe",
        company: "Acme Ltd",
        country: "AE",
        firstSeenAt: "2026-10-01T10:00:00.000Z",
        verifiedAt: "2026-10-01T10:05:00.000Z",
        lastLoginAt: "2026-10-01T10:05:00.000Z",
        loginCount: 1,
        downloadCount: 0,
      },
    });
  });

  it("leaves contacts pending when no PMS is configured", async () => {
    delete process.env.PMS_CONTACTS_WEBHOOK_URL;
    expect(isPmsConfigured()).toBe(false);
    expect(await syncContactToPms(contactRow())).toEqual({ status: "pending" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs to the webhook with the bearer token and keeps the PMS id", async () => {
    process.env.PMS_CONTACTS_WEBHOOK_URL = "https://pms.example.com/hooks/contacts";
    process.env.PMS_CONTACTS_WEBHOOK_TOKEN = "pms-token";
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 42 }), { status: 200 }));

    expect(await syncContactToPms(contactRow())).toEqual({ status: "synced", externalId: "42" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://pms.example.com/hooks/contacts");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer pms-token",
      "Idempotency-Key": "c-1",
    });
    expect(JSON.parse(init.body).contact.email).toBe("jane@acme.com");
  });

  it("reports HTTP and network failures without leaking secrets", async () => {
    process.env.PMS_CONTACTS_WEBHOOK_URL = "https://pms.example.com/hooks/contacts";
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    expect(await syncContactToPms(contactRow())).toEqual({ status: "failed", error: "HTTP 500" });

    fetchMock.mockRejectedValueOnce(Object.assign(new Error("boom"), { name: "TimeoutError" }));
    expect(await syncContactToPms(contactRow())).toEqual({
      status: "failed",
      error: "request failed: TimeoutError",
    });
  });
});
