import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

export const planCharterArgsSchema = z.object({
  guests: z
    .string()
    .optional()
    .describe("Approximate number of guests, as a string (e.g. \"8\")."),
  date: z
    .string()
    .optional()
    .describe("Preferred charter date, if known (e.g. \"2026-10-12\")."),
  occasion: z
    .string()
    .optional()
    .describe("The occasion, if any (e.g. birthday, corporate event, sunset cruise)."),
});

function buildPlanCharterPrompt(args: {
  guests?: string;
  date?: string;
  occasion?: string;
}): string {
  const details: string[] = [];
  if (args.guests) details.push(`- Party size: ${args.guests} guests`);
  if (args.date) details.push(`- Preferred date: ${args.date}`);
  if (args.occasion) details.push(`- Occasion: ${args.occasion}`);

  return [
    "Help me plan an Imperial Yachting charter in Dubai.",
    details.length > 0 ? `\nWhat I know so far:\n${details.join("\n")}` : "",
    "",
    "Please follow this process:",
    "1. Call `list_yachts` (filtered by guest count if I gave you one) to shortlist candidate yachts.",
    "2. Call `get_yacht` for the top 2 shortlisted yachts to get full pricing, specs, and amenities.",
    "3. If I haven't given you a date, time, and number of hours yet, ask me for them before going further.",
    "4. Once a date/time/hours is confirmed, call `check_availability` for the chosen yacht (when that tool is available) to confirm the slot is free.",
    "5. Ask if I want any extras (call `list_extras` to show options), then call `create_quote` with the yacht, hours, and any selected extras.",
    "6. Present the quote clearly — base price, extras, bonus hours if applicable, and total — then call `create_checkout` and share the deposit checkout link so I can confirm the booking.",
    "",
    "Use `get_booking_terms` if you need the deposit rate, minimum hours, or cancellation policy at any point.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Registers the `plan_charter` prompt, which walks a client through the
 * full charter-planning flow: shortlist -> detail -> availability ->
 * quote -> checkout. `check_availability`, `create_quote`, and
 * `create_checkout` are write tools added in a later task (D2); the prompt
 * references them by name so the assistant knows to use them once
 * available, and degrades gracefully (skips ahead to presenting yacht
 * options and terms) if they aren't registered yet.
 */
export function registerImperialPrompts(server: McpServer): void {
  server.registerPrompt(
    "plan_charter",
    {
      title: "Plan a Charter",
      description:
        "Walks through planning an Imperial Yachting charter: shortlist yachts, confirm details, check availability, quote, and checkout.",
      argsSchema: planCharterArgsSchema,
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: buildPlanCharterPrompt(args),
          },
        },
      ],
    })
  );
}
