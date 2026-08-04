-- =============================================
-- Fruicroc — Migration 6
-- Client decision (2026-07-19): all prices are VAT-INCLUSIVE (TTC),
-- identical in every country. VAT is no longer added on top —
-- it is extracted from the gross price and stored for invoicing.
-- Column renames to match the new semantics.
-- Run in the Supabase SQL Editor.
-- =============================================

-- Gross (VAT-included) subtotal of the order
ALTER TABLE orders RENAME COLUMN subtotal_excl_vat_eur TO subtotal_eur;

-- vat_amount_eur now means: VAT INCLUDED in total_eur (informational, "dont TVA")
COMMENT ON COLUMN orders.vat_amount_eur IS 'VAT included in total_eur (extracted from gross, not added)';

-- Gross unit price snapshot
ALTER TABLE order_items RENAME COLUMN price_excl_vat TO unit_price_eur;

-- Products: per-product price is unused (brand-wide weight tiers) — keep for
-- reference but rename for clarity
ALTER TABLE products RENAME COLUMN price_excl_vat TO base_price_eur;
ALTER TABLE products RENAME COLUMN original_price_excl_vat TO original_price_eur;
