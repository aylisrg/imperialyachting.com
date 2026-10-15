import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";

const cookieValue = vi.fn<() => string | undefined>();
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (cookieValue() ? { value: cookieValue() } : undefined) }),
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => {
    void task();
  },
}));

// Point the catalog at a PDF that ships in the repo.
vi.mock("@/lib/documents-files", () => ({
  getDocumentFilePath: (slug: string) =>
    slug === "trade-license"
      ? path.join(process.cwd(), "private", "documents", "trade-license.pdf")
      : null,
}));

const recordDownload = vi.fn();
vi.mock("@/lib/documents-access", () => ({
  accessContextFromRequest: () => ({ ip: null, userAgent: null, country: null, referrer: null }),
  recordDownload: (...args: unknown[]) => recordDownload(...args),
}));

function get(slug: string) {
  return import("../file/[slug]/route").then(({ GET }) =>
    GET(new Request(`https://imperialyachting.com/api/documents/file/${slug}`), {
      params: Promise.resolve({ slug }),
    })
  );
}

describe("GET /api/documents/file/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DOCUMENTS_SESSION_SECRET = "test-docs-secret";
    cookieValue.mockReturnValue(undefined);
  });

  it("refuses visitors who have not confirmed their email", async () => {
    expect((await get("trade-license")).status).toBe(401);
    cookieValue.mockReturnValue("a".repeat(64));
    expect((await get("trade-license")).status).toBe(401);
    expect(recordDownload).not.toHaveBeenCalled();
  });

  it("streams the PDF to a signed-in visitor and logs the download", async () => {
    const { createSessionToken } = await import("@/lib/documents-auth");
    cookieValue.mockReturnValue(createSessionToken("jane@acme.com")!);

    const res = await get("trade-license");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(recordDownload).toHaveBeenCalledWith("jane@acme.com", "trade-license", expect.any(Object));
  });

  it("404s unknown documents", async () => {
    const { createSessionToken } = await import("@/lib/documents-auth");
    cookieValue.mockReturnValue(createSessionToken("jane@acme.com")!);
    expect((await get("nope")).status).toBe(404);
  });
});
