-- =============================================
-- Fruicroc — Migration 3
-- Weight-tier commerce (design handoff): order items carry the chosen weight
-- Run in the Supabase SQL Editor (after migration 2)
-- =============================================

ALTER TABLE order_items ADD COLUMN weight_g INTEGER;
