import { NextResponse } from "next/server";
import { DOCUMENTS_COOKIE } from "@/lib/documents-auth";

export const runtime = "nodejs";

/** Clears the documents session cookie (lock the portal again). */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DOCUMENTS_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
