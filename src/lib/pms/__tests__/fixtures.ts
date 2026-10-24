import type { DocumentContactRow } from "@/lib/supabase/types";

export function contactRow(overrides: Partial<DocumentContactRow> = {}): DocumentContactRow {
  return {
    id: "c-1",
    email: "jane@acme.com",
    name: "Jane Doe",
    company: "Acme Ltd",
    source: "docs_portal",
    first_seen_at: "2026-10-01T10:00:00.000Z",
    verified_at: "2026-10-01T10:05:00.000Z",
    last_login_at: "2026-10-01T10:05:00.000Z",
    login_count: 1,
    download_count: 0,
    last_country: "AE",
    last_ip: "1.2.3.4",
    last_user_agent: "test",
    first_referrer: null,
    pms_sync_status: "pending",
    pms_synced_at: null,
    pms_external_id: null,
    pms_last_error: null,
    pms_attempts: 0,
    created_at: "2026-10-01T10:00:00.000Z",
    updated_at: "2026-10-01T10:05:00.000Z",
    ...overrides,
  };
}
