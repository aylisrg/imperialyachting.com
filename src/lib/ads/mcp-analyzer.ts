import Anthropic from "@anthropic-ai/sdk";
import type { AdsAnalysisInput, AdsAnalysisOutput } from "./types";

/** Meta-hosted remote MCP server for Ads. */
export const META_ADS_MCP_URL = "https://mcp.facebook.com/ads";

const MCP_SERVER_NAME = "meta-ads";
const MCP_BETA = "mcp-client-2025-11-20";

/**
 * The MCP connector runs the tool loop on Anthropic's side and pauses after a
 * fixed number of iterations. Each pause is resumed by replaying the turn.
 */
const MAX_CONTINUATIONS = 6;

const SYSTEM_PROMPT = `You are a senior Meta Ads media buyer running paid social for imperialyachting.com — a luxury yacht charter and yacht management company based at Dubai Harbour, UAE.

You have live access to the Meta Ads MCP server. Use it to pull real data before you conclude anything. Never invent a number: every metric you report must come from a tool result.

Business context:
- Ticket size is high (a charter runs from several hundred to several thousand USD), volume is low. A single booking pays for weeks of ad spend, so cost per result matters far more than CTR.
- Target audience: high-net-worth individuals and tourists in Dubai, corporate and event planners, wedding/birthday charter enquiries.
- The real conversion happens OFF Meta: visitors land on the site and then message on WhatsApp. Meta will under-report conversions. Treat link clicks and landing-page views as the on-platform proxy, and weigh the site-side signals you are given.
- Audience is international and English-speaking. Season matters: Dubai charter demand peaks roughly October–April.

How to work the account:
1. Call ads_get_ad_entities for the analysed period AND for the baseline period, at ad level, so you can compare like for like.
2. Call ads_insights_performance_trend to see the direction of CPC, CPM, CTR and cost per result.
3. Call ads_insights_anomaly_signal to catch sudden breaks in delivery.
4. Call ads_get_opportunity_score for Meta's own optimization score and its recommendations.
5. Call ads_insights_auction_ranking_benchmarks and ads_insights_industry_benchmark to judge whether weak numbers are our creative or the whole auction.
6. If a tool is unavailable or returns an error, say so in the summary and continue with what you do have.

Judgement rules for a low-volume, high-ticket account:
- Do not declare a winner or a loser on thin data. Under ~1000 impressions or under ~50 link clicks for an ad, the honest verdict is "watch", not "pause" or "scale".
- Frequency above ~3 with falling CTR means creative fatigue, not bad targeting.
- A rising CPM with stable CTR is auction pressure, not our problem to fix with creative.
- Prefer few, decisive actions over a long list. Budget changes should be incremental (±20–30%), not doubling.
- If conversion tracking is clearly missing or ads are untagged with UTMs, that is a high-priority finding on its own: without it every other conclusion is guesswork.

You MUST respond with a single valid JSON object matching the requested schema. No markdown fences, no prose outside the JSON.`;

function buildUserPrompt(input: AdsAnalysisInput): string {
  const siteSignals = input.site_signals
    ? JSON.stringify(input.site_signals, null, 2)
    : "Not available for this run.";

  return `Analyse Meta ad account ${input.ad_account_id} for ${input.period_start}${
    input.period_end !== input.period_start ? ` — ${input.period_end}` : ""
  }, comparing against the baseline window ${input.baseline_start} — ${input.baseline_end}.

Business: ${input.business_context.name} — ${input.business_context.type}
Reporting currency: ${input.business_context.currency}
Off-platform conversion actions: ${input.business_context.conversion_actions.join(", ")}
Landing pages in use: ${input.business_context.landing_pages.join(", ")}

Site-side signals for the same period (Google Analytics — this is where real enquiries show up):
\`\`\`json
${siteSignals}
\`\`\`

Pull the data from the Meta Ads MCP tools, then respond with exactly this JSON shape:
{
  "summary": "3-5 sentences: what happened yesterday, what it cost, and the single most important thing to do next",
  "account_metrics": {
    "spend": number, "impressions": number, "reach": number, "frequency": number,
    "clicks": number, "ctr": number, "cpc": number, "cpm": number,
    "results": number, "cost_per_result": number | null
  },
  "trends": {
    "spend": { "value": number, "previous_value": number, "change_percent": number, "direction": "up"|"down"|"flat" },
    "impressions": { ... }, "clicks": { ... }, "ctr": { ... }, "cpc": { ... }, "cpm": { ... },
    "results": { ... }, "cost_per_result": { ... }
  },
  "entities": [
    {
      "level": "campaign"|"adset"|"ad",
      "id": "string", "name": "string", "status": "string",
      "metrics": { same shape as account_metrics },
      "verdict": "scale"|"keep"|"watch"|"fix"|"pause",
      "reasoning": "one or two sentences tied to the numbers"
    }
  ],
  "opportunity_score": number | null,
  "anomalies": [
    { "entity_name": "string", "metric": "string", "description": "string", "severity": "high"|"medium"|"low" }
  ],
  "benchmarks": [
    { "metric": "string", "our_value": number, "benchmark_value": number, "verdict": "above"|"at"|"below" }
  ],
  "recommendations": [
    {
      "title": "Short imperative title",
      "entity_level": "account"|"campaign"|"adset"|"ad",
      "entity_id": "string" | null,
      "entity_name": "string" | null,
      "problem": "What the data shows",
      "action": "The specific change to make, with numbers",
      "expected_impact": "What should move and roughly by how much",
      "priority": "high"|"medium"|"low",
      "action_type": "budget"|"creative"|"targeting"|"bidding"|"landing_page"|"tracking"|"structure"
    }
  ]
}

Percentages (ctr, change_percent) are numbers like 1.8 meaning 1.8%, not 0.018. Use ${input.business_context.currency} for money. Include every active ad in "entities". Give 2-5 recommendations, ordered with the highest priority first. All text in English.`;
}

/**
 * Runs the daily analysis with Claude driving Meta's Ads MCP server.
 *
 * The Meta token needs ads_read, ads_management and ads_mcp_management; the
 * MCP endpoint takes it as a bearer token, so no per-run OAuth is needed.
 */
export async function analyzeAdsWithClaude(
  input: AdsAnalysisInput,
): Promise<AdsAnalysisOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const metaToken = process.env.META_ADS_ACCESS_TOKEN;
  if (!metaToken) throw new Error("META_ADS_ACCESS_TOKEN is not set");

  const client = new Anthropic({ apiKey });

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: buildUserPrompt(input) },
  ];

  const request = (
    turns: Anthropic.Beta.BetaMessageParam[],
  ): Anthropic.Beta.MessageCreateParamsNonStreaming => ({
    model: "claude-opus-5",
    max_tokens: 16000,
    betas: [MCP_BETA],
    system: SYSTEM_PROMPT,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    mcp_servers: [
      {
        type: "url",
        url: META_ADS_MCP_URL,
        name: MCP_SERVER_NAME,
        authorization_token: metaToken,
      },
    ],
    tools: [{ type: "mcp_toolset", mcp_server_name: MCP_SERVER_NAME }],
    messages: turns,
  });

  let response = await client.beta.messages.create(request(messages));

  // The server-side tool loop pauses every 10 iterations; replaying the turn
  // resumes it. Never add a "continue" message — the API detects the trailing
  // tool-use block on its own.
  let continuations = 0;
  while (response.stop_reason === "pause_turn" && continuations < MAX_CONTINUATIONS) {
    messages.push({ role: "assistant", content: response.content });
    response = await client.beta.messages.create(request(messages));
    continuations += 1;
  }

  if (response.stop_reason === "pause_turn") {
    throw new Error(
      `Analysis did not finish within ${MAX_CONTINUATIONS} continuations`,
    );
  }

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to complete the ads analysis");
  }

  return parseAnalysisOutput(response.content);
}

/**
 * Pulls the JSON report out of the final assistant turn.
 *
 * The MCP loop leaves tool-use blocks interleaved with the text, and the model
 * may narrate before it answers, so the report is taken from the last text
 * block and, failing that, from the outermost JSON object in it.
 */
export function parseAnalysisOutput(
  content: Anthropic.Beta.BetaContentBlock[],
): AdsAnalysisOutput {
  const textBlocks = content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text.trim())
    .filter((text) => text.length > 0);

  if (textBlocks.length === 0) throw new Error("No text response from Claude");

  const candidate = stripCodeFence(textBlocks[textBlocks.length - 1]);

  try {
    return JSON.parse(candidate) as AdsAnalysisOutput;
  } catch {
    return JSON.parse(extractJsonObject(candidate)) as AdsAnalysisOutput;
  }
}

/** Narrows text to the outermost `{...}` so a stray preamble cannot break parsing. */
export function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in Claude response");
  }
  return text.slice(start, end + 1);
}

export function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
}
