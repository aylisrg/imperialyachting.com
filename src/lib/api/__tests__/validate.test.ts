import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { parseJsonBody } from "../validate";

const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().nonnegative(),
});

describe("parseJsonBody", () => {
  it("returns parsed data for a valid body", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ name: "Ada", age: 30 }),
    });
    const result = await parseJsonBody(request, schema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ name: "Ada", age: 30 });
    }
  });

  it("returns a 400 validation_error response for a schema violation", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ name: "", age: -1 }),
    });
    const result = await parseJsonBody(request, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("validation_error");
      expect(Array.isArray(body.issues)).toBe(true);
    }
  });

  it("returns a 400 invalid_json response for malformed JSON", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: "{not json",
    });
    const result = await parseJsonBody(request, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("invalid_json");
    }
  });
});
