require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing!");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("Seeding database with authentic crochet products & categories...");

  // Ensure tables exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT,
      category TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      price_from DOUBLE PRECISION DEFAULT 0,
      lead_time_days TEXT DEFAULT '1–2 weeks',
      short_description TEXT DEFAULT '',
      description TEXT DEFAULT '',
      images JSONB DEFAULT '[]'::jsonb,
      options JSONB DEFAULT '[]'::jsonb,
      featured BOOLEAN DEFAULT false,
      badge TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      rating INT DEFAULT 5,
      comment TEXT DEFAULT '',
      approved BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `).catch((err) => console.log("Table check note:", err.message));

  // Clear existing items
  await prisma.review.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});

  const categories = [
    {
      id: "c1",
      slug: "crochet-bouquets",
      name: "Crochet Flower Bouquets",
      tagline: "Everlasting Knitted Blooms",
      description: "Premium hand-knit flower bouquets crafted with luxury cotton threads. Perfect gifts that never wither.",
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "c2",
      slug: "crochet-accessories",
      name: "Chic Crochet Accessories",
      tagline: "Hand-knitted Daily Essentials",
      description: "Elegant hand-crocheted bags, bookmarks, keychains and lifestyle accessories designed with precision.",
      image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "c3",
      slug: "crochet-decor",
      name: "Cozy Crochet Decor",
      tagline: "Soft Artisan Touches",
      description: "Coasters, mug hugs, and warm home accents knitted by hand to elevate your living space.",
      image: "https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "c4",
      slug: "amigurumi-toys",
      name: "Amigurumi Toys",
      tagline: "Handmade Whimsical Friends",
      description: "Cute, stuffed crochet toys crafted with child-safe organic yarns. Perfect companions for little ones.",
      image: "https://images.unsplash.com/photo-1594921319760-4b893a00fde4?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      create: cat,
      update: cat,
    });
  }

  const products = [
    {
      id: "p1",
      slug: "royal-crochet-rose-bouquet",
      name: "Royal Crochet Rose Bouquet",
      categoryId: "c1",
      category: "Crochet Flower Bouquets",
      categorySlug: "crochet-bouquets",
      priceFrom: 450,
      leadTimeDays: "3–5 days",
      shortDescription: "Luxurious bouquet of 7 hand-knitted red and blush pink roses.",
      description: "Beautifully crafted using premium organic cotton yarns. Includes elegant kraft paper wrapping and a customizable card.",
      images: [
        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [
        {
          id: "opt-size",
          name: "Bouquet Size",
          required: true,
          values: [
            { id: "v-m", label: "Medium (7 Roses)", priceDelta: 0 },
            { id: "v-l", label: "Large (12 Roses)", priceDelta: 250 },
          ],
        },
      ],
      featured: true,
      badge: "Best Seller",
      active: true,
    },
    {
      id: "p2",
      slug: "eternal-tulip-pot",
      name: "Eternal Crochet Tulip Pot",
      categoryId: "c1",
      category: "Crochet Flower Bouquets",
      categorySlug: "crochet-bouquets",
      priceFrom: 180,
      leadTimeDays: "2–3 days",
      shortDescription: "Cute desk-sized crochet tulip pot in pastel colors.",
      description: "Brighten up your study desk or office with this charming everlasting tulip pot. Knitted with soft acrylic & cotton blend.",
      images: [
        "https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [
        {
          id: "opt-color",
          name: "Flower Color",
          required: true,
          values: [
            { id: "v-pink", label: "Pastel Pink", priceDelta: 0 },
            { id: "v-yellow", label: "Sunny Yellow", priceDelta: 0 },
            { id: "v-purple", label: "Lavender Purple", priceDelta: 0 },
          ],
        },
      ],
      featured: true,
      badge: "Popular",
      active: true,
    },
    {
      id: "p3",
      slug: "boho-crochet-tote-bag",
      name: "Boho Chic Crochet Tote Bag",
      categoryId: "c2",
      category: "Chic Crochet Accessories",
      categorySlug: "crochet-accessories",
      priceFrom: 380,
      leadTimeDays: "5–7 days",
      shortDescription: "Sturdy, hand-knitted boho style shoulder bag.",
      description: "A spacious and fashionable tote bag knitted with thick cotton cords, featuring comfortable sturdy handles.",
      images: [
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [],
      featured: true,
      badge: "New Arrival",
      active: true,
    },
    {
      id: "p4",
      slug: "daisy-chain-bookmark",
      name: "Daisy Chain Crochet Bookmark",
      categoryId: "c2",
      category: "Chic Crochet Accessories",
      categorySlug: "crochet-accessories",
      priceFrom: 45,
      leadTimeDays: "1–2 days",
      shortDescription: "Delicate floral bookmark hand-knitted for book lovers.",
      description: "Keep your place with this elegant chain of daisies. Made with extra-fine threads for a flat, beautiful design.",
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [],
      featured: false,
      badge: "Cozy Gift",
      active: true,
    },
    {
      id: "p5",
      slug: "artisan-blossom-coasters",
      name: "Artisan Blossom Crochet Coasters",
      categoryId: "c3",
      category: "Cozy Crochet Decor",
      categorySlug: "crochet-decor",
      priceFrom: 90,
      leadTimeDays: "2 days",
      shortDescription: "Set of 4 flower-shaped cup coasters in natural shades.",
      description: "Add a warm, cottagecore aesthetic to your coffee table. Heat-resistant and machine-washable cotton.",
      images: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [],
      featured: false,
      badge: "Home Favorite",
      active: true,
    },
    {
      id: "p6",
      slug: "sunflower-sunshine-bouquet",
      name: "Sunflower Sunshine Crochet Bouquet",
      categoryId: "c1",
      category: "Crochet Flower Bouquets",
      categorySlug: "crochet-bouquets",
      priceFrom: 320,
      leadTimeDays: "3 days",
      shortDescription: "Vibrant hand-knit sunflower bouquet that spreads joy.",
      description: "Bright yellow sunflowers knitted with dark brown centers and green stems. Brings warmth and cheerfulness.",
      images: [
        "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [],
      featured: true,
      badge: "Trending",
      active: true,
    },
    {
      id: "p7",
      slug: "handmade-teddy-bear-amigurumi",
      name: "Handmade Teddy Bear Amigurumi",
      categoryId: "c4",
      category: "Amigurumi Toys",
      categorySlug: "amigurumi-toys",
      priceFrom: 220,
      leadTimeDays: "3–4 days",
      shortDescription: "Adorable hand-knitted teddy bear toy with hypoallergenic stuffing.",
      description: "Crafted with love using organic baby-safe cotton yarn and safety eyes. Super soft and huggable.",
      images: [
        "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [],
      featured: true,
      badge: "Kids Love It",
      active: true,
    },
    {
      id: "p8",
      slug: "crochet-keychain-flower-charm",
      name: "Mini Flower Keychain Charm",
      categoryId: "c2",
      category: "Chic Crochet Accessories",
      categorySlug: "crochet-accessories",
      priceFrom: 35,
      leadTimeDays: "1 day",
      shortDescription: "Cute knitted flower charm for keys or handbags.",
      description: "Handcrafted miniature flower charm attached to a sturdy metallic gold keychain clip.",
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop"
      ],
      options: [],
      featured: false,
      badge: "Handmade Luxury",
      active: true,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      create: prod,
      update: prod,
    });
  }

  const reviews = [
    {
      id: "r1",
      productId: "p1",
      name: "Mariam Hassan",
      rating: 5,
      comment: "المظهر والتقفيل ممتاز جداً! الورد متماسك وعجب والدتي جداً فالعيد.",
      approved: true,
    },
    {
      id: "r2",
      productId: "p1",
      name: "Sarah Ahmed",
      rating: 5,
      comment: "Beautiful crochet bouquet! The cotton yarn is high quality and wrapping is elegant.",
      approved: true,
    },
    {
      id: "r3",
      productId: "p2",
      name: "Salma Mahmoud",
      rating: 5,
      comment: "أصيص التوليب تحفة جداً على مكتبي وشكله شيك أوي ❤️",
      approved: true,
    },
  ];

  for (const rev of reviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      create: rev,
      update: rev,
    });
  }

  console.log("Database seeded successfully with authentic crochet items!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
