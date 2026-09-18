import { timingSafeEqual } from "crypto";

/**
 * Verifies a `Authorization: Bearer <token>` header against an expected
 * secret using a constant-time comparison, to avoid leaking timing
 * information about how much of the token matched.
 *
 * Returns false (rather than throwing) when:
 * - `expected` is unset/empty (nothing to compare against — fail closed),
 * - the header is missing or not a Bearer token,
 * - the token length differs from the expected secret's length
 *   (timingSafeEqual requires equal-length buffers).
 */
export function verifyBearer(request: Request, expected: string | undefined): boolean {
  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const match = /^Bearer (.+)$/.exec(authHeader);
  if (!match) return false;

  const token = match[1];
  const expectedBuf = Buffer.from(expected);
  const tokenBuf = Buffer.from(token);

  if (expectedBuf.length !== tokenBuf.length) return false;

  return timingSafeEqual(expectedBuf, tokenBuf);
}
