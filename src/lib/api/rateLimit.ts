/**
 * In-memory, per-instance sliding-window rate limiter.
 *
 * IMPORTANT: on Vercel (and most serverless platforms) each function
 * invocation may land on a different lambda instance, and instances are
 * recycled frequently, so this Map is NOT a shared/global store. It only
 * protects a single warm instance from being hammered. Treat this as a
 * first line of defence against accidental retries/loops and casual abuse
 * — not as a robust, distributed rate limit. For real guarantees, back
 * this with a shared store (e.g. Upstash Redis, Supabase) later.
 */

interface Bucket {
  /** Timestamps (ms) of requests within the current window. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** How often to sweep stale buckets, to keep the Map from growing forever. */
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;
let lastPruneAt = 0;

function pruneStaleBuckets(now: number, maxWindowMs: number) {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < maxWindowMs);
    if (bucket.hits.length === 0) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed under the limit. */
  ok: boolean;
  /** Requests remaining in the current window after this one. */
  remaining: number;
  /** Epoch ms when the current window fully resets. */
  resetAt: number;
}

/**
 * Records a hit for `key` and reports whether it is within `limit` requests
 * per `windowMs` (sliding window, per process instance).
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  pruneStaleBuckets(now, windowMs);

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  // Drop hits outside the sliding window.
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  const resetAt = (bucket.hits[0] ?? now) + windowMs;

  if (bucket.hits.length >= limit) {
    return { ok: false, remaining: 0, resetAt };
  }

  bucket.hits.push(now);
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.hits.length),
    resetAt: bucket.hits[0] + windowMs,
  };
}

/**
 * Best-effort client IP extraction for use as a rate-limit key.
 * Checks `x-forwarded-for` (first entry, as set by proxies/Vercel) then
 * `x-real-ip`, falling back to "unknown" when neither is present.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/** Test-only helper to reset internal state between test cases. */
export function __resetRateLimitStateForTests(): void {
  buckets.clear();
  lastPruneAt = 0;
}
