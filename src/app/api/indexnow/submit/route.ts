import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { submitToIndexNow } from "@/lib/seo/indexnow";

/**
 * Lets the (client-side) admin UI ping IndexNow after saving a yacht or
 * destination. Requires a logged-in Supabase session, since the admin area
 * writes directly to Supabase from the browser rather than through
 * server actions.
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let urls: unknown;
  try {
    const body = await request.json();
    urls = body?.urls;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(urls) || !urls.every((u) => typeof u === "string")) {
    return NextResponse.json(
      { error: "`urls` must be an array of strings" },
      { status: 400 }
    );
  }

  const result = await submitToIndexNow(urls);

  return NextResponse.json(result);
}
