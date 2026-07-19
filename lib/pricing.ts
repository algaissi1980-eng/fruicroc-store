// =============================================
// Pricing engine — EUR + per-country VAT
// NOTE: price display strategy (single gross price
// vs. destination-based) still pending client
// decision. Totals below are destination-based.
// =============================================

import type { CartItem, ShippingZone, VatRate, VatCategory, CountryCode } from "../types";

export interface OrderTotals {
  subtotalExclVat: number;
  discount: number;
  vatAmount: number;
  vatRatePercent: number; // dominant rate applied (food)
  shipping: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function getVatRate(
  rates: VatRate[],
  country: CountryCode,
  category: VatCategory
): number {
  const exact = rates.find(
    (r) => r.country_code === country && r.category === category
  );
  if (exact) return exact.rate_percent;
  const standard = rates.find(
    (r) => r.country_code === country && r.category === "standard"
  );
  return standard?.rate_percent ?? 0;
}

export function getShippingCost(
  zones: ShippingZone[],
  country: CountryCode,
  subtotalExclVat: number
): number {
  const zone = zones.find((z) => z.country_code === country && z.active);
  if (!zone) return 0;
  if (
    zone.free_shipping_threshold_eur != null &&
    subtotalExclVat >= zone.free_shipping_threshold_eur
  ) {
    return 0;
  }
  return zone.rate_eur;
}

export function computeTotals(
  items: CartItem[],
  zones: ShippingZone[],
  rates: VatRate[],
  country: CountryCode,
  discountPercent = 0
): OrderTotals {
  const subtotalExclVat = round2(
    items.reduce((sum, i) => sum + i.price_excl_vat * i.quantity, 0)
  );

  // Promo discount applied on the net subtotal, before VAT
  const discount = round2(subtotalExclVat * (discountPercent / 100));
  const discountFactor =
    subtotalExclVat > 0 ? (subtotalExclVat - discount) / subtotalExclVat : 1;

  // VAT per item category (freeze-dried fruit → usually reduced "food" rate)
  let vatAmount = 0;
  for (const item of items) {
    const rate = getVatRate(rates, country, item.vat_category);
    vatAmount +=
      item.price_excl_vat * item.quantity * discountFactor * (rate / 100);
  }
  vatAmount = round2(vatAmount);

  const shipping = getShippingCost(zones, country, subtotalExclVat - discount);
  const vatRatePercent = getVatRate(rates, country, "food");

  return {
    subtotalExclVat,
    discount,
    vatAmount,
    vatRatePercent,
    shipping,
    total: round2(subtotalExclVat - discount + vatAmount + shipping),
  };
}

// Design price format: EN "€7.00" · FR "7,00 €" · AR "€7.00" (Latin digits)
export { formatPrice as formatEur } from "./weights";
