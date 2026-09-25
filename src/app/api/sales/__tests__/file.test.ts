import { describe, it, expect, beforeEach } from "vitest";
import { createFileToken } from "@/lib/sales/file-token";

beforeEach(() => {
  process.env.SALES_FILE_SECRET = "test-secret";
});

describe("GET /api/sales/file", () => {
  it("streams a bundled file for a valid token", async () => {
    const { GET } = await import("../file/route");
    const token = createFileToken("van-dutch-connect/technical-specification.pdf", "VanDutch Spec.pdf", 60)!;
    const res = await GET(new Request(`https://x/api/sales/file?t=${encodeURIComponent(token)}`));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="VanDutch Spec.pdf"');
    const body = new Uint8Array(await res.arrayBuffer());
    expect(Buffer.from(body.slice(0, 4)).toString()).toBe("%PDF");
  });

  it("refuses missing or forged tokens", async () => {
    const { GET } = await import("../file/route");
    expect((await GET(new Request("https://x/api/sales/file"))).status).toBe(403);
    expect((await GET(new Request("https://x/api/sales/file?t=abc.def"))).status).toBe(403);
  });

  it("404s a valid token pointing outside the sales folder", async () => {
    const { GET } = await import("../file/route");
    const token = createFileToken("../documents/ejari.pdf", "x.pdf", 60)!;
    expect((await GET(new Request(`https://x/api/sales/file?t=${encodeURIComponent(token)}`))).status).toBe(404);
  });
});
