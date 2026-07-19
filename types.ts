// =============================================
// Central Type Definitions — Fruicroc
// =============================================

import type { Locale } from "./i18n/routing";

// Localized text: fr is the base locale and always required
export interface LocalizedString {
  fr: string;
  en?: string;
  ar?: string;
}

/** Resolve a localized field with fallback to fr */
export function localized(
  value: LocalizedString | null | undefined,
  locale: Locale
): string {
  if (!value) return "";
  return value[locale] || value.fr || "";
}

// 🟢 Product
export interface Product {
  id: string;
  slug: LocalizedString;
  name: LocalizedString;
  description: LocalizedString;
  ingredients?: LocalizedString | null;
  price_excl_vat: number; // EUR, net
  original_price_excl_vat?: number | null;
  vat_category: VatCategory;
  image_url?: string | null;
  images?: string[];
  is_available: boolean;
  category: string;
  stock: number;
  created_at: string;
}

export type VatCategory = "food" | "standard";

// 🟢 Shipping
export type CountryCode =
  | "FR" | "DE" | "IT" | "ES" | "NL"
  | "BE" | "PL" | "PT" | "LU" | "AT";

export interface ShippingZone {
  country_code: CountryCode;
  rate_eur: number;
  free_shipping_threshold_eur?: number | null;
  active: boolean;
}

// 🟢 VAT
export interface VatRate {
  id?: string;
  country_code: CountryCode;
  category: VatCategory;
  rate_percent: number;
}

// 🟢 Order
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentMethod = "paypal" | "bank_transfer";

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: CountryCode;
  shipping_cost_eur: number;
  subtotal_excl_vat_eur: number;
  vat_rate_percent: number;
  vat_amount_eur: number;
  total_eur: number;
  currency: "EUR";
  status: OrderStatus;
  payment_method: PaymentMethod;
  promo_code?: string | null;
  discount_eur?: number | null;
  paypal_order_id?: string | null;
  bank_transfer_reference?: string | null;
  paid_at?: string | null;
  paid_marked_by?: string | null;
  notes?: string | null;
  created_at: string;
  order_items: OrderItem[];
}

// 🟢 Order Item
export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_excl_vat: number; // snapshot at order time
  products?: { name: LocalizedString; image_url?: string };
}

// 🟢 Cart Item — weight-tier based (brand-wide tier map, see lib/weights.ts)
export interface CartItem {
  id: string; // product id
  cartItemId: string; // `${productId}-${weightG}`
  name: LocalizedString;
  weightG: 30 | 50 | 70 | 100;
  price_excl_vat: number; // tier price snapshot
  vat_category: VatCategory;
  quantity: number;
  image_url?: string;
  stock?: number;
}

// 🟢 Cart Store
export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  toggleCart: () => void;
  addToCart: (
    product: Product,
    weightG: 30 | 50 | 70 | 100,
    quantity: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

// 🟢 Store Settings
export interface StoreSettings {
  id: number;
  categories: string[];
  announcement: LocalizedString | null;
  bank_account_holder?: string | null;
  bank_iban?: string | null;
  bank_bic?: string | null;
}
