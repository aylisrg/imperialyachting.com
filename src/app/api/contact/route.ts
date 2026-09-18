import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { parseJsonBody } from "@/lib/api/validate";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { createAdminSupabase, isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import { notifyLead } from "@/lib/notify";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().optional(),
  inquiryType: z.enum(["Charter", "Yacht Management", "Cinematography", "Brandwave", "General"]),
  preferredDate: z.string().optional(),
  message: z.string().min(10).max(2000),
  // Honeypot field: real users never see or fill this input. If it's non-empty,
  // the submission is (almost certainly) a bot — silently accept without storing.
  website: z.string().optional(),
});

/**
 * POST /api/contact
 * Public endpoint backing the site's contact form. Rate-limited per IP,
 * validated, stores the lead, and fires off admin/auto-reply/Telegram
 * notifications.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again later.");
  }

  const parsed = await parseJsonBody(request, contactSchema);
  if (!parsed.ok) return parsed.response;

  const { data } = parsed;

  // Honeypot tripped: pretend success, don't store or notify anyone.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const lead = {
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    inquiry_type: data.inquiryType,
    preferred_date: data.preferredDate || null,
    message: data.message,
    source: "contact_form",
  };

  let id: string | undefined;

  if (isAdminSupabaseConfigured()) {
    try {
      const admin = createAdminSupabase();
      const { data: inserted, error } = await admin
        .from("leads")
        .insert(lead)
        .select("id")
        .single();

      if (error) {
        console.error("Failed to store lead:", error);
      } else {
        id = inserted?.id;
      }
    } catch (err) {
      console.error("Failed to store lead:", err);
    }
  } else {
    console.warn("Supabase admin client not configured — lead was not stored.");
  }

  await notifyLead(lead);

  return NextResponse.json({ ok: true, id });
}
