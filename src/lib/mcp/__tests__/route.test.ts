import { describe, it, expect, beforeEach } from "vitest";
import { __resetRateLimitStateForTests } from "@/lib/api/rateLimit";

const EXPECTED_TOOL_NAMES = [
  "list_yachts",
  "get_yacht",
  "list_destinations",
  "list_extras",
  "get_booking_terms",
  "check_availability",
  "create_quote",
  "create_checkout",
  "get_booking",
];

const READ_ONLY_TOOL_NAMES = new Set([
  "list_yachts",
  "get_yacht",
  "list_destinations",
  "list_extras",
  "get_booking_terms",
  "check_availability",
  "get_booking",
]);

function jsonRpcRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/** The handler streams a single SSE `data:` frame for a stateless JSON-RPC response. */
async function parseSseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  const dataLine = text
    .split("\n")
    .find((line) => line.startsWith("data:"));
  if (!dataLine) throw new Error(`No SSE data line in response body: ${text}`);
  return JSON.parse(dataLine.slice("data:".length).trim());
}

beforeEach(() => {
  __resetRateLimitStateForTests();
});

describe("/api/mcp route", () => {
  it("answers OPTIONS with CORS headers", async () => {
    const { OPTIONS } = await import("@/app/api/mcp/route");
    const res = OPTIONS();

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    expect(res.headers.get("access-control-allow-headers")).toContain("Mcp-Session-Id");
    expect(res.headers.get("access-control-expose-headers")).toContain("Mcp-Session-Id");
  });

  it("lists all 9 tools with titles and annotations via tools/list", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const res = await POST(
      jsonRpcRequest({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");

    const body = (await parseSseJson(res)) as {
      result: { tools: Array<{ name: string; title?: string; annotations?: Record<string, unknown> }> };
    };

    const names = body.result.tools.map((t) => t.name).sort();
    expect(names).toEqual([...EXPECTED_TOOL_NAMES].sort());

    for (const tool of body.result.tools) {
      expect(tool.title).toBeTruthy();
      if (READ_ONLY_TOOL_NAMES.has(tool.name)) {
        expect(tool.annotations).toMatchObject({ readOnlyHint: true, idempotentHint: true });
      } else {
        expect(tool.annotations).toMatchObject({ readOnlyHint: false });
      }
    }

    const createCheckout = body.result.tools.find((t) => t.name === "create_checkout");
    expect(createCheckout?.annotations).toMatchObject({
      readOnlyHint: false,
      idempotentHint: true,
    });
  });

  it("lists the reference resources via resources/list", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const res = await POST(
      jsonRpcRequest({ jsonrpc: "2.0", id: 2, method: "resources/list", params: {} })
    );

    const body = (await parseSseJson(res)) as {
      result: { resources: Array<{ uri: string }> };
    };
    const uris = body.result.resources.map((r) => r.uri).sort();
    expect(uris).toEqual(["imperial://company", "imperial://faq", "imperial://terms"]);
  });

  it("lists the plan_charter prompt via prompts/list", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const res = await POST(
      jsonRpcRequest({ jsonrpc: "2.0", id: 3, method: "prompts/list", params: {} })
    );

    const body = (await parseSseJson(res)) as {
      result: { prompts: Array<{ name: string }> };
    };
    expect(body.result.prompts.map((p) => p.name)).toEqual(["plan_charter"]);
  });

  it("calls get_booking_terms end-to-end and returns structured content", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const res = await POST(
      jsonRpcRequest({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "get_booking_terms", arguments: {} },
      })
    );

    const body = (await parseSseJson(res)) as {
      result: { structuredContent: { currency: string; depositRate: number } };
    };
    expect(body.result.structuredContent.currency).toBe("AED");
    expect(body.result.structuredContent.depositRate).toBe(0.5);
  });

  it("rejects a request over the rate limit with a 429 JSON-RPC error", async () => {
    const { POST } = await import("@/app/api/mcp/route");

    let lastStatus = 200;
    for (let i = 0; i < 61; i++) {
      const res = await POST(
        jsonRpcRequest({ jsonrpc: "2.0", id: i, method: "tools/list", params: {} })
      );
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }

    expect(lastStatus).toBe(429);
  });

  it("rejects the 11th create_quote tools/call within a minute with a 429", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const headers = { "x-forwarded-for": "203.0.113.42" };

    let lastStatus = 200;
    for (let i = 0; i < 11; i++) {
      const res = await POST(
        jsonRpcRequest(
          {
            jsonrpc: "2.0",
            id: i,
            method: "tools/call",
            params: {
              name: "create_quote",
              arguments: {
                yachtSlug: "monte-carlo-6",
                date: "2099-01-01",
                startHour: 10,
                hours: 4,
                guests: 4,
              },
            },
          },
          headers
        )
      );
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }

    expect(lastStatus).toBe(429);
  });

  it("does not rate-limit create_quote calls under the write limit for a fresh IP", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const headers = { "x-forwarded-for": "203.0.113.99" };

    const res = await POST(
      jsonRpcRequest(
        {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "create_quote",
            arguments: {
              yachtSlug: "monte-carlo-6",
              date: "2099-01-01",
              startHour: 10,
              hours: 4,
              guests: 4,
            },
          },
        },
        headers
      )
    );

    expect(res.status).toBe(200);
  });
});
