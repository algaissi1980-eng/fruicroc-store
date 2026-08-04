// =============================================
// Brand-wide weight-tier pricing (design handoff §Commerce Logic)
// Same tiers for every product. EUR.
// NOTE: whether these are VAT-inclusive is still pending the client's
// price-display decision — treated as the checkout base price for now.
// =============================================

export const WEIGHT_TIERS = [30, 50, 70, 100] as const;
export type WeightG = (typeof WEIGHT_TIERS)[number];

// Prices are VAT-INCLUSIVE (TTC), identical in all countries
// (client decision 2026-07-19). VAT is extracted, never added on top.
export const TIER_PRICES: Record<WeightG, number> = {
  30: 4.5,
  50: 7.0,
  70: 9.5,
  100: 14.5,
};

export const FROM_PRICE = TIER_PRICES[30];

export function tierPrice(weightG: WeightG): number {
  return TIER_PRICES[weightG];
}

/**
 * Locale price formatting per design:
 * EN "€7.00" · FR "7,00 €" · AR "€7.00" (Latin digits)
 */
export function formatPrice(value: number, locale: string): string {
  if (locale === "fr") return value.toFixed(2).replace(".", ",") + " €";
  return "€" + value.toFixed(2);
}
