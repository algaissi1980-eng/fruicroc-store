-- =============================================
-- Fruicroc — Migration 2
-- Promo codes · Offers · Product image storage · Order discount columns
-- Run this in the Supabase SQL Editor (after supabase-schema.sql)
-- =============================================

-- 1. Promo codes
CREATE TABLE promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percentage NUMERIC(5,2) NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
  is_active BOOLEAN DEFAULT true,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Offers
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('sale_percent','free_item')),
  discount_percentage NUMERIC(5,2),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  free_item_count INTEGER,
  min_order_amount NUMERIC(10,2),
  duration_days INTEGER NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Discount columns on orders
ALTER TABLE orders ADD COLUMN promo_code TEXT;
ALTER TABLE orders ADD COLUMN discount_eur NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 4. Storage bucket for product images (public read, admin write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admins update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admins delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- 5. RPCs

CREATE OR REPLACE FUNCTION validate_promo_code(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB AS $$
DECLARE
  r promo_codes;
BEGIN
  SELECT * INTO r FROM promo_codes
  WHERE code = p_code AND is_active
    AND (expires_at IS NULL OR expires_at > now());

  IF r.id IS NULL THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  IF p_subtotal < COALESCE(r.min_order_amount, 0) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'min', 'min', r.min_order_amount);
  END IF;

  RETURN jsonb_build_object('valid', true, 'discount', r.discount_percentage);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION use_promo_code(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes SET used_count = used_count + 1 WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_active_offers()
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', o.id,
      'type', o.type,
      'discount_percentage', o.discount_percentage,
      'product_id', o.product_id,
      'product_name', p.name,
      'product_image', p.image_url,
      'free_item_count', o.free_item_count,
      'min_order_amount', o.min_order_amount,
      'duration_days', o.duration_days,
      'starts_at', o.starts_at,
      'ends_at', o.ends_at
    )), '[]'::jsonb)
    FROM offers o
    LEFT JOIN products p ON p.id = o.product_id
    WHERE o.is_active AND o.ends_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Customers never read promo_codes directly (validation goes through the RPC)
CREATE POLICY "Promo manageable by admins" ON promo_codes FOR ALL USING ( is_admin() );

CREATE POLICY "Offers viewable by everyone" ON offers FOR SELECT USING (true);
CREATE POLICY "Offers manageable by admins" ON offers FOR ALL USING ( is_admin() );
