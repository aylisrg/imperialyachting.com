import { NextResponse, after } from "next/server";
import {
  DOCUMENTS_COOKIE,
  DOCUMENTS_SESSION_MAX_AGE,
  createSessionToken,
  verifyAccessLinkToken,
} from "@/lib/documents-auth";
import {
  accessContextFromRequest,
  recordLogin,
  syncContactWithPms,
} from "@/lib/documents-access";
import { notifyDocumentsLogin } from "@/lib/notify";

export const runtime = "nodejs";

function redirectTo(request: Request, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

/**
 * GET /api/documents/verify?token=…
 * Target of the emailed sign-in link: confirms the email, starts a session
 * and sends the visitor back to /documents. The team alert and the PMS
 * hand-off run after the redirect so they never slow the sign-in down.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const email = verifyAccessLinkToken(token);
  const session = email ? createSessionToken(email) : null;

  if (!email || !session) {
    return redirectTo(request, "/documents?access=expired#access");
  }

  const ctx = accessContextFromRequest(request);
  const contact = await recordLogin(email, ctx);
  const at = new Date();

  after(async () => {
    await Promise.allSettled([
      notifyDocumentsLogin({
        email,
        name: contact?.name ?? null,
        company: contact?.company ?? null,
        country: ctx.country,
        loginCount: contact?.login_count ?? 1,
        downloadCount: contact?.download_count ?? 0,
        at,
      }),
      contact ? syncContactWithPms(contact) : Promise.resolve(),
    ]);
  });

  const response = redirectTo(request, "/documents?access=granted#library");
  response.cookies.set({
    name: DOCUMENTS_COOKIE,
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DOCUMENTS_SESSION_MAX_AGE,
  });
  return response;
}
