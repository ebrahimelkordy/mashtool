import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DATABASE_URL = 'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Mashtool database via Prisma (Crochet & Crafts)...\n')  // Categories
  const catData = [
    { id: 'c1', slug: 'crochet-bouquets', name: 'Crochet Flower Bouquets', tagline: 'Everlasting Knitted Blooms', description: 'Premium hand-knit flower bouquets crafted with luxury cotton threads. Perfect gifts that never wither.', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c2', slug: 'crochet-accessories', name: 'Chic Crochet Accessories', tagline: 'Hand-knitted Daily Essentials', description: 'Elegant hand-crocheted bags, bookmarks, and lifestyle accessories designed with precision.', image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c3', slug: 'crochet-decor', name: 'Cozy Crochet Decor', tagline: 'Soft Artisan Touches', description: 'Coasters, table mats, and warm home accents knitted by hand to elevate your space.', image: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c4', slug: 'amigurumi-toys', name: 'Amigurumi Toys', tagline: 'Handmade Whimsical Friends', description: 'Cute, stuffed crochet toys crafted with child-safe organic yarns. Perfect companions for little ones.', image: 'https://images.unsplash.com/photo-1594921319760-4b893a00fde4?q=80&w=1200&auto=format&fit=crop' }
  ];

  for (const cat of catData) {
    await prisma.category.upsert({ where: { id: cat.id }, create: cat, update: cat });
  }
  console.log('✅ Categories seeded (4)');

  // Products (10 products total)
  const products = [
    {
      id: 'p1',
      slug: 'royal-crochet-rose-bouquet',
      name: 'Royal Crochet Rose Bouquet',
      categoryId: 'c1',
      category: 'Crochet Flower Bouquets',
      categorySlug: 'crochet-bouquets',
      priceFrom: 450,
      leadTimeDays: '3–5 days',
      shortDescription: 'Luxurious bouquet of 7 hand-knitted red and pink roses.',
      description: 'Beautifully crafted using organic cotton yarns. Includes an elegant wrapping paper and customizable message card. Each petal is meticulously shaped to capture the essence of a real rose in everlasting thread.',
      images: ['https://images.unsplash.com/photo-1584589167171-541ce45f1eea?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=1200&auto=format&fit=crop'],
      options: [{ id: 'opt-size', name: 'Bouquet Size', required: true, values: [{ id: 'v-m', name: 'Medium (7 Roses)', label: 'Medium (7 Roses)', priceDelta: 0 }, { id: 'v-l', name: 'Large (12 Roses)', label: 'Large (12 Roses)', priceDelta: 250 }] }],
      featured: true,
      badge: 'Best Seller',
      active: true
    },
    {
      id: 'p2',
      slug: 'eternal-tulip-pot',
      name: 'Eternal Crochet Tulip Pot',
      categoryId: 'c1',
      category: 'Crochet Flower Bouquets',
      categorySlug: 'crochet-bouquets',
      priceFrom: 180,
      leadTimeDays: '2–3 days',
      shortDescription: 'Cute desk-sized crochet tulip pot in pastel colors.',
      description: 'Brighten up your study desk or office with this charming everlasting tulip pot. Knitted with soft, premium acrylic and cotton blend. The pot itself is also crocheted for a full handmade aesthetic.',
      images: ['https://images.unsplash.com/photo-1616781296180-21696230f81d?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=1200&auto=format&fit=crop'],
      options: [{ id: 'opt-color', name: 'Flower Color', required: true, values: [{ id: 'v-pink', name: 'Pastel Pink', label: 'Pastel Pink', priceDelta: 0 }, { id: 'v-yellow', name: 'Sunny Yellow', label: 'Sunny Yellow', priceDelta: 0 }, { id: 'v-purple', name: 'Lavender Purple', label: 'Lavender Purple', priceDelta: 0 }] }],
      featured: true,
      badge: 'Popular',
      active: true
    },
    {
      id: 'p3',
      slug: 'boho-crochet-tote-bag',
      name: 'Boho Chic Crochet Tote Bag',
      categoryId: 'c2',
      category: 'Chic Crochet Accessories',
      categorySlug: 'crochet-accessories',
      priceFrom: 380,
      leadTimeDays: '5–7 days',
      shortDescription: 'Sturdy, hand-knitted boho style shoulder bag.',
      description: 'A spacious and fashionable tote bag knitted with thick cotton cords, featuring premium interior lining and comfortable handles. The open weave design gives it a relaxed, summery feel perfect for the beach or city strolling.',
      images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop'],
      options: [{ id: 'opt-strap', name: 'Strap Style', required: true, values: [{ id: 's-short', name: 'Short (Handheld)', label: 'Short', priceDelta: 0 }, { id: 's-long', name: 'Long (Crossbody)', label: 'Long', priceDelta: 40 }] }],
      featured: true,
      badge: 'New Arrival',
      active: true
    },
    {
      id: 'p4',
      slug: 'daisy-chain-bookmark',
      name: 'Daisy Chain Crochet Bookmark',
      categoryId: 'c2',
      category: 'Chic Crochet Accessories',
      categorySlug: 'crochet-accessories',
      priceFrom: 45,
      leadTimeDays: '1–2 days',
      shortDescription: 'Delicate floral bookmark hand-knitted for book lovers.',
      description: 'Keep your place with this elegant chain of daisies. Made with extra-fine threads for a flat, beautiful design that won\'t damage your book bindings.',
      images: ['https://images.unsplash.com/photo-1544371457-37593c5d7999?q=80&w=1200&auto=format&fit=crop'],
      options: [],
      featured: false,
      badge: 'Cozy Gift',
      active: true
    },
    {
      id: 'p5',
      slug: 'artisan-blossom-coasters',
      name: 'Artisan Blossom Crochet Coasters',
      categoryId: 'c3',
      category: 'Cozy Crochet Decor',
      categorySlug: 'crochet-decor',
      priceFrom: 90,
      leadTimeDays: '2 days',
      shortDescription: 'Set of 4 flower-shaped cup coasters in natural shades.',
      description: 'Add a warm, cottagecore aesthetic to your coffee table. Heat-resistant and machine-washable cotton. These thick coasters protect your wooden surfaces while adding handmade charm.',
      images: ['https://images.unsplash.com/photo-1517480549449-3f745e128186?q=80&w=1200&auto=format&fit=crop'],
      options: [],
      featured: false,
      badge: 'Home Favorite',
      active: true
    },
    {
      id: 'p6',
      slug: 'sunburst-crochet-throw',
      name: 'Sunburst Crochet Throw Blanket',
      categoryId: 'c3',
      category: 'Cozy Crochet Decor',
      categorySlug: 'crochet-decor',
      priceFrom: 650,
      leadTimeDays: '7–10 days',
      shortDescription: 'Hand-crocheted warm throw blanket with intricate starburst pattern.',
      description: 'Ultra-soft hand-knit throw blanket made with organic wool and cotton yarn. Adds cozy elegance to any couch or bedroom. The striking geometric starburst pattern acts as an art piece for your living room.',
      images: ['https://images.unsplash.com/photo-1520699049698-acd2fcc18c0a?q=80&w=1200&auto=format&fit=crop'],
      options: [{ id: 'opt-dim', name: 'Dimensions', required: true, values: [{ id: 'd-med', name: 'Medium (120x150cm)', label: 'Medium', priceDelta: 0 }, { id: 'd-large', name: 'Large (150x200cm)', label: 'Large', priceDelta: 300 }] }],
      featured: true,
      badge: 'Handmade Luxury',
      active: true
    },
    {
      id: 'p7',
      slug: 'lavender-blossom-bag',
      name: 'Lavender Blossom Crochet Handbag',
      categoryId: 'c2',
      category: 'Chic Crochet Accessories',
      categorySlug: 'crochet-accessories',
      priceFrom: 420,
      leadTimeDays: '5 days',
      shortDescription: 'Chic handbag featuring woven lavender flower motifs.',
      description: 'Handcrafted with intricate floral stitches and a secure magnetic clasp. Includes a detachable wrist strap and enough room for your phone, wallet, and keys.',
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop'],
      options: [],
      featured: true,
      badge: 'Trending',
      active: true
    },
    {
      id: 'p8',
      slug: 'mini-flower-keychain',
      name: 'Mini Flower Crochet Keychain Set',
      categoryId: 'c2',
      category: 'Chic Crochet Accessories',
      categorySlug: 'crochet-accessories',
      priceFrom: 60,
      leadTimeDays: '1 day',
      shortDescription: 'Adorable set of 2 hand-knitted mini flower charms.',
      description: 'Cute floral keychains to attach to your bag or keys. Makes a lovely small gift or souvenir. Knitted tightly with shiny mercerized cotton for durability.',
      images: ['https://images.unsplash.com/photo-1558245842-70b86a0d24de?q=80&w=1200&auto=format&fit=crop'],
      options: [],
      featured: false,
      badge: 'Cute Charm',
      active: true
    },
    {
      id: 'p9',
      slug: 'cuddly-crochet-bear',
      name: 'Cuddly Crochet Bear Toy',
      categoryId: 'c4',
      category: 'Amigurumi Toys',
      categorySlug: 'amigurumi-toys',
      priceFrom: 220,
      leadTimeDays: '3-4 days',
      shortDescription: 'Soft and safe amigurumi bear for kids.',
      description: 'A beautifully crafted stuffed bear using the Japanese amigurumi technique. Features securely embroidered eyes making it completely safe for babies and toddlers.',
      images: ['https://images.unsplash.com/photo-1594921319760-4b893a00fde4?q=80&w=1200&auto=format&fit=crop'],
      options: [],
      featured: true,
      badge: 'Kids Love It',
      active: true
    },
    {
      id: 'p10',
      slug: 'crochet-sunflower-bouquet',
      name: 'Sunshine Crochet Sunflower Bouquet',
      categoryId: 'c1',
      category: 'Crochet Flower Bouquets',
      categorySlug: 'crochet-bouquets',
      priceFrom: 350,
      leadTimeDays: '3-5 days',
      shortDescription: 'Bright bouquet of 5 giant crochet sunflowers.',
      description: 'Bring eternal sunshine into any room with these massive, detailed crochet sunflowers. Vibrant yellow cotton yarn guaranteed to maintain its bright color for years.',
      images: ['https://images.unsplash.com/photo-1554522964-b86e58abf322?q=80&w=1200&auto=format&fit=crop'],
      options: [],
      featured: true,
      badge: 'Seasonal Vibe',
      active: true
    }
  ];

  // Clean old products first to ensure category consistency
  await prisma.product.deleteMany({});
  
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, create: p, update: p });
  }
  console.log('✅ Products seeded (8)');

  // Testimonials
  const testimonials = [
    { name: 'Yasmine K.', initials: 'YK', quote: 'The rose bouquet is stunning! My mother was so happy with it. Excellent knitting quality.', rating: 5 },
    { name: 'Farida A.', initials: 'FA', quote: 'Delicate and cute tulip pot. It sits on my desk and makes me smile every morning. Thank you Mashtool!', rating: 5 },
    { name: 'Mariam H.', initials: 'MH', quote: 'Highly recommend the boho tote bag. Very durable and fits all my daily essentials perfectly.', rating: 5 }
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('✅ Testimonials seeded (3)');

  // Settings
  await prisma.setting.upsert({ where: { id: 'main' }, create: { id: 'main', whatsapp: '+201117252662', instagram: '@mashtool.atelier' }, update: { whatsapp: '+201117252662', instagram: '@mashtool.atelier' } });
  console.log('✅ Settings seeded');

  console.log('\n🎉 Mashtool database seeding complete (Crochet & Crafts theme with instant public images)!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
