import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://bwyowbsecdqaaonkallp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eW93YnNlY2RxYWFvbmthbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjU0NzQ2NiwiZXhwIjoyMTAyMTIzNDY2fQ.Vn87rE0fHfXASxf6cUeZ2nbQ0yh1L207JE7qrnfc2S4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function migrate() {
  console.log('🚀 Starting Supabase migration for Mashtool...\n');

  // ─── CATEGORIES ────────────────────────────────────────────────────────────
  const categories = [
    { id: 'c1', slug: 'macrame-wall-hangings', name: 'Macramé Wall Tapestries', tagline: 'Artisan Wall Accents', description: 'Handcrafted macramé wall hangings made with premium natural cotton fibers to add warm sophistication to your space.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800' },
    { id: 'c2', slug: 'plant-hangers', name: 'Botanical Plant Hangers', tagline: 'Green Living Touches', description: 'Durable and stylish bohemian plant hangers crafted to elevate your indoor greenery with refined elegance.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    { id: 'c3', slug: 'home-decor', name: 'Luxury Home Accessories', tagline: 'Details & Accent Decor', description: 'Handwoven coasters, table runners, and artisanal home accessories designed with timeless craftsmanship.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
  ];

  const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
  if (catErr) console.error('❌ Categories error:', catErr.message);
  else console.log('✅ Categories seeded (3 records)');

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────
  const products = [
    { id: 'p1', slug: 'serene-horizon-macrame-tapestry', name: 'Serene Horizon Macramé Tapestry', category_id: 'c1', category: 'Macramé Wall Tapestries', category_slug: 'macrame-wall-hangings', price_from: 450, lead_time_days: '1–2 weeks', short_description: 'Handwoven blush merino tapestry with intricate geometric knotting.', description: 'Crafted in our studio using ethically sourced organic cotton yarn and rose gold metallic accents. Designed to create a calming focal point in your bedroom or living space.', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'], options: [{ id: 'opt-size', name: 'Dimensions', required: true, values: [{ id: 'v-m', name: 'Medium (60×40 cm)', label: 'Medium (60×40 cm)', priceDelta: 0 }, { id: 'v-l', name: 'Large (90×60 cm)', label: 'Large (90×60 cm)', priceDelta: 200 }] }], featured: true, badge: 'Best Seller', active: true },
    { id: 'p2', slug: 'rosewood-botanical-hanger', name: 'Rosewood Botanical Hanger', category_id: 'c2', category: 'Botanical Plant Hangers', category_slug: 'plant-hangers', price_from: 320, lead_time_days: '1–2 weeks', short_description: 'Deep rose and terracotta hand-braided cord hanger.', description: 'A statement plant hanger woven from premium jute and cotton blend in rich rosewood tones. Perfect for cascading pothos, philodendron, or hanging succulents.', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], options: [{ id: 'opt-cord', name: 'Cord Material', required: true, values: [{ id: 'v-jute', name: 'Natural Jute', label: 'Natural Jute', priceDelta: 0 }, { id: 'v-cotton', name: 'Organic Cotton', label: 'Organic Cotton', priceDelta: 80 }] }], featured: true, badge: 'Popular', active: true },
    { id: 'p3', slug: 'artisanal-woven-tote', name: 'Artisanal Woven Tote & Runner', category_id: 'c3', category: 'Luxury Home Accessories', category_slug: 'home-decor', price_from: 380, lead_time_days: '1–2 weeks', short_description: 'Luxury hand-woven boho tote bag in ivory and sage.', description: 'A luxurious handwoven tote crafted in our studio from organic cotton and natural jute. Features an elegant sage and ivory weave pattern and premium leather handles.', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], options: [], featured: true, badge: 'New Arrival', active: true },
    { id: 'p4', slug: 'golden-arch-wall-sculpture', name: 'Golden Arch Wall Sculpture', category_id: 'c1', category: 'Macramé Wall Tapestries', category_slug: 'macrame-wall-hangings', price_from: 600, lead_time_days: '2–3 weeks', short_description: 'Statement arch-shaped macramé with gilded brass ring accent.', description: 'A contemporary art piece combining traditional macramé knotting with a large gilded brass ring frame. Each piece is signed by our lead artisan.', images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'], options: [{ id: 'opt-size', name: 'Ring Size', required: true, values: [{ id: 'v-s', name: 'Small (40 cm)', label: 'Small (40 cm)', priceDelta: 0 }, { id: 'v-m', name: 'Medium (60 cm)', label: 'Medium (60 cm)', priceDelta: 150 }, { id: 'v-l', name: 'Large (80 cm)', label: 'Large (80 cm)', priceDelta: 350 }] }], featured: false, badge: 'Signature', active: true },
    { id: 'p5', slug: 'desert-rose-fringe-hanging', name: 'Desert Rose Fringe Hanging', category_id: 'c1', category: 'Macramé Wall Tapestries', category_slug: 'macrame-wall-hangings', price_from: 520, lead_time_days: '2 weeks', short_description: 'Bohemian sunset-toned wall hanging with long silk fringe finish.', description: 'Inspired by desert sunsets, this piece combines terracotta, dusty rose, and caramel cord tones with a luxurious silk fringe finish. Limited seasonal collection.', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=800'], options: [], featured: false, badge: 'Limited Edition', active: true },
    { id: 'p6', slug: 'ivory-cascade-plant-trio', name: 'Ivory Cascade Plant Trio Set', category_id: 'c2', category: 'Botanical Plant Hangers', category_slug: 'plant-hangers', price_from: 750, lead_time_days: '1 week', short_description: 'Matching set of three ivory cotton cascade hangers.', description: 'A curated matching set of three graduated plant hangers in pure ivory organic cotton. Ideal for creating a botanical wall garden in your home or balcony.', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], options: [{ id: 'opt-length', name: 'Hanger Length', required: true, values: [{ id: 'v-short', name: 'Short Set (60–80–100 cm)', label: 'Short Set', priceDelta: 0 }, { id: 'v-long', name: 'Long Set (80–100–120 cm)', label: 'Long Set', priceDelta: 100 }] }], featured: false, badge: 'Set Deal', active: true },
    { id: 'p7', slug: 'blush-table-runner', name: 'Blush Linen Table Runner', category_id: 'c3', category: 'Luxury Home Accessories', category_slug: 'home-decor', price_from: 290, lead_time_days: '1 week', short_description: 'Handwoven linen table runner in soft blush with tassel ends.', description: 'A refined table runner woven from premium Belgian linen in a soft blush colorway. Features artisan-tied tassel ends and a subtle herringbone texture.', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], options: [{ id: 'opt-length', name: 'Runner Length', required: false, values: [{ id: 'v-180', name: '180 cm (6-seat table)', label: '180 cm', priceDelta: 0 }, { id: 'v-240', name: '240 cm (8-seat table)', label: '240 cm', priceDelta: 80 }] }], featured: false, badge: null, active: true },
    { id: 'p8', slug: 'moon-phase-wall-set', name: 'Moon Phase Macramé Wall Set', category_id: 'c1', category: 'Macramé Wall Tapestries', category_slug: 'macrame-wall-hangings', price_from: 870, lead_time_days: '3 weeks', short_description: 'Seven-piece moon phase wall art set in cream and gold.', description: 'A complete moon phase wall installation featuring seven individually knotted pieces representing the full lunar cycle. Cream organic cotton with gold wire accents.', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'], options: [], featured: true, badge: 'Fan Favorite', active: true },
  ];

  const { error: prodErr } = await supabase.from('products').upsert(products, { onConflict: 'id' });
  if (prodErr) console.error('❌ Products error:', prodErr.message);
  else console.log('✅ Products seeded (8 records)');

  // ─── TESTIMONIALS ──────────────────────────────────────────────────────────
  const testimonials = [
    { name: 'Nada S.', initials: 'NS', quote: 'The tapestry arrived beautifully packaged. It transformed my living room completely — everyone asks where I got it!', rating: 5 },
    { name: 'Rana M.', initials: 'RM', quote: "I ordered a bespoke piece for my daughter's nursery and the team was incredibly attentive to every detail. Worth every penny.", rating: 5 },
    { name: 'Farah A.', initials: 'FA', quote: 'Stunning craftsmanship. The plant hanger trio is exactly what my balcony needed. Fast delivery and lovely packaging.', rating: 5 },
    { name: 'Sara K.', initials: 'SK', quote: 'I was skeptical at first but the quality is exceptional. My custom wall piece is a genuine work of art.', rating: 5 },
  ];

  const { error: testimErr } = await supabase.from('testimonials').upsert(testimonials);
  if (testimErr) console.error('❌ Testimonials error:', testimErr.message);
  else console.log('✅ Testimonials seeded (4 records)');

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  const { error: settErr } = await supabase.from('settings').upsert({ id: 'main', whatsapp: '+201001112233', instagram: '@mashtool.atelier' }, { onConflict: 'id' });
  if (settErr) console.error('❌ Settings error:', settErr.message);
  else console.log('✅ Settings seeded');

  console.log('\n🎉 Mashtool Supabase migration complete!');
}

migrate().catch(console.error);
