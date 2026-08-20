import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DATABASE_URL = 'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Mashtool database via Prisma (Crochet & Crafts)...\n');

  // Categories
  const catData = [
    { id: 'c1', slug: 'crochet-bouquets', name: 'Crochet Flower Bouquets', tagline: 'Everlasting Knitted Blooms', description: 'Premium hand-knit flower bouquets crafted with luxury cotton threads. Perfect gifts that never wither.', image: '/src/assets/macrame-wall.jpg' },
    { id: 'c2', slug: 'crochet-accessories', name: 'Chic Crochet Accessories', tagline: 'Hand-knitted Daily Essentials', description: 'Elegant hand-crocheted bags, bookmarks, and lifestyle accessories designed with precision.', image: '/src/assets/cords-shadow.jpg' },
    { id: 'c3', slug: 'crochet-decor', name: 'Cozy Crochet Decor', tagline: 'Soft Artisan Touches', description: 'Coasters, table mats, and warm home accents knitted by hand to elevate your space.', image: '/src/assets/herb-bag.jpg' },
  ];

  for (const cat of catData) {
    await prisma.category.upsert({ where: { id: cat.id }, create: cat, update: cat });
  }
  console.log('✅ Categories seeded (3)');

  // Products
  const products = [
    { id: 'p1', slug: 'royal-crochet-rose-bouquet', name: 'Royal Crochet Rose Bouquet', categoryId: 'c1', category: 'Crochet Flower Bouquets', categorySlug: 'crochet-bouquets', priceFrom: 450, leadTimeDays: '3–5 days', shortDescription: 'Luxurious bouquet of 7 hand-knitted red and pink roses.', description: 'Beautifully crafted using organic cotton yarns. Includes a elegant wrapping paper and customizable message card.', images: ['/src/assets/macrame-wall.jpg', '/src/assets/wall-art.jpg'], options: [{ id: 'opt-size', name: 'Bouquet Size', required: true, values: [{ id: 'v-m', name: 'Medium (7 Roses)', label: 'Medium (7 Roses)', priceDelta: 0 }, { id: 'v-l', name: 'Large (12 Roses)', label: 'Large (12 Roses)', priceDelta: 250 }] }], featured: true, badge: 'Best Seller', active: true },
    { id: 'p2', slug: 'eternal-tulip-pot', name: 'Eternal Crochet Tulip Pot', categoryId: 'c1', category: 'Crochet Flower Bouquets', categorySlug: 'crochet-bouquets', priceFrom: 180, leadTimeDays: '2–3 days', shortDescription: 'Cute desk-sized crochet tulip pot in pastel colors.', description: 'Brighten up your study desk or office with this charming everlasting tulip pot. Knitted with soft, premium acrylic and cotton blend.', images: ['/src/assets/cords-shadow.jpg'], options: [{ id: 'opt-color', name: 'Flower Color', required: true, values: [{ id: 'v-pink', name: 'Pastel Pink', label: 'Pastel Pink', priceDelta: 0 }, { id: 'v-yellow', name: 'Sunny Yellow', label: 'Sunny Yellow', priceDelta: 0 }, { id: 'v-purple', name: 'Lavender Purple', label: 'Lavender Purple', priceDelta: 0 }] }], featured: true, badge: 'Popular', active: true },
    { id: 'p3', slug: 'boho-crochet-tote-bag', name: 'Boho Chic Crochet Tote Bag', categoryId: 'c2', category: 'Chic Crochet Accessories', categorySlug: 'crochet-accessories', priceFrom: 380, leadTimeDays: '5–7 days', shortDescription: 'Sturdy, hand-knitted boho style shoulder bag.', description: 'A spacious and fashionable tote bag knitted with thick cotton cords, featuring premium interior lining and comfortable handles.', images: ['/src/assets/herb-bag.jpg'], options: [], featured: true, badge: 'New Arrival', active: true },
    { id: 'p4', slug: 'daisy-chain-bookmark', name: 'Daisy Chain Crochet Bookmark', categoryId: 'c2', category: 'Chic Crochet Accessories', categorySlug: 'crochet-accessories', priceFrom: 45, leadTimeDays: '1–2 days', shortDescription: 'Delicate floral bookmark hand-knitted for book lovers.', description: 'Keep your place with this elegant chain of daisies. Made with extra-fine threads for a flat, beautiful design.', images: ['/src/assets/threads.jpg'], options: [], featured: false, badge: 'Cozy Gift', active: true },
    { id: 'p5', slug: 'artisan-blossom-coasters', name: 'Artisan Blossom Crochet Coasters', categoryId: 'c3', category: 'Cozy Crochet Decor', categorySlug: 'crochet-decor', priceFrom: 90, leadTimeDays: '2 days', shortDescription: 'Set of 4 flower-shaped cup coasters in natural shades.', description: 'Add a warm, cottagecore aesthetic to your coffee table. Heat-resistant and machine-washable cotton.', images: ['/src/assets/artisan-hands.jpg'], options: [], featured: false, badge: 'Home Favorite', active: true }
  ];

  // Clean old products first to ensure category consistency
  await prisma.product.deleteMany({});
  
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, create: p, update: p });
  }
  console.log('✅ Products seeded (5)');

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

  console.log('\n🎉 Mashtool database seeding complete (Crochet & Crafts theme)!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
