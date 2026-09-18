/**
 * Manual smoke test for the Imperial Yachting MCP server.
 *
 * Connects with the official Streamable HTTP client, lists the registered
 * tools, then calls `list_yachts` and `get_booking_terms` and prints the
 * results. Not part of the automated test suite (vitest) — run it by hand
 * against a running dev server (or a deployed one via MCP_URL).
 *
 * Usage:
 *   npm run dev                                   # in one terminal
 *   npx tsx scripts/mcp-smoke.ts                  # in another
 *   MCP_URL=https://imperialyachting.com/api/mcp npx tsx scripts/mcp-smoke.ts
 *
 * If `tsx` isn't installed, this also runs with a recent Node.js via:
 *   node --experimental-strip-types scripts/mcp-smoke.ts
 *
 * This file is excluded from the Next.js/tsc production build (see
 * tsconfig.json's "exclude") so a missing dev-only type here never breaks
 * `next build`.
 */

import { Client } from "@modelcontextprotocol/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

async function main() {
  const url = process.env.MCP_URL ?? "http://localhost:3000/api/mcp";
  console.log(`Connecting to ${url} ...`);

  const client = new Client({ name: "imperial-mcp-smoke", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(url));

  await client.connect(transport);
  console.log("Connected.\n");

  const tools = await client.listTools();
  console.log(`Tools (${tools.tools.length}):`);
  for (const tool of tools.tools) {
    console.log(`  - ${tool.name}: ${tool.title ?? "(no title)"}`);
  }
  console.log("");

  const yachtsResult = await client.callTool({
    name: "list_yachts",
    arguments: {},
  });
  console.log("list_yachts ->");
  console.log(JSON.stringify(yachtsResult.structuredContent ?? yachtsResult.content, null, 2));
  console.log("");

  const termsResult = await client.callTool({
    name: "get_booking_terms",
    arguments: {},
  });
  console.log("get_booking_terms ->");
  console.log(JSON.stringify(termsResult.structuredContent ?? termsResult.content, null, 2));

  await client.close();
}

main().catch((error) => {
  console.error("mcp-smoke failed:", error);
  process.exitCode = 1;
});
