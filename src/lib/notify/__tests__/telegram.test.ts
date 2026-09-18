import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { sendTelegram, escapeTelegramMarkdown } from "../telegram";

describe("sendTelegram", () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChatId = process.env.TELEGRAM_CHAT_ID;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
    process.env.TELEGRAM_CHAT_ID = originalChatId;
  });

  it("returns false when unconfigured", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const fetchSpy = vi.spyOn(global, "fetch");
    const result = await sendTelegram("hello");

    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls the Telegram API with the right URL and body when configured", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "12345";

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    const result = await sendTelegram("hello world", { parseMode: "Markdown" });

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.telegram.org/bottest-token/sendMessage");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      chat_id: "12345",
      text: "hello world",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  });

  it("returns false when the Telegram API responds with an error", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "12345";

    vi.spyOn(global, "fetch").mockResolvedValue(new Response("nope", { status: 400 }));

    const result = await sendTelegram("hello");
    expect(result).toBe(false);
  });

  it("returns false (never throws) when fetch rejects", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "12345";

    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

    await expect(sendTelegram("hello")).resolves.toBe(false);
  });

  it("omits parse_mode when not provided", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "12345";

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await sendTelegram("plain text");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.parse_mode).toBeUndefined();
  });
});

describe("escapeTelegramMarkdown", () => {
  it("escapes markdown special characters", () => {
    expect(escapeTelegramMarkdown("hello_world *bold* [link](url) `code`")).toBe(
      "hello\\_world \\*bold\\* \\[link\\](url) \\`code\\`"
    );
  });

  it("leaves plain text unchanged", () => {
    expect(escapeTelegramMarkdown("Just a normal message.")).toBe("Just a normal message.");
  });
});
