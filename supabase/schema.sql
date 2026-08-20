-- ============================================================
-- MASHTOOL — SUPABASE SCHEMA MIGRATION
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  category_id       TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category          TEXT NOT NULL,
  category_slug     TEXT NOT NULL,
  price_from        NUMERIC DEFAULT 0,
  lead_time_days    TEXT DEFAULT '1–2 weeks',
  short_description TEXT DEFAULT '',
  description       TEXT DEFAULT '',
  images            JSONB DEFAULT '[]',
  options           JSONB DEFAULT '[]',
  featured          BOOLEAN DEFAULT FALSE,
  badge             TEXT,
  active            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number      TEXT UNIQUE NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('standard', 'bespoke')),
  product_id        TEXT,
  product_name      TEXT,
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  whatsapp          TEXT,
  address           TEXT,
  quantity          INTEGER DEFAULT 1,
  notes             TEXT,
  reference_images  JSONB DEFAULT '[]',
  selected_options  JSONB DEFAULT '[]',
  unit_price        NUMERIC,
  total             NUMERIC,
  status            TEXT DEFAULT 'new' CHECK (status IN ('new','quoted','confirmed','in_progress','ready','delivered','cancelled')),
  quoted_price      NUMERIC,
  payment_proof_url TEXT,
  estimated_delivery DATE,
  admin_note        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  subject     TEXT DEFAULT '',
  body        TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name      TEXT NOT NULL,
  initials  TEXT DEFAULT '',
  quote     TEXT NOT NULL,
  rating    INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id          TEXT PRIMARY KEY DEFAULT 'main',
  whatsapp    TEXT DEFAULT '',
  instagram   TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
INSERT INTO categories (id, slug, name, tagline, description, image) VALUES
('c1', 'macrame-wall-hangings', 'Macramé Wall Tapestries', 'Artisan Wall Accents',
 'Handcrafted macramé wall hangings made with premium natural cotton fibers to add warm sophistication to your space.',
 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800'),
('c2', 'plant-hangers', 'Botanical Plant Hangers', 'Green Living Touches',
 'Durable and stylish bohemian plant hangers crafted to elevate your indoor greenery with refined elegance.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
('c3', 'home-decor', 'Luxury Home Accessories', 'Details & Accent Decor',
 'Handwoven coasters, table runners, and artisanal home accessories designed with timeless craftsmanship.',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED PRODUCTS
-- ============================================================
INSERT INTO products (id, slug, name, category_id, category, category_slug, price_from, lead_time_days, short_description, description, images, options, featured, badge, active) VALUES
(
  'p1', 'serene-horizon-macrame-tapestry', 'Serene Horizon Macramé Tapestry',
  'c1', 'Macramé Wall Tapestries', 'macrame-wall-hangings', 450, '1–2 weeks',
  'Handwoven blush merino tapestry with intricate geometric knotting.',
  'Crafted in our studio using ethically sourced organic cotton yarn and rose gold metallic accents. Designed to create a calming focal point in your bedroom or living space.',
  '["https://images.unsplash.com/photo-1618220179428-22790b461013?w=800","https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800"]',
  '[{"id":"opt-size","name":"Dimensions","required":true,"values":[{"id":"v-m","name":"Medium (60×40 cm)","label":"Medium (60×40 cm)","priceDelta":0},{"id":"v-l","name":"Large (90×60 cm)","label":"Large (90×60 cm)","priceDelta":200}]}]',
  TRUE, 'Best Seller', TRUE
),
(
  'p2', 'rosewood-botanical-hanger', 'Rosewood Botanical Hanger',
  'c2', 'Botanical Plant Hangers', 'plant-hangers', 320, '1–2 weeks',
  'Deep rose and terracotta hand-braided cord hanger.',
  'A statement plant hanger woven from premium jute and cotton blend in rich rosewood tones. Perfect for cascading pothos, philodendron, or hanging succulents.',
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
  '[{"id":"opt-cord","name":"Cord Material","required":true,"values":[{"id":"v-jute","name":"Natural Jute","label":"Natural Jute","priceDelta":0},{"id":"v-cotton","name":"Organic Cotton","label":"Organic Cotton","priceDelta":80}]}]',
  TRUE, 'Popular', TRUE
),
(
  'p3', 'artisanal-woven-tote', 'Artisanal Woven Tote & Runner',
  'c3', 'Luxury Home Accessories', 'home-decor', 380, '1–2 weeks',
  'Luxury hand-woven boho tote bag in ivory and sage.',
  'A luxurious handwoven tote crafted in our studio from organic cotton and natural jute. Features an elegant sage and ivory weave pattern and premium leather handles.',
  '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]',
  '[]',
  TRUE, 'New Arrival', TRUE
),
(
  'p4', 'golden-arch-wall-sculpture', 'Golden Arch Wall Sculpture',
  'c1', 'Macramé Wall Tapestries', 'macrame-wall-hangings', 600, '2–3 weeks',
  'Statement arch-shaped macramé with gilded brass ring accent.',
  'A contemporary art piece combining traditional macramé knotting with a large gilded brass ring frame. Each piece is signed by our lead artisan.',
  '["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800"]',
  '[{"id":"opt-size","name":"Ring Size","required":true,"values":[{"id":"v-s","name":"Small (40 cm)","label":"Small (40 cm)","priceDelta":0},{"id":"v-m","name":"Medium (60 cm)","label":"Medium (60 cm)","priceDelta":150},{"id":"v-l","name":"Large (80 cm)","label":"Large (80 cm)","priceDelta":350}]}]',
  FALSE, 'Signature', TRUE
),
(
  'p5', 'desert-rose-fringe-hanging', 'Desert Rose Fringe Hanging',
  'c1', 'Macramé Wall Tapestries', 'macrame-wall-hangings', 520, '2 weeks',
  'Bohemian sunset-toned wall hanging with long silk fringe finish.',
  'Inspired by desert sunsets, this piece combines terracotta, dusty rose, and caramel cord tones with a luxurious silk fringe finish. Limited seasonal collection.',
  '["https://images.unsplash.com/photo-1618220179428-22790b461013?w=800"]',
  '[]',
  FALSE, 'Limited Edition', TRUE
),
(
  'p6', 'ivory-cascade-plant-trio', 'Ivory Cascade Plant Trio Set',
  'c2', 'Botanical Plant Hangers', 'plant-hangers', 750, '1 week',
  'Matching set of three ivory cotton cascade hangers.',
  'A curated matching set of three graduated plant hangers in pure ivory organic cotton. Ideal for creating a botanical wall garden in your home or balcony.',
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
  '[{"id":"opt-length","name":"Hanger Length","required":true,"values":[{"id":"v-short","name":"Short Set (60–80–100 cm)","label":"Short Set","priceDelta":0},{"id":"v-long","name":"Long Set (80–100–120 cm)","label":"Long Set","priceDelta":100}]}]',
  FALSE, 'Set Deal', TRUE
),
(
  'p7', 'blush-table-runner', 'Blush Linen Table Runner',
  'c3', 'Luxury Home Accessories', 'home-decor', 290, '1 week',
  'Handwoven linen table runner in soft blush with tassel ends.',
  'A refined table runner woven from premium Belgian linen in a soft blush colorway. Features artisan-tied tassel ends and a subtle herringbone texture.',
  '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]',
  '[{"id":"opt-length","name":"Runner Length","required":false,"values":[{"id":"v-180","name":"180 cm (6-seat table)","label":"180 cm","priceDelta":0},{"id":"v-240","name":"240 cm (8-seat table)","label":"240 cm","priceDelta":80}]}]',
  FALSE, NULL, TRUE
),
(
  'p8', 'moon-phase-wall-set', 'Moon Phase Macramé Wall Set',
  'c1', 'Macramé Wall Tapestries', 'macrame-wall-hangings', 870, '3 weeks',
  'Seven-piece moon phase wall art set in cream and gold.',
  'A complete moon phase wall installation featuring seven individually knotted pieces representing the full lunar cycle. Cream organic cotton with gold wire accents.',
  '["https://images.unsplash.com/photo-1618220179428-22790b461013?w=800","https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800"]',
  '[]',
  TRUE, 'Fan Favorite', TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED TESTIMONIALS
-- ============================================================
INSERT INTO testimonials (name, initials, quote, rating) VALUES
('Nada S.', 'NS', 'The tapestry arrived beautifully packaged. It transformed my living room completely — everyone asks where I got it!', 5),
('Rana M.', 'RM', 'I ordered a bespoke piece for my daughter''s nursery and the team was incredibly attentive to every detail. Worth every penny.', 5),
('Farah A.', 'FA', 'Stunning craftsmanship. The plant hanger trio is exactly what my balcony needed. Fast delivery and lovely packaging.', 5),
('Sara K.', 'SK', 'I was skeptical at first but the quality is exceptional. My custom wall piece is a genuine work of art.', 5);

-- ============================================================
-- SEED SETTINGS
-- ============================================================
INSERT INTO settings (id, whatsapp, instagram) VALUES
('main', '+201001112233', '@mashtool.atelier')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — allow all for now (no auth)
-- ============================================================
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials   ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_categories"   ON categories   FOR SELECT USING (true);
CREATE POLICY "public_read_products"     ON products     FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "public_read_settings"     ON settings     FOR SELECT USING (true);

-- Full access via service role (admin server calls)
CREATE POLICY "service_all_orders"    ON orders    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_messages"  ON messages  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_products"  ON products  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_settings"  ON settings  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true);
