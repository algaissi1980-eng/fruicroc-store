# Fruicroc Store

EU e-commerce for freeze-dried fruits & vegetables. Next.js 16 · Supabase · next-intl (fr/en/ar + RTL) · EUR + per-country VAT.

> Structure-only build: visual design system pending (Claude Design handoff).
> Payments deferred: bank transfer implemented (manual confirm), PayPal stubbed.

## Setup

1. `npm install`
2. Create a new Supabase project → run `supabase-schema.sql` in the SQL editor
3. `cp .env.example .env.local` and fill in the Supabase URL + anon key
4. In Supabase Auth settings: enable Email (magic link) and Google OAuth,
   add `http://localhost:3000/api/auth/callback` to redirect URLs
5. `npm run dev` → http://localhost:3000/fr

Admin: sign in with an email listed in the `admins` table (seeded:
algaissi1980@gmail.com) → `/fr/admin`.

## Structure

- `app/[locale]/` — storefront (fr default, en, ar with RTL via `dir` + logical CSS)
- `app/[locale]/admin/` — dashboard: Orders (mark-as-paid), Products (fr/en/ar tabs), Shipping zones, VAT rates, Settings (IBAN/BIC)
- `proxy.ts` — next-intl routing + Supabase session refresh (Next 16 middleware)
- `lib/pricing.ts` — VAT + shipping totals engine
- `supabase-schema.sql` — full schema, RLS, RPCs, seed data
- `messages/*.json` — all UI strings (never hardcode text in components)
- `content/about/` — About Us source texts; `docs/` — audit + data model docs

## Pending decisions

- Price display strategy (single gross price vs. destination-based VAT) — client
- Bank details (IBAN/BIC) — enter in Admin → Settings
- PayPal integration + optional Pay by Bank PSP (Mollie/Stripe) — later
- Legal page texts (placeholders in place) — client/lawyer
- Design system — Claude Design

## Rules

- 3 locales through next-intl only; logical CSS properties (`start`/`end`), never `left`/`right`
- All prices EUR; product prices stored **excl. VAT**
- VAT seed rates must be verified before launch (editable in admin)
