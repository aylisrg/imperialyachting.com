import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validate";
import { jsonError } from "@/lib/api/errors";

const bodySchema = z.object({
  action: z.enum(["cancel", "mark_paid", "confirm_offline"]),
  notes: z.string().optional(),
});

const STATUS_BY_ACTION: Record<z.infer<typeof bodySchema>["action"], string> = {
  cancel: "cancelled",
  mark_paid: "paid",
  confirm_offline: "deposit_paid",
};

/**
 * PATCH /api/admin/bookings/[id]
 * Manual admin actions on a booking that RLS does not allow authenticated
 * users to perform directly (bookings has no admin write policy — every
 * mutation goes through the service-role client). Requires a logged-in
 * Supabase user (checked via the cookie-based server client); the actual
 * write uses the service-role admin client.
 *
 * Body: { action: "cancel" | "mark_paid" | "confirm_offline", notes?: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(401, "unauthorized");
  }

  const result = await parseJsonBody(request, bodySchema);
  if (!result.ok) return result.response;

  const { id } = await params;
  const { action, notes } = result.data;
  const status = STATUS_BY_ACTION[action];

  const admin = createAdminSupabase();

  const { data: existing, error: fetchError } = await admin
    .from("bookings")
    .select("notes")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return jsonError(404, "not_found");
  }

  const timestamp = new Date().toISOString();
  const appendedNote = notes && notes.trim().length > 0
    ? `[${timestamp}] ${action}: ${notes.trim()}`
    : `[${timestamp}] ${action}`;
  const combinedNotes = existing.notes
    ? `${existing.notes}\n${appendedNote}`
    : appendedNote;

  const { data, error } = await admin
    .from("bookings")
    .update({ status, notes: combinedNotes })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return jsonError(500, "update_failed", error.message);
  }

  return NextResponse.json({ booking: data });
}
