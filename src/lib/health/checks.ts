import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase, isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import { isCalendarConfigured, getBusyIntervals } from "@/lib/google/calendar";

export const DB_EMPTY_WARNING =
  "Yacht table is empty — fleet pages will show no content. Run supabase/seed.sql or add yachts via /admin.";

const DEEP_TIMEOUT_MS = 5_000;

export interface CheckResult {
  ok: boolean;
  configured: boolean;
  detail?: string;
  ms?: number;
}

export type HealthStatus = "healthy" | "warning" | "error";

export interface HealthReport {
  status: HealthStatus;
  checks: Record<string, CheckResult>;
  timestamp: string;
  /**
   * Extra data kept outside `checks` so the /api/health route can stay
   * backward compatible (top-level `yachts`/`destinations` fields) without
   * re-querying the database itself.
   */
  meta?: {
    yachts?: number;
    destinations?: number;
  };
}

export interface RunHealthChecksOptions {
  deep: boolean;
  /** Origin (e.g. `https://imperialyachting.com`) used for the deep MCP self-check. */
  origin?: string;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    }),
  ]);
}

interface DatabaseCheckResult extends CheckResult {
  yachts?: number;
  destinations?: number;
}

/** Existing yacht/destination count check, unchanged in behaviour. */
async function checkDatabase(): Promise<DatabaseCheckResult> {
  const start = Date.now();
  try {
    const supabase = await createServerSupabase();

    const [yachtsResult, destinationsResult] = await Promise.all([
      supabase.from("yachts").select("*", { count: "exact", head: true }),
      supabase.from("destinations").select("*", { count: "exact", head: true }),
    ]);

    const ms = Date.now() - start;

    if (yachtsResult.error || destinationsResult.error) {
      const detail = yachtsResult.error?.message ?? destinationsResult.error?.message;
      return { ok: false, configured: true, detail, ms };
    }

    const yachtCount = yachtsResult.count ?? 0;
    const destinationCount = destinationsResult.count ?? 0;

    return {
      ok: true,
      configured: true,
      ms,
      yachts: yachtCount,
      destinations: destinationCount,
      ...(yachtCount === 0 && { detail: DB_EMPTY_WARNING }),
    };
  } catch (err) {
    return { ok: false, configured: true, detail: errorMessage(err), ms: Date.now() - start };
  }
}

async function checkAdminClient(deep: boolean): Promise<CheckResult> {
  const configured = isAdminSupabaseConfigured();
  if (!configured) {
    return {
      ok: false,
      configured: false,
      detail: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    };
  }
  if (!deep) return { ok: true, configured: true };

  const start = Date.now();
  try {
    const admin = createAdminSupabase();
    const { error } = await withTimeout(
      admin.from("bookings").select("id").limit(1),
      DEEP_TIMEOUT_MS
    );
    const ms = Date.now() - start;
    if (error) return { ok: false, configured: true, detail: error.message, ms };
    return { ok: true, configured: true, ms };
  } catch (err) {
    return { ok: false, configured: true, detail: errorMessage(err), ms: Date.now() - start };
  }
}

async function checkStripe(deep: boolean): Promise<CheckResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  const configured = Boolean(key);
  if (!configured) {
    return { ok: false, configured: false, detail: "Missing STRIPE_SECRET_KEY" };
  }
  if (!deep) return { ok: true, configured: true };

  const start = Date.now();
  try {
    const stripe = new Stripe(key as string);
    await withTimeout(stripe.balance.retrieve(), DEEP_TIMEOUT_MS);
    return { ok: true, configured: true, ms: Date.now() - start };
  } catch (err) {
    return { ok: false, configured: true, detail: errorMessage(err), ms: Date.now() - start };
  }
}

async function checkGoogleCalendar(deep: boolean): Promise<CheckResult> {
  const configured = isCalendarConfigured();
  if (!configured) {
    return {
      ok: false,
      configured: false,
      detail: "Missing GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY / GOOGLE_SERVICE_ACCOUNT_KEY",
    };
  }
  if (!deep) return { ok: true, configured: true };

  const start = Date.now();
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("yachts")
      .select("calendar_id")
      .not("calendar_id", "is", null)
      .limit(1);

    if (error) {
      return { ok: false, configured: true, detail: error.message, ms: Date.now() - start };
    }

    const calendarId = data?.[0]?.calendar_id as string | null | undefined;
    if (!calendarId) {
      return {
        ok: true,
        configured: true,
        detail: "No yacht has a calendar_id configured; skipped freebusy check",
        ms: Date.now() - start,
      };
    }

    const timeMin = new Date();
    const timeMax = new Date(timeMin.getTime() + 24 * 60 * 60 * 1000);
    const result = await withTimeout(
      getBusyIntervals(calendarId, timeMin, timeMax),
      DEEP_TIMEOUT_MS
    );
    const ms = Date.now() - start;

    if (result.source !== "google") {
      return { ok: false, configured: true, detail: "Calendar freebusy query unavailable", ms };
    }
    return { ok: true, configured: true, ms };
  } catch (err) {
    return { ok: false, configured: true, detail: errorMessage(err), ms: Date.now() - start };
  }
}

function checkEmail(): CheckResult {
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_FROM_EMAIL);
  return configured
    ? { ok: true, configured: true }
    : { ok: false, configured: false, detail: "Missing RESEND_API_KEY or BOOKING_FROM_EMAIL" };
}

function checkTelegram(): CheckResult {
  const configured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return configured
    ? { ok: true, configured: true }
    : { ok: false, configured: false, detail: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID" };
}

function checkIndexNow(): CheckResult {
  const configured = Boolean(process.env.INDEXNOW_KEY);
  return configured
    ? { ok: true, configured: true }
    : { ok: false, configured: false, detail: "Missing INDEXNOW_KEY" };
}

async function checkMcp(deep: boolean, origin: string | undefined): Promise<CheckResult> {
  if (!deep) return { ok: true, configured: true, detail: "skipped in shallow mode" };
  if (!origin) {
    return { ok: true, configured: true, detail: "no origin available; skipped" };
  }

  const start = Date.now();
  try {
    const response = await withTimeout(
      fetch(`${origin}/api/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
      }),
      DEEP_TIMEOUT_MS
    );
    const ms = Date.now() - start;
    const text = await response.text();

    if (!response.ok) {
      return { ok: false, configured: true, detail: `HTTP ${response.status}`, ms };
    }
    if (!text.includes("list_yachts")) {
      return { ok: false, configured: true, detail: "tools/list response missing list_yachts", ms };
    }
    return { ok: true, configured: true, ms };
  } catch (err) {
    return { ok: false, configured: true, detail: errorMessage(err), ms: Date.now() - start };
  }
}

/**
 * Runs all health checks and returns a consolidated report. Never throws —
 * every individual check catches its own errors.
 *
 * `deep: false` only reports whether integrations are configured (env vars
 * present) without making any network calls to paid/external APIs.
 * `deep: true` additionally exercises each configured integration with a
 * lightweight, time-bounded call.
 */
export async function runHealthChecks({ deep, origin }: RunHealthChecksOptions): Promise<HealthReport> {
  const database = await checkDatabase();
  const [adminClient, stripe, googleCalendar, mcp] = await Promise.all([
    checkAdminClient(deep),
    checkStripe(deep),
    checkGoogleCalendar(deep),
    checkMcp(deep, origin),
  ]);
  const email = checkEmail();
  const telegram = checkTelegram();
  const indexnow = checkIndexNow();

  const checks: Record<string, CheckResult> = {
    database: { ok: database.ok, configured: database.configured, detail: database.detail, ms: database.ms },
    adminClient,
    stripe,
    googleCalendar,
    email,
    telegram,
    mcp,
    indexnow,
  };

  let status: HealthStatus;
  if (!database.ok) {
    status = "error";
  } else {
    const dbEmpty = database.detail === DB_EMPTY_WARNING;
    const bookingCriticalUnconfigured = !adminClient.configured || !stripe.configured;
    const anyConfiguredFailing = Object.values(checks).some((c) => c.configured && !c.ok);
    status = dbEmpty || bookingCriticalUnconfigured || anyConfiguredFailing ? "warning" : "healthy";
  }

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
    meta: { yachts: database.yachts, destinations: database.destinations },
  };
}
