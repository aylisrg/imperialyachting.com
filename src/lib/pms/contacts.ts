import { SITE_CONFIG } from "@/lib/constants";
import type { DocumentContactRow } from "@/lib/supabase/types";

/**
 * Hand-off of confirmed website contacts to the company PMS.
 *
 * Which PMS, and how it takes contacts in, is still being decided — see
 * docs/tasks/DOCS_EMAIL_TO_PMS_RU.md. Until then this is a generic webhook:
 * set PMS_CONTACTS_WEBHOOK_URL (a PMS inbound webhook, or a Zapier / Make /
 * n8n scenario) and every confirmed contact is POSTed there. Without it,
 * contacts stay `pending` in document_contacts, ready to be backfilled.
 */

export const PMS_CONTACT_SOURCE = `${new URL(SITE_CONFIG.url).host}/documents`;

const REQUEST_TIMEOUT_MS = 8_000;

export interface PmsContact {
  email: string;
  name: string | null;
  company: string | null;
  /** ISO-3166 alpha-2 from the visitor's IP (Vercel geo), not a postal address. */
  country: string | null;
  firstSeenAt: string;
  verifiedAt: string | null;
  lastLoginAt: string | null;
  loginCount: number;
  downloadCount: number;
}

export interface PmsContactPayload {
  event: "docs_contact.verified";
  occurredAt: string;
  source: string;
  contact: PmsContact;
}

export type PmsSyncResult =
  | { status: "synced"; externalId?: string }
  | { status: "pending" }
  | { status: "failed"; error: string };

export function isPmsConfigured(): boolean {
  return Boolean(process.env.PMS_CONTACTS_WEBHOOK_URL?.trim());
}

export function buildPmsContactPayload(
  contact: DocumentContactRow,
  now: Date = new Date()
): PmsContactPayload {
  return {
    event: "docs_contact.verified",
    occurredAt: now.toISOString(),
    source: PMS_CONTACT_SOURCE,
    contact: {
      email: contact.email,
      name: contact.name,
      company: contact.company,
      country: contact.last_country,
      firstSeenAt: contact.first_seen_at,
      verifiedAt: contact.verified_at,
      lastLoginAt: contact.last_login_at,
      loginCount: contact.login_count,
      downloadCount: contact.download_count,
    },
  };
}

function externalIdFrom(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const { id, externalId } = body as { id?: unknown; externalId?: unknown };
  const value = externalId ?? id;
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

/**
 * Sends one contact to the PMS. Never throws: resolves to `pending` when no
 * PMS is configured, and to `failed` (with a log-safe reason) on any error.
 */
export async function syncContactToPms(contact: DocumentContactRow): Promise<PmsSyncResult> {
  const url = process.env.PMS_CONTACTS_WEBHOOK_URL?.trim();
  if (!url) return { status: "pending" };

  const token = process.env.PMS_CONTACTS_WEBHOOK_TOKEN?.trim();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Lets a PMS that supports it drop retried deliveries.
        "Idempotency-Key": contact.id,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(buildPmsContactPayload(contact)),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { status: "failed", error: `HTTP ${response.status}` };
    }

    const body = await response.json().catch(() => null);
    return { status: "synced", externalId: externalIdFrom(body) };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    return { status: "failed", error: `request failed: ${reason}` };
  }
}
