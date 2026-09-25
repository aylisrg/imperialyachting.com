import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { parseJsonBody } from "@/lib/api/validate";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { createAdminSupabase, isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import { fetchSaleListingBySlug } from "@/lib/sales/listings-db";
import { fetchSaleMaterialRows, resolveMaterials } from "@/lib/sales/materials";
import { notifySaleDownload } from "@/lib/notify";
import { SITE_CONFIG } from "@/lib/constants";

export const runtime = "nodejs";

const downloadSchema = z.object({
  slug: z.string().min(1).max(200),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address").max(254),
  materialIds: z.array(z.string().min(1).max(100)).min(1, "Pick at least one item").max(50),
  isBroker: z.boolean().optional(),
  company: z.string().trim().max(200).optional(),
  clientName: z.string().trim().max(200).optional(),
  // Honeypot: hidden from people, bots fill it in.
  website: z.string().optional(),
});

async function countPreviousDownloads(slug: string, email: string): Promise<number> {
  const { count } = await createAdminSupabase()
    .from("sale_download_requests")
    .select("id", { count: "exact", head: true })
    .eq("listing_slug", slug)
    .eq("email", email);
  return count ?? 0;
}

/**
 * POST /api/sales/download
 * The DocSend-style gate: takes the ticked materials plus an email, logs who
 * took what, alerts the owner (email + Telegram), emails the requester a copy
 * and returns signed download links for the browser to start immediately.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`sales-download:${ip}`, { limit: 10, windowMs: 60_000 }).ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again in a minute.");
  }

  const parsed = await parseJsonBody(request, downloadSchema);
  if (!parsed.ok) return parsed.response;
  const { data } = parsed;

  if (data.website) {
    return NextResponse.json({ ok: true, files: [] });
  }

  const listing = await fetchSaleListingBySlug(data.slug);
  if (!listing || listing.status === "sold") {
    return jsonError(404, "not_found", "This listing is no longer available.");
  }

  const rows = await fetchSaleMaterialRows(listing.id);
  const resolved = await resolveMaterials(listing, rows, data.materialIds, new URL(request.url).origin);
  if (resolved.length === 0) {
    return jsonError(400, "no_materials", "None of the selected materials are available right now.");
  }

  const email = data.email.toLowerCase();
  const isBroker = Boolean(data.isBroker);
  const company = isBroker ? data.company || null : null;
  const clientName = isBroker ? data.clientName || null : null;
  const referrer = request.headers.get("referer");
  const country = request.headers.get("x-vercel-ip-country");

  let previousDownloads = 0;
  if (isAdminSupabaseConfigured()) {
    try {
      previousDownloads = await countPreviousDownloads(listing.slug, email);
      const { error } = await createAdminSupabase()
        .from("sale_download_requests")
        .insert({
          listing_id: listing.id,
          listing_slug: listing.slug,
          email,
          is_broker: isBroker,
          company,
          client_name: clientName,
          materials: resolved.map((m) => ({ id: m.id, title: m.title })),
          ip,
          user_agent: request.headers.get("user-agent"),
          referrer,
        });
      if (error) console.error("[sales] failed to log download:", error.message);
    } catch (err) {
      // Logging must never block the download itself.
      console.error("[sales] download log unavailable:", err);
    }
  }

  await notifySaleDownload({
    listingTitle: listing.title,
    listingUrl: `${SITE_CONFIG.url}/yachts-for-sale/${listing.slug}`,
    email,
    isBroker,
    company,
    clientName,
    materials: resolved,
    at: new Date(),
    country,
    ip,
    referrer,
    previousDownloads,
  });

  return NextResponse.json({
    ok: true,
    files: resolved.flatMap((m) => m.files),
  });
}
