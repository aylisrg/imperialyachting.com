import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import { SITE_CONFIG } from "@/lib/constants";

describe("robots", () => {
  const result = robots();

  it("includes a wildcard rule allowing / and disallowing sensitive paths", () => {
    const wildcard = Array.isArray(result.rules)
      ? result.rules.find((r) => r.userAgent === "*")
      : result.rules;

    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toBe("/");
    expect(wildcard?.disallow).toEqual(
      expect.arrayContaining(["/api/", "/admin/", "/documents", "/booking/"])
    );
  });

  it("does not disallow /ai or /.well-known/", () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    for (const rule of rules) {
      const disallow = Array.isArray(rule.disallow)
        ? rule.disallow
        : rule.disallow
          ? [rule.disallow]
          : [];
      expect(disallow).not.toContain("/ai");
      expect(disallow).not.toContain("/.well-known/");
    }
  });

  it("explicitly allows key AI and search crawlers", () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.map((r) =>
      Array.isArray(r.userAgent) ? r.userAgent.join(",") : r.userAgent
    );

    for (const bot of [
      "Googlebot",
      "Googlebot-Image",
      "Bingbot",
      "msnbot",
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "PerplexityBot",
      "Perplexity-User",
      "ClaudeBot",
      "Claude-SearchBot",
      "Claude-User",
      "anthropic-ai",
      "Google-Extended",
      "Applebot",
      "Applebot-Extended",
      "meta-externalagent",
      "Amazonbot",
      "cohere-ai",
      "YouBot",
      "DuckAssistBot",
    ]) {
      expect(agents).toContain(bot);
    }
  });

  it("sets sitemap and host from SITE_CONFIG", () => {
    expect(result.sitemap).toBe(`${SITE_CONFIG.url}/sitemap.xml`);
    expect(result.host).toBe(SITE_CONFIG.url);
  });
});
