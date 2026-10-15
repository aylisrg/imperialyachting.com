import { describe, it, expect, vi, beforeEach } from "vitest";
import { contactRow } from "@/lib/pms/__tests__/fixtures";
import type { DocumentContactRow } from "@/lib/supabase/types";

/** Minimal in-memory stand-in for the two Supabase tables. */
const db = {
  contacts: [] as DocumentContactRow[],
  events: [] as Array<Record<string, unknown>>,
};

function contactsTable() {
  return {
    select: () => ({
      eq: (_col: string, email: string) => ({
        maybeSingle: async () => {
          const row = db.contacts.find((c) => c.email === email);
          return { data: row ? { ...row } : null, error: null };
        },
      }),
    }),
    insert: (values: Partial<DocumentContactRow>) => ({
      select: () => ({
        single: async () => {
          const row = contactRow({
            id: `c-${db.contacts.length + 1}`,
            name: null,
            company: null,
            verified_at: null,
            last_login_at: null,
            login_count: 0,
            ...values,
          });
          db.contacts.push(row);
          return { data: { ...row }, error: null };
        },
      }),
    }),
    update: (values: Partial<DocumentContactRow>) => ({
      eq: (_col: string, id: string) => ({
        select: () => ({
          single: async () => {
            const row = db.contacts.find((c) => c.id === id)!;
            Object.assign(row, values);
            return { data: { ...row }, error: null };
          },
        }),
      }),
    }),
  };
}

vi.mock("@/lib/supabase/admin", () => ({
  isAdminSupabaseConfigured: () => true,
  createAdminSupabase: () => ({
    from: (table: string) =>
      table === "document_contacts"
        ? contactsTable()
        : {
            insert: async (row: Record<string, unknown>) => {
              db.events.push(row);
              return { error: null };
            },
          },
  }),
}));

const syncContactToPms = vi.fn();
vi.mock("@/lib/pms/contacts", () => ({
  syncContactToPms: (...args: unknown[]) => syncContactToPms(...args),
}));

import {
  recordDownload,
  recordLinkRequest,
  recordLogin,
  syncContactWithPms,
} from "@/lib/documents-access";

const ctx = { ip: "1.2.3.4", userAgent: "ua", country: "AE", referrer: null };

beforeEach(() => {
  db.contacts = [];
  db.events = [];
  vi.clearAllMocks();
});

describe("documents access log", () => {
  it("creates a contact on the first link request and keeps details on later ones", async () => {
    await recordLinkRequest({ email: "jane@acme.com", name: "Jane", company: "Acme" }, ctx);
    await recordLinkRequest({ email: "jane@acme.com", name: null, company: null }, ctx);

    expect(db.contacts).toHaveLength(1);
    expect(db.contacts[0]).toMatchObject({ name: "Jane", company: "Acme", verified_at: null });
    expect(db.events.map((e) => e.event)).toEqual(["link_requested", "link_requested"]);
  });

  it("confirms the email on first login and counts later ones", async () => {
    await recordLinkRequest({ email: "jane@acme.com" }, ctx);
    const first = await recordLogin("jane@acme.com", ctx, new Date("2026-10-01T10:00:00Z"));
    const second = await recordLogin("jane@acme.com", ctx, new Date("2026-10-05T10:00:00Z"));

    expect(first?.login_count).toBe(1);
    expect(second).toMatchObject({
      login_count: 2,
      verified_at: "2026-10-01T10:00:00.000Z",
      last_login_at: "2026-10-05T10:00:00.000Z",
    });
  });

  it("counts downloads against the contact", async () => {
    await recordLogin("jane@acme.com", ctx);
    await recordDownload("jane@acme.com", "trade-license", ctx);
    expect(db.contacts[0].download_count).toBe(1);
    expect(db.events.at(-1)).toMatchObject({ event: "download", document_slug: "trade-license" });
  });

  it("records the PMS outcome on the contact", async () => {
    const contact = (await recordLogin("jane@acme.com", ctx))!;

    syncContactToPms.mockResolvedValueOnce({ status: "failed", error: "HTTP 500" });
    await syncContactWithPms(contact);
    expect(db.contacts[0]).toMatchObject({ pms_sync_status: "failed", pms_last_error: "HTTP 500", pms_attempts: 1 });

    syncContactToPms.mockResolvedValueOnce({ status: "synced", externalId: "pms-7" });
    await syncContactWithPms({ ...db.contacts[0] });
    expect(db.contacts[0]).toMatchObject({
      pms_sync_status: "synced",
      pms_external_id: "pms-7",
      pms_last_error: null,
      pms_attempts: 2,
    });

    // Already synced: never sent twice.
    await syncContactWithPms({ ...db.contacts[0] });
    expect(syncContactToPms).toHaveBeenCalledTimes(2);
  });

  it("leaves the row pending when no PMS is configured, and skips unconfirmed contacts", async () => {
    syncContactToPms.mockResolvedValue({ status: "pending" });
    const contact = (await recordLogin("jane@acme.com", ctx))!;
    await syncContactWithPms(contact);
    expect(db.contacts[0]).toMatchObject({ pms_sync_status: "pending", pms_attempts: 0 });

    await syncContactWithPms(contactRow({ verified_at: null }));
    expect(syncContactToPms).toHaveBeenCalledTimes(1);
  });
});
