-- =============================================
-- Fruicroc — Migration 5
-- Editable site images (hero, category tiles, Jana's photo)
-- Managed from Admin → Settings, stored in the product-images bucket.
-- Run in the Supabase SQL Editor.
-- =============================================

ALTER TABLE store_settings
  ADD COLUMN site_images JSONB DEFAULT '{}'::jsonb;

-- Keys used: hero, category_fruits, category_vegetables, category_candy, jana
