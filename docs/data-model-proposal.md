# Data Model Proposal — Fruicroc

> Generic proposal. Field names and storage layer will be mapped onto Candy-hon's
> existing schema once the project is attached. Nothing here is implemented yet.

## 1. Multilingual content (fr / en / ar)

Every user-facing text field becomes a per-locale object:

```ts
type LocalizedString = { fr: string; en: string; ar: string }; // fr = required base

Product {
  id: string
  slug: LocalizedString        // per-locale slugs for SEO (/fr/produits/fraise, /en/products/strawberry, /ar/...)
  name: LocalizedString
  description: LocalizedString
  ingredients: LocalizedString
  priceExclVat: number         // EUR, net price (see VAT section)
  vatCategory: 'food' | 'standard'
  images: Image[]
  stock: number
  active: boolean
}
```

Same pattern for categories, legal pages, and any CMS-like content.
Admin: tabbed fr/en/ar inputs per field; fr required, en/ar optional with
fallback to fr on the storefront.

## 2. Shipping zones

```ts
ShippingZone {
  countryCode: 'FR'|'DE'|'IT'|'ES'|'NL'|'BE'|'PL'|'PT'|'LU'|'AT'
  rateEur: number
  freeShippingThresholdEur?: number   // optional, per country
  active: boolean
}
```

Checkout only allows shipping countries with an active zone.
Fully editable from admin.

## 3. VAT

```ts
VatRate {
  countryCode: string
  category: 'food' | 'standard'
  ratePercent: number          // e.g. FR food = 5.5, DE food = 7
}
```

Notes:
- Freeze-dried fruit is foodstuff → most EU countries apply a **reduced** rate,
  and rates differ per country (EU OSS destination-based VAT). Hence the
  `category` field instead of a single rate per country.
- VAT is resolved at checkout from the shipping country + product category.
- **Open decision (client-facing, see question below):** whether displayed
  prices are a single VAT-inclusive price for all countries (totals absorb the
  VAT difference) or net price + destination VAT (displayed price varies by
  country).

## 4. Orders & bank transfer

```ts
Order {
  ...existing Candy-hon fields...
  currency: 'EUR'
  shippingCountry: string
  shippingCostEur: number
  vatRatePercent: number       // snapshot at order time
  vatAmountEur: number
  paymentMethod: 'paypal' | 'bank_transfer'
  paymentStatus: 'pending_payment' | 'paid' | 'failed' | 'refunded'
  paypalOrderId?: string
  bankTransferReference?: string   // shown to customer with IBAN instructions
  paidAt?: Date
  paidMarkedBy?: string            // admin user who confirmed the transfer
}
```

Flow (bank transfer): order created as `pending_payment` → confirmation page +
email show IBAN + unique `bankTransferReference` → admin marks `paid` from
dashboard → fulfillment proceeds. Optional: auto-cancel after N days unpaid
(configurable).

## 5. Admin additions

- Shipping zones CRUD (rates, thresholds, active toggle)
- VAT rates CRUD per country/category
- Order list filter: `pending_payment` + one-click "Mark as paid"
- Product editor with fr/en/ar tabs

## Open questions for the client (blocking pricing engine)

1. **Price display strategy** — one VAT-inclusive price everywhere vs.
   destination-based totals (see §3).
2. Bank details for transfer instructions (IBAN, BIC, account holder).
3. Auto-cancel window for unpaid bank-transfer orders?
