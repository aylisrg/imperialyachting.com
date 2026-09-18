import type { McpServer } from "@modelcontextprotocol/server";
import { registerImperialResources } from "./resources";
import { registerImperialPrompts } from "./prompts";
import {
  listYachts,
  listYachtsInputSchema,
  listYachtsOutputSchema,
  listYachtsMeta,
} from "./tools/list-yachts";
import {
  getYacht,
  getYachtInputSchema,
  getYachtOutputSchema,
  getYachtMeta,
} from "./tools/get-yacht";
import {
  listDestinations,
  listDestinationsInputSchema,
  listDestinationsOutputSchema,
  listDestinationsMeta,
} from "./tools/list-destinations";
import {
  listExtras,
  listExtrasInputSchema,
  listExtrasOutputSchema,
  listExtrasMeta,
} from "./tools/list-extras";
import {
  getBookingTerms,
  getBookingTermsInputSchema,
  getBookingTermsOutputSchema,
  getBookingTermsMeta,
} from "./tools/get-booking-terms";
import {
  checkAvailability,
  checkAvailabilityInputSchema,
  checkAvailabilityOutputSchema,
  checkAvailabilityMeta,
} from "./tools/check-availability";
import {
  createQuote,
  createQuoteInputSchema,
  createQuoteOutputSchema,
  createQuoteMeta,
} from "./tools/create-quote";
import {
  createCheckout,
  createCheckoutInputSchema,
  createCheckoutOutputSchema,
  createCheckoutMeta,
} from "./tools/create-checkout";
import {
  getBooking,
  getBookingInputSchema,
  getBookingOutputSchema,
  getBookingMeta,
} from "./tools/get-booking";

/**
 * Registers every tool, resource, and prompt Imperial Yachting's MCP server
 * exposes: read-only lookups plus the D2 write tools (`check_availability`,
 * `create_quote`, `create_checkout`, `get_booking`) built on top of
 * `src/lib/booking/{pricing-engine,availability,quotes,checkout,bookings-db,constants}.ts`.
 * Every tool follows the same pattern: a pure `(input) => Promise<{ structured, text }>`
 * function per tool file under `src/lib/mcp/tools/`, imported and wired up here.
 *
 * Per-request rate limiting (including a stricter limit for write tools) is
 * applied at the HTTP layer (`src/app/api/mcp/route.ts`), not here, because
 * `mcp-handler` v2 is stateless per request and the simplest, most reliable
 * place to reject an over-limit request is before the JSON-RPC body is ever
 * parsed.
 */
export function registerImperialServer(server: McpServer): void {
  server.registerTool(
    listYachtsMeta.name,
    {
      title: listYachtsMeta.title,
      description: listYachtsMeta.description,
      inputSchema: listYachtsInputSchema,
      outputSchema: listYachtsOutputSchema,
      annotations: listYachtsMeta.annotations,
    },
    async (input) => {
      const { structured, text } = await listYachts(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
      };
    }
  );

  server.registerTool(
    getYachtMeta.name,
    {
      title: getYachtMeta.title,
      description: getYachtMeta.description,
      inputSchema: getYachtInputSchema,
      outputSchema: getYachtOutputSchema,
      annotations: getYachtMeta.annotations,
    },
    async (input) => {
      const { structured, text } = await getYacht(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
        ...(structured.found ? {} : { isError: true }),
      };
    }
  );

  server.registerTool(
    listDestinationsMeta.name,
    {
      title: listDestinationsMeta.title,
      description: listDestinationsMeta.description,
      inputSchema: listDestinationsInputSchema,
      outputSchema: listDestinationsOutputSchema,
      annotations: listDestinationsMeta.annotations,
    },
    async (input) => {
      const { structured, text } = await listDestinations(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
      };
    }
  );

  server.registerTool(
    listExtrasMeta.name,
    {
      title: listExtrasMeta.title,
      description: listExtrasMeta.description,
      inputSchema: listExtrasInputSchema,
      outputSchema: listExtrasOutputSchema,
      annotations: listExtrasMeta.annotations,
    },
    async () => {
      const { structured, text } = await listExtras();
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
      };
    }
  );

  server.registerTool(
    getBookingTermsMeta.name,
    {
      title: getBookingTermsMeta.title,
      description: getBookingTermsMeta.description,
      inputSchema: getBookingTermsInputSchema,
      outputSchema: getBookingTermsOutputSchema,
      annotations: getBookingTermsMeta.annotations,
    },
    async () => {
      const { structured, text } = await getBookingTerms();
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
      };
    }
  );

  server.registerTool(
    checkAvailabilityMeta.name,
    {
      title: checkAvailabilityMeta.title,
      description: checkAvailabilityMeta.description,
      inputSchema: checkAvailabilityInputSchema,
      outputSchema: checkAvailabilityOutputSchema,
      annotations: checkAvailabilityMeta.annotations,
    },
    async (input) => {
      const { structured, text, isError } = await checkAvailability(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
        ...(isError ? { isError: true } : {}),
      };
    }
  );

  server.registerTool(
    createQuoteMeta.name,
    {
      title: createQuoteMeta.title,
      description: createQuoteMeta.description,
      inputSchema: createQuoteInputSchema,
      outputSchema: createQuoteOutputSchema,
      annotations: createQuoteMeta.annotations,
    },
    async (input) => {
      const { structured, text, isError } = await createQuote(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
        ...(isError ? { isError: true } : {}),
      };
    }
  );

  server.registerTool(
    createCheckoutMeta.name,
    {
      title: createCheckoutMeta.title,
      description: createCheckoutMeta.description,
      inputSchema: createCheckoutInputSchema,
      outputSchema: createCheckoutOutputSchema,
      annotations: createCheckoutMeta.annotations,
    },
    async (input) => {
      const { structured, text, isError } = await createCheckout(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
        ...(isError ? { isError: true } : {}),
      };
    }
  );

  server.registerTool(
    getBookingMeta.name,
    {
      title: getBookingMeta.title,
      description: getBookingMeta.description,
      inputSchema: getBookingInputSchema,
      outputSchema: getBookingOutputSchema,
      annotations: getBookingMeta.annotations,
    },
    async (input) => {
      const { structured, text, isError } = await getBooking(input);
      return {
        content: [{ type: "text", text }],
        structuredContent: structured,
        ...(isError ? { isError: true } : {}),
      };
    }
  );

  registerImperialResources(server);
  registerImperialPrompts(server);
}
