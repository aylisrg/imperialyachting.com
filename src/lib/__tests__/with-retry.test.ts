import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../supabase/with-retry";

describe("withRetry", () => {
  it("returns data on first success", async () => {
    const op = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });

    const result = await withRetry(op, { label: "test", retries: 0 });

    expect(result).toEqual([{ id: 1 }]);
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("returns null when data is null and no error", async () => {
    const op = vi.fn().mockResolvedValue({ data: null, error: null });

    const result = await withRetry(op, { label: "test", retries: 0 });

    expect(result).toBeNull();
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries on error and succeeds", async () => {
    const op = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: "timeout" } })
      .mockResolvedValueOnce({ data: [{ id: 1 }], error: null });

    const result = await withRetry(op, { label: "test", retries: 1 });

    expect(result).toEqual([{ id: 1 }]);
    expect(op).toHaveBeenCalledTimes(2);
  }, 10000);

  it("throws after all retries exhausted", async () => {
    const op = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "connection refused" },
    });

    await expect(
      withRetry(op, { label: "test", retries: 1 })
    ).rejects.toThrow("connection refused");

    expect(op).toHaveBeenCalledTimes(2); // initial + 1 retry
  }, 10000);

  it("retries on thrown exceptions and succeeds", async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ data: { id: 1 }, error: null });

    const result = await withRetry(op, { label: "test", retries: 1 });

    expect(result).toEqual({ id: 1 });
    expect(op).toHaveBeenCalledTimes(2);
  }, 10000);

  it("throws after all retries with thrown exceptions", async () => {
    const op = vi.fn().mockRejectedValue(new Error("DNS failure"));

    await expect(
      withRetry(op, { label: "test", retries: 1 })
    ).rejects.toThrow("DNS failure");

    expect(op).toHaveBeenCalledTimes(2);
  }, 10000);
});
