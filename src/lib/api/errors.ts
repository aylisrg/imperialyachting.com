import { NextResponse } from "next/server";

/**
 * Builds a consistent JSON error response for API routes.
 */
export function jsonError(
  status: number,
  code: string,
  message?: string
): NextResponse {
  return NextResponse.json(
    message ? { error: code, message } : { error: code },
    { status }
  );
}
