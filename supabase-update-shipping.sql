-- =============================================
-- Fruicroc — Shipping rates per client (2026-07-19)
-- Mondial Relay pickup-point delivery:
--   France 6€ · rest of EU 9€ · free over 100€ (all countries)
-- Run in the Supabase SQL Editor (safe to re-run).
-- =============================================

UPDATE shipping_zones SET rate_eur = 6.00, free_shipping_threshold_eur = 100.00
WHERE country_code = 'FR';

UPDATE shipping_zones SET rate_eur = 9.00, free_shipping_threshold_eur = 100.00
WHERE country_code IN ('DE','IT','ES','NL','BE','PL','PT','LU','AT');
