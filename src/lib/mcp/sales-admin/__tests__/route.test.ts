import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";
import { isSalesAdminAuthorized } from "@/lib/mcp/sales-admin/auth";

const TOKEN = "a-very-long-sales-admin-token-123456";

function rpc(url: string, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
  });
}

async function toolNames(res: Response): Promise<string[]> {
  const text = await res.text();
  const line = text.split("\n").find((l) => l.startsWith("data:"));
  const body = JSON.parse(line!.slice(5).trim()) as { result: { tools: Array<{ name: string }> } };
  return body.result.tools.map((t) => t.name).sort();
}

beforeEach(() => {
  __resetRateLimitStateForTests();
  process.env.SALES_ADMIN_TOKEN = TOKEN;
});

afterEach(() => {
  delete process.env.SALES_ADMIN_TOKEN;
});

describe("isSalesAdminAuthorized", () => {
  it("accepts the token as a bearer header or ?key=", () => {
    expect(isSalesAdminAuthorized(new Request("https://x/api/mcp/sales", { headers: { authorization: `Bearer ${TOKEN}` } }), TOKEN)).toBe(true);
    expect(isSalesAdminAuthorized(new Request(`https://x/api/mcp/sales?key=${TOKEN}`), TOKEN)).toBe(true);
  });

  it("rejects wrong, missing and too-short configured tokens", () => {
    expect(isSalesAdminAuthorized(new Request("https://x/api/mcp/sales?key=nope"), TOKEN)).toBe(false);
    expect(isSalesAdminAuthorized(new Request("https://x/api/mcp/sales"), TOKEN)).toBe(false);
    expect(isSalesAdminAuthorized(new Request("https://x/api/mcp/sales?key=short"), "short")).toBe(false);
    expect(isSalesAdminAuthorized(new Request("https://x/api/mcp/sales?key="), undefined)).toBe(false);
  });
});

describe("/api/mcp/sales route", () => {
  it("returns 401 without the token", async () => {
    const { POST } = await import("@/app/api/mcp/sales/route");
    const res = await POST(rpc("http://localhost/api/mcp/sales"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when no token is configured, even for an empty key", async () => {
    delete process.env.SALES_ADMIN_TOKEN;
    const { POST } = await import("@/app/api/mcp/sales/route");
    expect((await POST(rpc("http://localhost/api/mcp/sales?key="))).status).toBe(401);
  });

  it("lists the admin tools for the owner", async () => {
    const { POST } = await import("@/app/api/mcp/sales/route");
    const res = await POST(rpc("http://localhost/api/mcp/sales", { Authorization: `Bearer ${TOKEN}` }));
    expect(res.status).toBe(200);
    expect(await toolNames(res)).toEqual([
      "sales_add_material",
      "sales_add_media",
      "sales_create_upload_url",
      "sales_get_listing",
      "sales_list_downloads",
      "sales_list_listings",
      "sales_remove_item",
      "sales_upsert_listing",
    ]);
  });
});
