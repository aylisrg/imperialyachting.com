import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisInput, AnalysisOutput } from "./types";

const SYSTEM_PROMPT = `You are a senior CRO (Conversion Rate Optimization) analyst for imperialyachting.com — a luxury yacht charter and management company based in Dubai.

Your role is to analyze weekly Google Analytics data and produce actionable insights to increase conversion rate (clicks on WhatsApp, phone, email, contact form submissions).

Key context about the business:
- Target audience: high-net-worth individuals, tourists in Dubai, corporate event planners
- Primary conversion: WhatsApp message (click_whatsapp event)
- Secondary conversions: contact form submission (submit_inquiry), phone call (click_phone), email (click_email)
- Fleet pages and destination pages are key consideration pages
- The website is in English, audience is international
- Location: Dubai Harbour, UAE

When analyzing data, focus on:
1. Conversion funnel: landing → consideration (fleet/destination pages) → action (WhatsApp/contact)
2. Device performance: mobile vs desktop conversion rates
3. Traffic source quality: which channels bring converting visitors
4. Page-level issues: high bounce rate pages, low engagement pages
5. Event patterns: which CTAs get clicked, which are ignored

You MUST respond with valid JSON matching the AnalysisOutput schema. No markdown, no explanations outside the JSON.`;

const USER_PROMPT_TEMPLATE = `Analyze the following weekly Google Analytics data for imperialyachting.com.

Current week data:
\`\`\`json
{{CURRENT_WEEK}}
\`\`\`

{{PREVIOUS_WEEK_SECTION}}

Respond with a JSON object containing:
{
  "summary": "3-5 sentence executive summary of the week's performance",
  "trends": {
    "sessions": { "value": number, "previous_value": number, "change_percent": number, "direction": "up"|"down"|"flat" },
    "users": { ... },
    "bounce_rate": { ... },
    "whatsapp_clicks": { ... },
    "contact_clicks": { ... },
    "yacht_clicks": { ... },
    "phone_clicks": { ... }
  },
  "hypotheses": [
    {
      "title": "Short title",
      "problem": "What issue was identified",
      "solution": "Specific actionable recommendation",
      "expected_impact": "Expected outcome with rough estimate",
      "priority": "high"|"medium"|"low",
      "category": "ux"|"content"|"technical"|"marketing"
    }
  ],
  "quick_wins": [
    { "title": "Quick win title", "description": "What to do", "effort": "low"|"medium" }
  ],
  "page_insights": [
    { "page": "/path", "views": number, "bounce_rate": number, "avg_duration": number, "insight": "What this means" }
  ],
  "traffic_analysis": {
    "summary": "Overview of traffic sources and their quality",
    "top_sources": [
      { "source": "google", "medium": "organic", "sessions": number, "conversion_rate": number }
    ]
  }
}

Generate 3-5 hypotheses, 1-3 quick wins, and insights for the top 5 pages. All text should be in English.`;

export async function analyzeWithClaude(
  input: AnalysisInput,
): Promise<AnalysisOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  const previousSection = input.previous_week
    ? `Previous week data (for comparison):\n\`\`\`json\n${JSON.stringify(input.previous_week, null, 2)}\n\`\`\``
    : "No previous week data available (this is the first report).";

  const userPrompt = USER_PROMPT_TEMPLATE
    .replace("{{CURRENT_WEEK}}", JSON.stringify(input.current_week, null, 2))
    .replace("{{PREVIOUS_WEEK_SECTION}}", previousSection);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      { role: "user", content: userPrompt },
    ],
    system: SYSTEM_PROMPT,
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonStr) as AnalysisOutput;
}
