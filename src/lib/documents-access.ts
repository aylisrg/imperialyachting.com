import { getClientIp } from "@/lib/api/rateLimit";
import { createAdminSupabase, isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import type { DocumentContactRow } from "@/lib/supabase/types";
import { syncContactToPms } from "@/lib/pms/contacts";

/**
 * Who asked for, opened and downloaded the company documents. Every write
 * goes through the service-role client and is best-effort: logging must never
 * block a visitor from signing in or downloading, so nothing here throws.
 */

export interface AccessContext {
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  referrer: string | null;
}

function clip(value: string | null, max = 500): string | null {
  return value ? value.slice(0, max) : null;
}

export function accessContextFromRequest(request: Request): AccessContext {
  const ip = getClientIp(request);
  return {
    ip: ip === "unknown" ? null : ip,
    userAgent: clip(request.headers.get("user-agent")),
    country: request.headers.get("x-vercel-ip-country"),
    referrer: clip(request.headers.get("referer")),
  };
}

async function findContact(email: string): Promise<DocumentContactRow | null> {
  const { data, error } = await createAdminSupabase()
    .from("document_contacts")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DocumentContactRow | null) ?? null;
}

async function insertContact(
  values: { email: string } & Partial<DocumentContactRow>
): Promise<DocumentContactRow> {
  const { data, error } = await createAdminSupabase()
    .from("document_contacts")
    .insert(values)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DocumentContactRow;
}

async function updateContact(
  id: string,
  values: Partial<DocumentContactRow>
): Promise<DocumentContactRow> {
  const { data, error } = await createAdminSupabase()
    .from("document_contacts")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DocumentContactRow;
}

async function logEvent(
  contactId: string | null,
  email: string,
  event: "link_requested" | "login" | "download",
  ctx: AccessContext,
  documentSlug: string | null = null
): Promise<void> {
  const { error } = await createAdminSupabase()
    .from("document_access_events")
    .insert({
      contact_id: contactId,
      email,
      event,
      document_slug: documentSlug,
      ip: ctx.ip,
      user_agent: ctx.userAgent,
      country: ctx.country,
      referrer: ctx.referrer,
    });
  if (error) throw new Error(error.message);
}

/** Saves the email (plus optional name/company) when a sign-in link is requested. */
export async function recordLinkRequest(
  input: { email: string; name?: string | null; company?: string | null },
  ctx: AccessContext
): Promise<void> {
  if (!isAdminSupabaseConfigured()) return;
  try {
    const existing = await findContact(input.email);
    // Only overwrite what the visitor actually typed this time.
    const details = {
      ...(input.name ? { name: input.name } : {}),
      ...(input.company ? { company: input.company } : {}),
    };
    const contact = existing
      ? Object.keys(details).length > 0
        ? await updateContact(existing.id, details)
        : existing
      : await insertContact({
          email: input.email,
          ...details,
          last_country: ctx.country,
          last_ip: ctx.ip,
          last_user_agent: ctx.userAgent,
          first_referrer: ctx.referrer,
        });
    await logEvent(contact.id, input.email, "link_requested", ctx);
  } catch (err) {
    console.error("[documents] failed to record link request:", err);
  }
}

/**
 * Marks the email as confirmed after a sign-in link was followed and returns
 * the up-to-date contact, or null when the database is unavailable.
 */
export async function recordLogin(
  email: string,
  ctx: AccessContext,
  now: Date = new Date()
): Promise<DocumentContactRow | null> {
  if (!isAdminSupabaseConfigured()) return null;
  try {
    const at = now.toISOString();
    const activity = {
      last_login_at: at,
      last_country: ctx.country,
      last_ip: ctx.ip,
      last_user_agent: ctx.userAgent,
    };
    const existing = await findContact(email);
    const contact = existing
      ? await updateContact(existing.id, {
          ...activity,
          verified_at: existing.verified_at ?? at,
          login_count: existing.login_count + 1,
        })
      : await insertContact({ email, ...activity, verified_at: at, login_count: 1 });
    await logEvent(contact.id, email, "login", ctx);
    return contact;
  } catch (err) {
    console.error("[documents] failed to record login:", err);
    return null;
  }
}

/** Logs a document download against the signed-in email. */
export async function recordDownload(
  email: string,
  documentSlug: string,
  ctx: AccessContext
): Promise<void> {
  if (!isAdminSupabaseConfigured()) return;
  try {
    const existing = await findContact(email);
    const contact = existing
      ? await updateContact(existing.id, { download_count: existing.download_count + 1 })
      : null;
    await logEvent(contact?.id ?? null, email, "download", ctx, documentSlug);
  } catch (err) {
    console.error("[documents] failed to record download:", err);
  }
}

/**
 * Pushes a confirmed contact to the PMS once and records the outcome on the
 * row (the outbox). Already-synced or skipped contacts are left alone; with no
 * PMS configured the row simply stays `pending`.
 */
export async function syncContactWithPms(contact: DocumentContactRow): Promise<void> {
  if (contact.pms_sync_status === "synced" || contact.pms_sync_status === "skipped") return;
  if (!contact.verified_at) return;

  const result = await syncContactToPms(contact);
  if (result.status === "pending") return;

  try {
    await updateContact(
      contact.id,
      result.status === "synced"
        ? {
            pms_sync_status: "synced",
            pms_synced_at: new Date().toISOString(),
            pms_external_id: result.externalId ?? contact.pms_external_id,
            pms_last_error: null,
            pms_attempts: contact.pms_attempts + 1,
          }
        : {
            pms_sync_status: "failed",
            pms_last_error: result.error.slice(0, 500),
            pms_attempts: contact.pms_attempts + 1,
          }
    );
  } catch (err) {
    console.error("[documents] failed to record PMS sync result:", err);
  }
}
