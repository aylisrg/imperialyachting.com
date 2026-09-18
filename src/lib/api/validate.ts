import { NextResponse } from "next/server";
import type { z } from "zod/v4";
import { jsonError } from "./errors";

export type ParseJsonBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/**
 * Parses a request body as JSON and validates it against a zod schema.
 * Returns a discriminated result so callers can `return result.response`
 * directly on failure without re-deriving the error shape.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<ParseJsonBodyResult<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: jsonError(400, "invalid_json") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "validation_error", issues: result.error.issues },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: result.data };
}
