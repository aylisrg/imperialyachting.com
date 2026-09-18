import { describe, it, expect } from "vitest";
import { verifyBearer } from "../auth";

describe("verifyBearer", () => {
  it("returns true for a matching bearer token", () => {
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer secret-token" },
    });
    expect(verifyBearer(request, "secret-token")).toBe(true);
  });

  it("returns false for a non-matching token of the same length", () => {
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer secret-tokeX" },
    });
    expect(verifyBearer(request, "secret-token")).toBe(false);
  });

  it("returns false when lengths differ", () => {
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer short" },
    });
    expect(verifyBearer(request, "a-much-longer-secret")).toBe(false);
  });

  it("returns false when the header is missing", () => {
    const request = new Request("https://example.com");
    expect(verifyBearer(request, "secret-token")).toBe(false);
  });

  it("returns false when the header is not a Bearer token", () => {
    const request = new Request("https://example.com", {
      headers: { authorization: "Basic secret-token" },
    });
    expect(verifyBearer(request, "secret-token")).toBe(false);
  });

  it("returns false when expected is undefined", () => {
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer secret-token" },
    });
    expect(verifyBearer(request, undefined)).toBe(false);
  });

  it("returns false when expected is an empty string", () => {
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer " },
    });
    expect(verifyBearer(request, "")).toBe(false);
  });
});
