# Candy-hon Structural Audit — Reuse vs. Rebuild

Source: `candy-hon-store` (read-only reference).
Stack found: Next.js 16 (App Router) · React 19 · Tailwind 4 · Supabase (DB + Auth + RLS + Realtime) · Zustand · sonner · framer-motion.

## Reuse as-is (architecture & patterns)

| Area | What we keep |
|---|---|
| Stack | Next.js App Router, Supabase SSR (`lib/supabase/client.ts` / `server.ts`), Tailwind 4, Zustand cart store, sonner toasts |
| Folder layout | `app/` routes, `components/`, `components/admin/`, `lib/`, `store/`, `types.ts` |
| Auth | Supabase auth + `admins` table + `is_admin()` RPC + RLS policy pattern |
| Admin dashboard | Tabbed pattern (`AdminProductsTab`, `AdminOrdersTab`, `AdminOffersTab`, `AdminPromoTab`, `AdminSettingsTab`, `AdminStatsTab`, `AdminAdminsTab`, `BottomSheet`) — extend with new tabs |
| Order flow | Checkout → `handle_checkout_inventory` RPC (atomic stock decrement) → order + order_items |
| Promo codes | `validate_promo_code` / `use_promo_code` RPCs + admin tab |
| Images | `compressImage.ts` / `optimizeImage.ts` upload pipeline |
| Analytics | `PageTracker` + `page_views` + stats tab |
| Realtime | `RealtimeSync` component |
| Page set | Home, product modal/gallery, checkout, orders, success, login, admin, error/loading/not-found |

## Rebuild / replace

| Area | Candy-hon today | Fruicroc |
|---|---|---|
| i18n | `languageStore.ts` (Zustand ar/en toggle, strings inlined in components as `lang === 'ar' ? … : …`) | **next-intl**, 3 locales, routing `/fr` (default) `/en` `/ar`, message files, `dir` switching + logical CSS props. Biggest refactor: extract all inline strings |
| Shipping | `lib/deliveryAreas.ts` — hardcoded Jordan zones, JOD | `shipping_zones` DB table (10 EU countries, EUR, admin CRUD) |
| Payments | COD + Cliq (label stuffed into order notes) | PayPal JS SDK + bank transfer (proper `payment_method` / `payment_status` columns — see data-model-proposal.md) |
| Pricing | Flat price, no tax | EUR + per-country VAT engine (`vat_rates` table) |
| Products schema | `name` + `name_ar`/`name_en` partial | Full fr/en/ar for name/description/slug (fr = base) |
| Order statuses | `confirmed → processing → completed` | Add `pending_payment`, `paid`, `cancelled` (bank transfer flow) |
| Currency | JOD | EUR |

## New (no Candy-hon equivalent)

- About Us page (content ready in `content/about/`)
- Legal pages: Mentions légales, CGV, Politique de confidentialité, Rétractation 14 jours
- GDPR cookie consent banner
- Admin tabs: Shipping zones, VAT rates, bank-transfer confirmation ("Mark as paid")

## Not carried over

- Visual design/branding/colors (per project rules — waiting on Claude Design)
- `scripts/` vatrin scraper + `puppeteer`/`cheerio` deps (Candy-hon-specific imports)
- Jordan seed data, Arabic-only category defaults in `store_settings`

## Decisions (confirmed with Mo — 2026-07-17)

1. Telegram order notifications: **not in v1** — can be added later (keep `app/api/telegram/route.ts` out of the initial port).
2. Promo codes + offers: **keep**.
3. Checkout: **login required, no guest checkout** (more secure; fits the PayPal + bank-transfer-only payment setup). PayPal and bank transfer are the ONLY payment methods — no COD/Cliq equivalents.
