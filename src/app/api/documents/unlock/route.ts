import { NextResponse } from "next/server";
import {
  DOCUMENTS_COOKIE,
  DOCUMENTS_SESSION_MAX_AGE,
  createSessionToken,
  isPasswordValid,
} from "@/lib/documents-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isPasswordValid(password)) {
    return NextResponse.json(
      { error: "Incorrect password. Please try again." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DOCUMENTS_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DOCUMENTS_SESSION_MAX_AGE,
  });
  return response;
}
