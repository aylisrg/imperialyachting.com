/**
 * Retry a Supabase query with exponential backoff.
 * Handles transient network failures without silently swallowing errors.
 */
export async function withRetry<T>(
  operation: () => PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>,
  opts: { label: string; retries?: number } = { label: "query" }
): Promise<T> {
  const maxRetries = opts.retries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await operation();

      if (error) {
        lastError = new Error(`[${opts.label}] Supabase error: ${error.message}`);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500; // 500ms, 1000ms, 2000ms
          console.warn(`[${opts.label}] Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms…`);
          await sleep(delay);
          continue;
        }
      }

      if (data === null && !error) {
        // Supabase returned null without error — no data found
        return null as T;
      }

      if (data !== null) {
        return data;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500;
        console.warn(`[${opts.label}] Attempt ${attempt + 1} threw: ${lastError.message}. Retrying in ${delay}ms…`);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted — throw, don't silently return empty
  throw lastError ?? new Error(`[${opts.label}] Failed after ${maxRetries + 1} attempts`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
