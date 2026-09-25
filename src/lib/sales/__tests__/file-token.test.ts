import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createFileToken,
  resolveBundledFile,
  verifyFileToken,
} from "@/lib/sales/file-token";

const ORIGINAL = { ...process.env };

beforeEach(() => {
  process.env.SALES_FILE_SECRET = "test-secret-value";
});

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("file tokens", () => {
  it("round-trips a valid token", () => {
    const token = createFileToken("van-dutch-connect/technical-specification.pdf", "spec.pdf", 60)!;
    expect(verifyFileToken(token)).toEqual({
      location: "van-dutch-connect/technical-specification.pdf",
      fileName: "spec.pdf",
    });
  });

  it("rejects expired, tampered and garbage tokens", () => {
    const now = Date.now();
    const token = createFileToken("a.pdf", "a.pdf", 60, now)!;
    expect(verifyFileToken(token, now + 61_000)).toBeNull();

    const [body, sig] = token.split(".");
    const forgedBody = Buffer.from(JSON.stringify({ l: "b.pdf", n: "b.pdf", e: 9999999999 })).toString("base64url");
    expect(verifyFileToken(`${forgedBody}.${sig}`)).toBeNull();
    expect(verifyFileToken(`${body}.AAAA`)).toBeNull();
    expect(verifyFileToken("nonsense")).toBeNull();
  });

  it("fails closed without any secret", () => {
    delete process.env.SALES_FILE_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(createFileToken("a.pdf", "a.pdf", 60)).toBeNull();
    expect(verifyFileToken("x.y")).toBeNull();
  });

  it("falls back to a key derived from the service role key", () => {
    delete process.env.SALES_FILE_SECRET;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    const token = createFileToken("a.pdf", "a.pdf", 60)!;
    expect(verifyFileToken(token)).not.toBeNull();
  });
});

describe("resolveBundledFile", () => {
  it("finds the shipped VanDutch spec sheet", () => {
    expect(resolveBundledFile("van-dutch-connect/technical-specification.pdf")).toMatch(
      /private[\\/]sales[\\/]van-dutch-connect[\\/]technical-specification\.pdf$/
    );
  });

  it("refuses traversal and missing files", () => {
    expect(resolveBundledFile("../documents/ejari.pdf")).toBeNull();
    expect(resolveBundledFile("van-dutch-connect/../../documents/ejari.pdf")).toBeNull();
    expect(resolveBundledFile("/etc/passwd")).toBeNull();
    expect(resolveBundledFile("missing.pdf")).toBeNull();
  });
});
