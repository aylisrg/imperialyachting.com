import { createMcpHandler } from "mcp-handler";
import { registerSalesAdminServer } from "@/lib/mcp/sales-admin/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { isSalesAdminAuthorized } from "@/lib/mcp/sales-admin/auth";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const INSTRUCTIONS = [
  "Private admin MCP for Imperial Yachting's yachts-for-sale section (/yachts-for-sale). Only the owner has the token.",
  "Workflow: sales_list_listings → sales_upsert_listing (create/update text, specs, status, price) → sales_add_media (page photos/videos) → sales_add_material (gated downloads: spec sheets, brochures, surveys).",
  "Listings linked to a fleet yacht (fleet_yacht_slug) automatically show that yacht's photos, videos and specs; only add what is sale-specific.",
  "Pages are for brokers: keep description short and factual; put detail into spec_sections and materials.",
  "Large files: sales_create_upload_url, PUT the file with the returned curl, then register it with storage_path.",
  "sales_list_downloads shows who downloaded what (the owner also gets an email per download).",
].join(" ");

const baseHandler = createMcpHandler(
  (server) => {
    registerSalesAdminServer(server);
  },
  {
    serverInfo: { name: "imperial-yachting-sales-admin", version: "0.1.0" },
    instructions: INSTRUCTIONS,
  }
);

function unauthorized(): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null }),
    { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
}

async function handler(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  if (!rateLimit(`mcp-sales:${ip}`, { limit: 60, windowMs: 60_000 }).ok) {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Rate limit exceeded." }, id: null }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!isSalesAdminAuthorized(request, process.env.SALES_ADMIN_TOKEN?.trim())) {
    return unauthorized();
  }

  return baseHandler(request);
}

export { handler as GET, handler as POST, handler as DELETE };
