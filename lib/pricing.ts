// =============================================
// Pricing engine — EUR, prices are VAT-INCLUSIVE (TTC)
// Client decision (2026-07-19): one gross price for every country.
// VAT is EXTRACTED from the gross amount for invoicing ("dont TVA"),
// never added on top. Rate still depends on the destination country.
// =============================================

import type { CartItem, ShippingZone, VatRate, VatCategory, CountryCode } from "../types";

export interface OrderTotals {
  subtotal: number; // gross (VAT included), before discount
  discount: number;
  vatIncluded: number; // informational — VAT contained in the total
  vatRatePercent: number; // dominant rate applied (food)
  shipping: number; // gross
  total: number; // what the customer pays
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
  grossSubtotal: number
): number {
  const zone = zones.find((z) => z.country_code === country && z.active);
  if (!zone) return 0;
  if (
    zone.free_shipping_threshold_eur != null &&
    grossSubtotal >= zone.free_shipping_threshold_eur
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
  // Gross subtotal — tier prices are TTC
  const subtotal = round2(
    items.reduce((sum, i) => sum + i.unit_price_eur * i.quantity, 0)
  );

  const discount = round2(subtotal * (discountPercent / 100));
  const discountFactor = subtotal > 0 ? (subtotal - discount) / subtotal : 1;

  // VAT contained in the discounted gross amount: gross × r / (100 + r)
  let vatIncluded = 0;
  for (const item of items) {
    const rate = getVatRate(rates, country, item.vat_category);
    const grossShare = item.unit_price_eur * item.quantity * discountFactor;
    vatIncluded += grossShare * (rate / (100 + rate));
  }
  vatIncluded = round2(vatIncluded);

  const shipping = getShippingCost(zones, country, subtotal - discount);
  const vatRatePercent = getVatRate(rates, country, "food");

  return {
    subtotal,
    discount,
    vatIncluded,
    vatRatePercent,
    shipping,
    // VAT is already inside the prices — nothing added
    total: round2(subtotal - discount + shipping),
  };
}

// Design price format: EN "€7.00" · FR "7,00 €" · AR "€7.00" (Latin digits)
export { formatPrice as formatEur } from "./weights";
