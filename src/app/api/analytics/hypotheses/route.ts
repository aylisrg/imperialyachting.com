import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/analytics/hypotheses
 * Returns hypotheses, optionally filtered by report_id or status.
 * Query params: ?report_id=xxx&status=new&limit=50
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("report_id");
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const supabase = await createServerSupabase();

  let query = supabase
    .from("analytics_hypotheses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reportId) query = query.eq("report_id", reportId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hypotheses: data });
}

/**
 * PATCH /api/analytics/hypotheses
 * Update a hypothesis status/notes.
 * Body: { id: string, status?: string, notes?: string }
 */
export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const { data, error } = await supabase
    .from("analytics_hypotheses")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hypothesis: data });
}
