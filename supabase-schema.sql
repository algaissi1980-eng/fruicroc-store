-- =============================================
-- Fruicroc — Supabase Database Schema
-- Multilingual (fr/en/ar) · EUR · EU VAT · Shipping zones
-- =============================================

-- 1. Products (localized fields as JSONB: {"fr": "...", "en": "...", "ar": "..."})
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug JSONB NOT NULL,                 -- per-locale slugs
  name JSONB NOT NULL,                 -- fr required, en/ar optional
  description JSONB DEFAULT '{}'::jsonb,
  ingredients JSONB,
  price_excl_vat NUMERIC(10,2) NOT NULL,
  original_price_excl_vat NUMERIC(10,2),
  vat_category TEXT NOT NULL DEFAULT 'food' CHECK (vat_category IN ('food','standard')),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'general',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Shipping zones (10 EU countries, admin-editable)
CREATE TABLE shipping_zones (
  country_code TEXT PRIMARY KEY CHECK (country_code IN
    ('FR','DE','IT','ES','NL','BE','PL','PT','LU','AT')),
  rate_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold_eur NUMERIC(10,2),
  active BOOLEAN DEFAULT true
);

-- 3. VAT rates (per country + category; food = reduced rate)
CREATE TABLE vat_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL CHECK (country_code IN
    ('FR','DE','IT','ES','NL','BE','PL','PT','LU','AT')),
  category TEXT NOT NULL CHECK (category IN ('food','standard')),
  rate_percent NUMERIC(5,2) NOT NULL,
  UNIQUE (country_code, category)
);

-- 4. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_cost_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal_excl_vat_eur NUMERIC(10,2) NOT NULL,
  vat_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  vat_amount_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_eur NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN
    ('pending_payment','paid','processing','shipped','completed','cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paypal','bank_transfer')),
  paypal_order_id TEXT,
  bank_transfer_reference TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  paid_marked_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Order items (price snapshot at order time)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_excl_vat NUMERIC(10,2) NOT NULL
);

-- 6. Admins
CREATE TABLE admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Store settings (single row)
CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  categories TEXT[] DEFAULT ARRAY['fruits','vegetables','mixes'],
  announcement JSONB DEFAULT '{}'::jsonb,   -- localized announcement bar
  bank_account_holder TEXT,
  bank_iban TEXT,
  bank_bic TEXT
);

-- 8. Page views
CREATE TABLE page_views (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0
);

-- =============================================
-- Seed data
-- =============================================

INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (email) VALUES ('algaissi1980@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Shipping zones: placeholder rates — client to confirm from admin
INSERT INTO shipping_zones (country_code, rate_eur) VALUES
  ('FR', 5.90), ('DE', 8.90), ('IT', 9.90), ('ES', 9.90), ('NL', 8.90),
  ('BE', 7.90), ('PL', 10.90), ('PT', 10.90), ('LU', 7.90), ('AT', 9.90)
ON CONFLICT (country_code) DO NOTHING;

-- VAT: reduced (food) + standard rates as of 2026 — VERIFY before launch, editable in admin
INSERT INTO vat_rates (country_code, category, rate_percent) VALUES
  ('FR','food', 5.50), ('FR','standard', 20.00),
  ('DE','food', 7.00), ('DE','standard', 19.00),
  ('IT','food', 4.00), ('IT','standard', 22.00),
  ('ES','food', 4.00), ('ES','standard', 21.00),
  ('NL','food', 9.00), ('NL','standard', 21.00),
  ('BE','food', 6.00), ('BE','standard', 21.00),
  ('PL','food', 5.00), ('PL','standard', 23.00),
  ('PT','food', 6.00), ('PT','standard', 23.00),
  ('LU','food', 3.00), ('LU','standard', 17.00),
  ('AT','food',10.00), ('AT','standard', 20.00)
ON CONFLICT (country_code, category) DO NOTHING;

-- =============================================
-- RPC Functions
-- =============================================

-- Atomic stock decrement at checkout
CREATE OR REPLACE FUNCTION handle_checkout_inventory(p_items JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE products
    SET stock = stock - (item->>'quantity')::int
    WHERE id = (item->>'product_id')::uuid
    AND stock >= (item->>'quantity')::int;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for product %', item->>'product_id';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore stock when an order is cancelled (e.g. unpaid bank transfer)
CREATE OR REPLACE FUNCTION restore_order_inventory(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products p
  SET stock = p.stock + oi.quantity
  FROM order_items oi
  WHERE oi.order_id = p_order_id AND oi.product_id = p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Page views counter
CREATE OR REPLACE FUNCTION increment_page_views(view_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO page_views (date, views) VALUES (view_date, 1)
  ON CONFLICT (date) DO UPDATE SET views = page_views.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin check (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_admins_list()
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT COALESCE(jsonb_agg(row_to_json(a)), '[]'::jsonb) FROM admins a);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark a bank-transfer order as paid (admin only)
CREATE OR REPLACE FUNCTION mark_order_paid(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE orders
  SET status = 'paid',
      paid_at = now(),
      paid_marked_by = auth.jwt() ->> 'email'
  WHERE id = p_order_id AND status = 'pending_payment';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE vat_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products manageable by admins" ON products FOR ALL USING ( is_admin() );

CREATE POLICY "Zones viewable by everyone" ON shipping_zones FOR SELECT USING (true);
CREATE POLICY "Zones manageable by admins" ON shipping_zones FOR ALL USING ( is_admin() );

CREATE POLICY "VAT viewable by everyone" ON vat_rates FOR SELECT USING (true);
CREATE POLICY "VAT manageable by admins" ON vat_rates FOR ALL USING ( is_admin() );

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING ( is_admin() );

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING ( is_admin() );

CREATE POLICY "Admins viewable by everyone" ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can manage admins" ON admins FOR ALL USING ( is_admin() );

CREATE POLICY "Settings viewable by everyone" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Settings manageable by admins" ON store_settings FOR ALL USING ( is_admin() );

CREATE POLICY "Anyone can increment views" ON page_views FOR ALL USING (true);
