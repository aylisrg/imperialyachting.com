/**
 * Get the lowest price for display, prioritizing hourly rates.
 * If hourly rates exist, returns the smallest hourly rate.
 * Otherwise falls back to the smallest rate across all tiers.
 */
export function getLowestPrice(
  pricing: { hourly: number | null; daily: number | null; weekly: number | null; monthly: number | null }[]
): { amount: number; unit: string } | null {
  // Prioritize hourly pricing — show the smallest hourly rate if available
  let hourlyResult: { amount: number; unit: string } | null = null;
  for (const season of pricing) {
    if (season.hourly !== null && (hourlyResult === null || season.hourly < hourlyResult.amount)) {
      hourlyResult = { amount: season.hourly, unit: "/hr" };
    }
  }
  if (hourlyResult) return hourlyResult;

  // Fallback: smallest price across remaining tiers
  let result: { amount: number; unit: string } | null = null;
  for (const season of pricing) {
    const tiers: [number | null, string][] = [
      [season.daily, "/day"],
      [season.weekly, "/week"],
      [season.monthly, "/month"],
    ];
    for (const [price, unit] of tiers) {
      if (price !== null && (result === null || price < result.amount)) {
        result = { amount: price, unit };
      }
    }
  }
  return result;
}

/**
 * Get the hourly rate for a yacht (lowest across seasons).
 * Returns null if no hourly pricing exists.
 */
export function getHourlyRate(
  pricing: { hourly: number | null }[]
): number | null {
  let lowest: number | null = null;
  for (const season of pricing) {
    if (season.hourly !== null && (lowest === null || season.hourly < lowest)) {
      lowest = season.hourly;
    }
  }
  return lowest;
}
