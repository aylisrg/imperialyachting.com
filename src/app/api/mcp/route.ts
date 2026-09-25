import { createMcpHandler } from "mcp-handler";
import { registerImperialServer } from "@/lib/mcp/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Mcp-Method, Mcp-Name",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const RATE_LIMIT = { limit: 60, windowMs: 60_000 };
const WRITE_RATE_LIMIT = { limit: 10, windowMs: 60_000 };
const WRITE_TOOL_NAMES = new Set(["create_quote", "create_checkout"]);

const INSTRUCTIONS = [
  "Imperial Yachting MCP server — luxury yacht charter in Dubai, departing from Dubai Harbour Yacht Club.",
  "All prices are in AED (United Arab Emirates Dirham). Hourly rates include a professional captain and crew, fuel for standard cruising routes, and soft drinks/water/ice.",
  "To help a client plan and book a charter: call `list_yachts` (filter by guest count or budget), then `get_yacht` for full pricing/specs on the top candidates, then `list_destinations` for itinerary ideas and `list_extras` for add-ons. Use `get_booking_terms` for the deposit rate, minimum charter hours, and cancellation policy.",
  "Booking flow: call `check_availability` to confirm a date/time is free, then `create_quote` (yacht, date, start hour, hours, guests, extras) for a priced, 30-minute quote, then `create_checkout` to generate a Stripe deposit link once the customer has explicitly confirmed the quote, and `get_booking` to check a booking's status afterwards.",
  "Yachts for sale (owner-direct, Dubai): `list_yachts_for_sale` returns listings with the page URL where brokers and buyers download the spec sheet and photos.",
  "Never invent prices or availability; always call the tools. Do not call create_checkout without explicit customer confirmation of the quote.",
  "The `plan_charter` prompt walks through the full flow end-to-end, including quoting and checkout.",
  "Resources `imperial://terms`, `imperial://company`, and `imperial://faq` provide the full terms of service, company/contact details, and FAQ as reference material.",
].join(" ");

const baseHandler = createMcpHandler(
  (server) => {
    registerImperialServer(server);
  },
  {
    serverInfo: { name: "imperial-yachting", version: "0.1.0" },
    instructions: INSTRUCTIONS,
  }
);

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function rateLimitedError(): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Rate limit exceeded. Please slow down and retry shortly.",
      },
      id: null,
    }),
    {
      status: 429,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
}

/**
 * Best-effort peek at the JSON-RPC body to find a `tools/call` request's
 * tool name, so write tools can be rate-limited more strictly than reads.
 * Uses `request.clone()` so the body stream handed to `baseHandler` below
 * is untouched. Any parse failure (non-JSON body, etc.) is swallowed —
 * `baseHandler` is the source of truth for validating the actual request.
 */
async function peekWriteToolName(request: Request): Promise<string | null> {
  try {
    const body = (await request.clone().json()) as {
      method?: string;
      params?: { name?: string };
    };
    if (body?.method === "tools/call" && typeof body.params?.name === "string") {
      const name = body.params.name;
      return WRITE_TOOL_NAMES.has(name) ? name : null;
    }
  } catch {
    // Not a JSON body (e.g. GET/SSE stream) — nothing to rate-limit here.
  }
  return null;
}

async function handler(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`mcp:${ip}`, RATE_LIMIT);
  if (!ok) {
    return rateLimitedError();
  }

  const writeToolName = request.method === "POST" ? await peekWriteToolName(request) : null;
  if (writeToolName) {
    const { ok: writeOk } = rateLimit(`mcp:write:${ip}`, WRITE_RATE_LIMIT);
    if (!writeOk) {
      return rateLimitedError();
    }
  }

  const response = await baseHandler(request);
  return withCors(response);
}

function options(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export { handler as GET, handler as POST, handler as DELETE, options as OPTIONS };
