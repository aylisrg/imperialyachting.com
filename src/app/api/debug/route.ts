import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {};

  // 1. Check env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  diagnostics.envVars = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `${url.slice(0, 30)}...` : "MISSING!",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? `${key.slice(0, 20)}...` : "MISSING!",
  };

  if (!url || !key) {
    diagnostics.status = "FAIL";
    diagnostics.error = "Supabase env vars are missing. Set them in your hosting dashboard.";
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // 2. Try raw fetch to Supabase REST API
  try {
    const res = await fetch(`${url}/rest/v1/yachts?select=id,name,slug&limit=5`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const data = await res.json();
    diagnostics.supabaseRaw = {
      status: res.status,
      yachtsCount: Array.isArray(data) ? data.length : 0,
      yachts: Array.isArray(data) ? data.map((y: { name: string; slug: string }) => `${y.name} (${y.slug})`) : data,
    };
  } catch (err) {
    diagnostics.supabaseRaw = {
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // 3. Try createServerSupabase
  try {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("yachts")
      .select("id,name,slug")
      .limit(5);
    diagnostics.supabaseSSR = {
      error: error?.message || null,
      yachtsCount: data?.length ?? 0,
      yachts: data?.map((y: { name: string; slug: string }) => `${y.name} (${y.slug})`) ?? [],
    };
  } catch (err) {
    diagnostics.supabaseSSR = {
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // 4. Try full fetchAllYachts
  try {
    const { fetchAllYachts } = await import("@/lib/yachts-db");
    const yachts = await fetchAllYachts();
    diagnostics.fetchAllYachts = {
      count: yachts.length,
      yachts: yachts.map((y) => `${y.name} (${y.slug})`),
    };
  } catch (err) {
    diagnostics.fetchAllYachts = {
      error: err instanceof Error ? err.message : String(err),
    };
  }

  diagnostics.status = "OK";
  return NextResponse.json(diagnostics, { status: 200 });
}
