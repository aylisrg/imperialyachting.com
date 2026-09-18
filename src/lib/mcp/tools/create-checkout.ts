import { z } from "zod";
import { createCheckout as createCheckoutDomain } from "@/lib/booking/checkout";
import { DUBAI_TZ } from "@/lib/booking/constants";
import type { ToolAnnotations, ToolMeta } from "./types";

export const createCheckoutInputSchema = z.object({
  quoteId: z.string().uuid().describe("The `quoteId` returned by `create_quote`."),
  customer: z.object({
    name: z.string().min(2).max(100).describe("Customer's full name (2-100 characters)."),
    email: z.string().email().describe("Customer's email address, for the receipt and confirmation."),
    phone: z.string().optional().describe("Customer's phone number, optional but recommended."),
  }),
  customerConsent: z
    .boolean()
    .describe(
      "Must be `true`. Set this only after you have shown the customer the quoted total and explicitly " +
        "confirmed they agree to pay a 50% non-refundable deposit now to hold the booking. Never set this to " +
        "true on the customer's behalf without that confirmation."
    ),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;

export const createCheckoutOutputSchema = z.object({
  ok: z.boolean(),
  bookingId: z.string().optional(),
  checkoutUrl: z.string().optional(),
  expiresAt: z.string().optional(),
  depositAmount: z.number().optional(),
  currency: z.string().optional(),
  instructions: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});
export type CreateCheckoutOutput = z.infer<typeof createCheckoutOutputSchema>;

export const createCheckoutAnnotations: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

export const createCheckoutMeta: ToolMeta = {
  name: "create_checkout",
  title: "Create Deposit Checkout",
  description:
    "Turn a `create_quote` result into a Stripe Checkout link for the 50% deposit, holding the slot for 30 minutes. " +
    "Input: `quoteId` (from `create_quote`), `customer` (`name`, `email`, optional `phone`), and `customerConsent` " +
    "(must be `true` — set it only after the customer has explicitly agreed, in this conversation, to the quoted " +
    "amount and the 50% non-refundable deposit). " +
    "Idempotent: calling this again with the same `quoteId` while the hold is still active returns the same " +
    "checkout link rather than creating a new one. " +
    "On success returns `checkoutUrl` to show the customer, `expiresAt` (Dubai time — the hold's deadline), " +
    "and `depositAmount`/`currency`; verify payment afterwards with `get_booking`. " +
    "On failure returns `isError` with a `code` (e.g. \"expired\" — the quote/hold lapsed, request a new quote; " +
    "\"already_paid\"; \"unavailable\" — the slot was taken meanwhile, request a new quote) and a `message`. " +
    "Never call this without the customer's explicit confirmation of the quote.",
  annotations: createCheckoutAnnotations,
};

const CONSENT_REQUIRED_MESSAGE =
  "customerConsent must be true. Before calling create_checkout, show the customer the quoted total and the " +
  "50% non-refundable deposit terms, and get their explicit agreement.";

/**
 * Creates (or returns an existing) Stripe deposit checkout session for a
 * quote. Pure function — no MCP transport dependency. Gates on
 * `customerConsent` before touching the domain layer at all.
 */
export async function createCheckout(
  input: CreateCheckoutInput
): Promise<{ structured: CreateCheckoutOutput; text: string; isError?: boolean }> {
  if (input.customerConsent !== true) {
    return {
      structured: { ok: false, code: "consent_required", message: CONSENT_REQUIRED_MESSAGE },
      text: CONSENT_REQUIRED_MESSAGE,
      isError: true,
    };
  }

  const result = await createCheckoutDomain({
    quoteId: input.quoteId,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
  });

  if (!result.ok) {
    return {
      structured: { ok: false, code: result.code, message: result.message },
      text: result.message,
      isError: true,
    };
  }

  const expiresAtDubai = new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(result.expiresAt));

  const instructions =
    `Show the customer this secure Stripe link to pay the 50% deposit. The hold expires at ${expiresAtDubai} ` +
    `(Dubai time). After payment they receive a confirmation email; you can verify with get_booking.`;

  const structured: CreateCheckoutOutput = {
    ok: true,
    bookingId: result.bookingId,
    checkoutUrl: result.checkoutUrl,
    expiresAt: result.expiresAt,
    depositAmount: result.depositAmount,
    currency: result.currency,
    instructions,
  };

  return { structured, text: instructions };
}
