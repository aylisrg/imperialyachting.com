import Stripe from "stripe";

/**
 * Stripe client singleton for booking checkout.
 *
 * `STRIPE_SECRET_KEY` is the only required env var. The API version is
 * intentionally left unset so the SDK's own pinned default is used
 * (avoids drifting out of sync with the installed `stripe` package).
 */

let stripeInstance: Stripe | null = null;

/** True when `STRIPE_SECRET_KEY` is present, i.e. checkout can be attempted. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Returns a lazily-created, memoized Stripe client.
 * Throws a clear error if `STRIPE_SECRET_KEY` is not set — callers that
 * want a graceful degradation path should check `isStripeConfigured()`
 * first.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout."
    );
  }

  stripeInstance = new Stripe(key);
  return stripeInstance;
}

/** Clears the memoized client. Intended for tests only. */
export function __resetStripeForTests(): void {
  stripeInstance = null;
}
