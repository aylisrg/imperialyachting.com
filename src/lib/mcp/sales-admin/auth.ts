import { timingSafeEqual } from "crypto";

/** Tokens shorter than this are treated as "not configured" — fail closed. */
export const MIN_SALES_ADMIN_TOKEN_LENGTH = 24;

/**
 * Owner check for the sales-admin MCP. Accepts the token as
 * `Authorization: Bearer <token>` (Claude Code, Cursor) or `?key=<token>`
 * (claude.ai / ChatGPT custom connectors, which only take a URL).
 */
export function isSalesAdminAuthorized(request: Request, expected: string | undefined): boolean {
  if (!expected || expected.length < MIN_SALES_ADMIN_TOKEN_LENGTH) return false;

  const header = request.headers.get("authorization");
  const bearer = header ? /^Bearer (.+)$/.exec(header)?.[1] : undefined;
  const token = bearer || new URL(request.url).searchParams.get("key") || "";

  const given = Buffer.from(token);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
