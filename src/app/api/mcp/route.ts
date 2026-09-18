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

const INSTRUCTIONS = [
  "Imperial Yachting MCP server — luxury yacht charter in Dubai, departing from Dubai Harbour Yacht Club.",
  "All prices are in AED (United Arab Emirates Dirham). Hourly rates include a professional captain and crew, fuel for standard cruising routes, and soft drinks/water/ice.",
  "To help a client plan and book a charter: call `list_yachts` (filter by guest count or budget), then `get_yacht` for full pricing/specs on the top candidates, then `list_destinations` for itinerary ideas and `list_extras` for add-ons. Use `get_booking_terms` for the deposit rate, minimum charter hours, and cancellation policy.",
  "The `plan_charter` prompt walks through the full flow end-to-end, including quoting and checkout once those tools are available.",
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

async function handler(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`mcp:${ip}`, RATE_LIMIT);
  if (!ok) {
    return rateLimitedError();
  }

  const response = await baseHandler(request);
  return withCors(response);
}

function options(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export { handler as GET, handler as POST, handler as DELETE, options as OPTIONS };
