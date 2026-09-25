import { describe, it, expect } from "vitest";
import {
  assertFetchableUrl,
  decodeBase64,
  directDownloadUrl,
  guessContentType,
  safeFileName,
  storagePathFor,
} from "@/lib/sales/admin-storage";

describe("admin storage helpers", () => {
  it("builds safe, unique storage paths", () => {
    expect(safeFileName("Van Dutch — Brochure (EN).PDF")).toBe("van-dutch-brochure-en.pdf");
    expect(safeFileName("../../etc/passwd")).toBe("etc-passwd");
    expect(storagePathFor("vd", "Tour.MP4", 123)).toBe("vd/123-tour.mp4");
  });

  it("guesses content types from extensions", () => {
    expect(guessContentType("a.pdf")).toBe("application/pdf");
    expect(guessContentType("a.MOV")).toBe("video/quicktime");
    expect(guessContentType("a.xyz")).toBe("application/octet-stream");
  });

  it("turns share links into direct downloads", () => {
    expect(directDownloadUrl("https://drive.google.com/file/d/abc_123/view?usp=sharing")).toBe(
      "https://drive.google.com/uc?export=download&id=abc_123"
    );
    expect(directDownloadUrl("https://www.dropbox.com/s/x/a.mp4?dl=0")).toBe(
      "https://www.dropbox.com/s/x/a.mp4?dl=1"
    );
  });

  it("only fetches public https URLs", () => {
    expect(() => assertFetchableUrl("http://example.com/a.jpg")).toThrow(/https/);
    expect(() => assertFetchableUrl("https://localhost/a")).toThrow(/not allowed/);
    expect(() => assertFetchableUrl("https://169.254.169.254/latest")).toThrow(/not allowed/);
    expect(() => assertFetchableUrl("https://10.0.0.5/a")).toThrow(/not allowed/);
    expect(assertFetchableUrl("https://example.com/a.jpg").hostname).toBe("example.com");
  });

  it("decodes base64 and data URLs with a size cap", () => {
    expect(Buffer.from(decodeBase64("aGVsbG8=")).toString()).toBe("hello");
    expect(Buffer.from(decodeBase64("data:text/plain;base64,aGVsbG8=")).toString()).toBe("hello");
    expect(() => decodeBase64("aGVsbG8=", 2)).toThrow(/limit/);
    expect(() => decodeBase64("")).toThrow(/empty/);
  });
});
