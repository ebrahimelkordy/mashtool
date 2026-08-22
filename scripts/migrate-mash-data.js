import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const SOURCE_DIR = path.join(__dirname, '../mash-data');
const TARGET_DIR = path.join(__dirname, '../public/images/uploaded');

// Helpers for file copying
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

const categoryMappings = [
  { id: "cat-bags", slug: "crochet-bags", name: "Atelier Bags", tagline: "Luxury Knitted Purses & Bags", description: "Vibrant and durable handcrafted bags, carefully lined and designed with premium yarn." },
  { id: "cat-bookmarks", slug: "crochet-bookmarks", name: "Artisan Bookmarks", tagline: "Artistic Reading Companions", description: "Charming hand-crocheted bookmarks to sit between your favorite pages." },
  { id: "cat-bouquets", slug: "crochet-bouquets", name: "Floral Bouquets", tagline: "Everlasting Hand-Knit Blooms", description: "Premium handcrafted bouquets and single-stem flowers that never fade." },
  { id: "cat-gloves", slug: "cactus-gloves", name: "Winter Cactus Gloves", tagline: "Cozy Wool Fingerless Warmers", description: "Warm fingerless wool gloves adorned with detailed cactus embroidery." },
  { id: "cat-shoes", slug: "baby-shoes", name: "Rabbit Baby Shoes", tagline: "Gentle Cotton Infant Booties", description: "Baby booties knitted with organic cotton threads and adorned with soft rabbit ears." },
  { id: "cat-covers", slug: "quran-covers", name: "Embellished Quran Covers", tagline: "Beautiful Book Sleeves", description: "Intricate hand-crocheted sleeves to protect books, Qurans, and notebooks." },
  { id: "cat-toys", slug: "crochet-toys", name: "Amigurumi Toys", tagline: "Hypoallergenic Soft Companions", description: "Plush sheep and chicken toys crafted with child-safe organic yarns." },
  { id: "cat-wall", slug: "wall-hangings", name: "Woven Wall Hangings", tagline: "Artisan Fabric Wall Art", description: "Hand-embroidered meadows and mounted 3D crochet floral wall canvas frames." },
  { id: "cat-acc", slug: "accessories", name: "Keychain Accessories", tagline: "Charming Keyring Sleeves", description: "Flower and carrot-shaped hand-crocheted lip balm holder keychains." }
];

const productMappings = [
  {
    folder: 'bag',
    slug: 'boho-blossom-crochet-handbag',
    name: 'Boho Blossom Crochet Handbag',
    categorySlug: 'crochet-bags',
    categoryId: 'cat-bags',
    category: 'Atelier Bags',
    priceFrom: 380,
    leadTimeDays: '5–7 days',
    shortDescription: 'A beautifully hand-knitted bohemian bag featuring vibrant floral patterns.',
    description: 'A beautifully hand-knitted bohemian bag featuring vibrant floral patterns, a secure handle, and premium lining. Perfect for adding a warm, vintage charm to your daily look.',
    options: [],
    badge: 'New Arrival',
    featured: true
  },
  {
    folder: 'بوك ماركس/بوك مارك',
    slug: 'daisy-flower-chain-bookmark',
    name: 'Daisy Flower Chain Bookmark',
    categorySlug: 'crochet-bookmarks',
    categoryId: 'cat-bookmarks',
    category: 'Artisan Bookmarks',
    priceFrom: 45,
    leadTimeDays: '1–2 days',
    shortDescription: 'Delicate floral bookmark hand-knitted for book lovers.',
    description: 'A delicate, hand-crocheted daisy chain bookmark that brings a touch of spring to your reading. Made with high-quality soft cotton threads.',
    options: []
  },
  {
    folder: 'بوك ماركس/بوك مارك 2',
    slug: 'sprout-seedling-book-marker',
    name: 'Sprout Seedling Book Marker',
    categorySlug: 'crochet-bookmarks',
    categoryId: 'cat-bookmarks',
    category: 'Artisan Bookmarks',
    priceFrom: 35,
    leadTimeDays: '1–2 days',
    shortDescription: 'Adorable seedling bookmark that pops out of your pages.',
    description: 'An adorable little green sprout bookmark that sits playfully between your book pages. Handcrafted with fine cotton yarn.',
    options: []
  },
  {
    folder: 'جوانتي صبارة',
    slug: 'desert-cactus-fingerless-gloves',
    name: 'Desert Cactus Fingerless Gloves',
    categorySlug: 'cactus-gloves',
    categoryId: 'cat-gloves',
    category: 'Winter Cactus Gloves',
    priceFrom: 180,
    leadTimeDays: '3–5 days',
    shortDescription: 'Cozy wool fingerless gloves with custom cactus embroidery.',
    description: 'Cozy fingerless gloves handcrafted with premium soft wool, decorated with a cute hand-embroidered cactus motif. Perfect for keeping your hands warm while retaining finger mobility.',
    options: []
  },
  {
    folder: 'حذاء رضع باذن ارنب',
    slug: 'cotton-rabbit-ear-baby-booties',
    name: 'Cotton Rabbit-Ear Baby Booties',
    categorySlug: 'baby-shoes',
    categoryId: 'cat-shoes',
    category: 'Rabbit Baby Shoes',
    priceFrom: 150,
    leadTimeDays: '3–4 days',
    shortDescription: 'Charming cotton baby shoes featuring bunny ears.',
    description: 'Ultra-soft, hand-knitted baby shoes featuring charming rabbit ears and a comfortable secure fit. Crafted with premium organic cotton yarn that is gentle on infant skin.',
    options: []
  },
  {
    folder: 'كفر مصحف',
    slug: 'elegant-floral-quran-sleeve',
    name: 'Elegant Floral Quran Sleeve',
    categorySlug: 'quran-covers',
    categoryId: 'cat-covers',
    category: 'Embellished Quran Covers',
    priceFrom: 220,
    leadTimeDays: '4–5 days',
    shortDescription: 'Beautiful hand-crocheted sleeve for protecting Qurans and books.',
    description: 'A beautifully hand-crocheted protective sleeve for books and Qurans, decorated with intricate pastel rose patterns and matching borders. Designed with premium thick cotton yarn for maximum durability.',
    options: []
  },
  {
    folder: 'لعب/لعب خراف',
    slug: 'plush-little-lamb-amigurumi',
    name: 'Plush Little Lamb Amigurumi',
    categorySlug: 'crochet-toys',
    categoryId: 'cat-toys',
    category: 'Amigurumi Toys',
    priceFrom: 180,
    leadTimeDays: '3–4 days',
    shortDescription: 'Soft cuddly hand-knitted little sheep plush toy.',
    description: 'A soft, cuddly hand-knitted little sheep toy, perfect for nursery decor or as a gentle companion for children. Crafted with hypoallergenic plush yarn.',
    options: []
  },
  {
    folder: 'لعب/لعب دجاج',
    slug: 'cute-clucking-chicken-plushie',
    name: 'Cute Clucking Chicken Plushie',
    categorySlug: 'crochet-toys',
    categoryId: 'cat-toys',
    category: 'Amigurumi Toys',
    priceFrom: 120,
    leadTimeDays: '2–3 days',
    shortDescription: 'Adorable baby-safe chicken amigurumi plush toy.',
    description: 'An adorable hand-knitted chicken amigurumi featuring cute wings and stitched details. Handcrafted with baby-safe soft yarn.',
    options: []
  },
  {
    folder: 'لوح/لوحة',
    slug: 'embroidered-meadow-landscape-wall-hanging',
    name: 'Embroidered Meadow Landscape Wall Hanging',
    categorySlug: 'wall-hangings',
    categoryId: 'cat-wall',
    category: 'Woven Wall Hangings',
    priceFrom: 450,
    leadTimeDays: '7–10 days',
    shortDescription: 'Stunning hand-embroidered landscape frame.',
    description: 'A stunning hand-embroidered canvas depicting a flower meadow, framed with custom wood elements. Adds a gorgeous, rustic touch of nature to your living space.',
    options: []
  },
  {
    folder: 'لوح/لوحة 2',
    slug: 'floral-blossom-framed-woven-art',
    name: 'Floral Blossom Framed Woven Art',
    categorySlug: 'wall-hangings',
    categoryId: 'cat-wall',
    category: 'Woven Wall Hangings',
    priceFrom: 380,
    leadTimeDays: '5–7 days',
    shortDescription: 'Delicate framed canvas of 3D crochet flowers.',
    description: 'A delicate arrangement of 3D crochet flowers mounted on canvas and beautifully framed. A unique artisan piece for contemporary home decor.',
    options: []
  },
  // Bouquets
  {
    folder: 'بوكيهات/lily fl',
    slug: 'gilded-white-lily-stem',
    name: 'Gilded White Lily Stem',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 110,
    leadTimeDays: '2–3 days',
    shortDescription: 'Handcrafted white lily blossom on a bendable green stem.',
    description: 'An elegant, handcrafted white lily blossom on a bendable green stem. Designed with high-quality cotton thread.',
    options: []
  },
  {
    folder: 'بوكيهات/lily fl 2',
    slug: 'pastel-lily-leaf-stem',
    name: 'Pastel Lily & Leaf Stem',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 120,
    leadTimeDays: '2–3 days',
    shortDescription: 'Soft pastel lily blossom with green leaf accents.',
    description: 'A soft pastel lily blossom complete with intricate green leaves, perfect for standalone decoration or custom arrangements.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه',
    slug: 'royal-tulip-blossom-bouquet',
    name: 'Royal Tulip & Blossom Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 480,
    leadTimeDays: '4–6 days',
    shortDescription: 'Luxurious bouquet featuring hand-knitted tulips and blossoms.',
    description: 'A luxurious mixed bouquet featuring hand-knitted tulips and baby\'s breath accents, wrapped in elegant kraft paper.',
    options: [],
    featured: true,
    badge: 'Popular'
  },
  {
    folder: 'بوكيهات/بوكيه 2',
    slug: 'meadow-wildflower-arrangement',
    name: 'Meadow Wildflower Arrangement',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 350,
    leadTimeDays: '3–5 days',
    shortDescription: 'Vibrant collection of field flowers and green stems.',
    description: 'A vibrant collection of field flowers and green stems, knitted by hand to capture the spirit of a summer meadow.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه 4',
    slug: 'crimson-rose-eucalyptus-bunch',
    name: 'Crimson Rose & Eucalyptus Bunch',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 420,
    leadTimeDays: '3–5 days',
    shortDescription: 'Handheld bouquet of crimson roses and sage eucalyptus.',
    description: 'A premium handheld bunch of crimson red roses offset by delicate sage-green eucalyptus leaves.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه 5',
    slug: 'blushing-rose-handheld-bouquet',
    name: 'Blushing Rose Handheld Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 390,
    leadTimeDays: '3–5 days',
    shortDescription: 'Romantic bouquet of blushing pink roses in soft tulle.',
    description: 'A sweet, romantic bouquet of blushing pink roses wrapped in soft tulle and kraft paper.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه3',
    slug: 'ethereal-lavender-lily-bouquet',
    name: 'Ethereal Lavender & Lily Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 320,
    leadTimeDays: '2–3 days',
    shortDescription: 'Calming arrangement of lavender spikes and pastel lilies.',
    description: 'A calming arrangement of lavender spikes and pastel lilies, creating a serene artistic display.',
    options: []
  },
  {
    folder: 'بوكيهات/توليب',
    slug: 'single-classic-tulip-stem',
    name: 'Single Classic Tulip Stem',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 60,
    leadTimeDays: '1–2 days',
    shortDescription: 'Single tulip stem in your choice of pastel colors.',
    description: 'A single everlasting tulip stem in your choice of pastel colors. Perfect for desktop bud vases.',
    options: []
  },
  {
    folder: 'بوكيهات/توليب2',
    slug: 'double-pastel-tulip-bouquet',
    name: 'Double Pastel Tulip Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 110,
    leadTimeDays: '2 days',
    shortDescription: 'Pair of hand-knitted tulips bound in textured wrapping.',
    description: 'A pairing of two hand-knitted tulips bound in textured paper wrapping.',
    options: []
  },
  {
    folder: 'بوكيهات/ورد جوري',
    slug: 'velvet-red-rose-stem',
    name: 'Velvet Red Rose Stem',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 90,
    leadTimeDays: '2 days',
    shortDescription: 'Classic deep red rose stem handcrafted with soft yarn.',
    description: 'A classic deep red rose stem handcrafted with velvet-soft premium threads.',
    options: []
  },
  {
    folder: 'بوكيهات/ورد دوار',
    slug: 'bright-sunflower-daisy-bouquet',
    name: 'Bright Sunflower & Daisy Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 290,
    leadTimeDays: '2–3 days',
    shortDescription: 'Vibrant yellow sunflowers and delicate white daisies.',
    description: 'A cheerful combination of bright yellow sunflowers and delicate white daisies.',
    options: []
  }
];

async function run() {
  console.log("Starting database cleanup and restructuring...");

  // 1. Delete all reviews, products, and categories
  await prisma.review.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});

  console.log("Database cleared successfully!");

  // 2. Insert new categories
  for (const cat of categoryMappings) {
    const formattedCategory = {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      tagline: cat.tagline,
      description: cat.description,
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1200&auto=format&fit=crop" // Default elegant cover
    };
    await prisma.category.create({ data: formattedCategory });
  }
  console.log("Categories seeded!");

  // 3. Process image files and seed products
  for (const mapping of productMappings) {
    const productFolderPath = path.join(SOURCE_DIR, mapping.folder);
    const targetFolderRelative = `/images/uploaded/${mapping.folder}`;
    const targetFolderPath = path.join(TARGET_DIR, mapping.folder);

    ensureDirExists(targetFolderPath);

    const imagesList = [];

    if (fs.existsSync(productFolderPath)) {
      const files = fs.readdirSync(productFolderPath);
      let idx = 1;
      for (const file of files) {
        if (file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')) {
          const extension = path.extname(file);
          const newFileName = `${mapping.slug}_${idx}${extension}`;
          const srcFilePath = path.join(productFolderPath, file);
          const destFilePath = path.join(targetFolderPath, newFileName);

          copyFile(srcFilePath, destFilePath);
          imagesList.push(`${targetFolderRelative}/${newFileName}`);
          idx++;
        }
      }
    }

    if (imagesList.length === 0) {
      imagesList.push("https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1200&auto=format&fit=crop");
    }

    const newProduct = {
      slug: mapping.slug,
      name: mapping.name,
      categoryId: mapping.categoryId,
      category: mapping.category,
      categorySlug: mapping.categorySlug,
      priceFrom: mapping.priceFrom,
      leadTimeDays: mapping.leadTimeDays,
      shortDescription: mapping.shortDescription,
      description: mapping.description,
      images: imagesList,
      options: mapping.options || [],
      featured: mapping.featured || false,
      badge: mapping.badge || null,
      active: true
    };

    await prisma.product.create({ data: newProduct });
    console.log(`Seeded product: ${mapping.name} with ${imagesList.length} image(s).`);
  }

  // 4. Custom keychains seeding (Carrot vs Flower Lipstick Holders)
  const keychainFolderPath = path.join(SOURCE_DIR, 'ليب ستيك هولدرز');
  const targetFolderRelative = `/images/uploaded/accessories`;
  const targetFolderPath = path.join(TARGET_DIR, 'accessories');

  ensureDirExists(targetFolderPath);

  const flowerImages = [];
  const carrotImages = [];

  if (fs.existsSync(keychainFolderPath)) {
    const files = fs.readdirSync(keychainFolderPath);
    let fIdx = 1;
    let cIdx = 1;
    for (const file of files) {
      const ext = path.extname(file);
      const srcFilePath = path.join(keychainFolderPath, file);
      
      // Determine if image contains carrot or flower
      // In Arabic: "الجزر ما تخليش حاجة. الورد ممكن تخليه ألوان."
      // Since it's a mix, we can split them 50/50 or by specific keywords if present
      const isCarrot = file.includes('3.36.27') || file.includes('3.39.18');
      
      if (isCarrot) {
        const newFileName = `carrot_lipstick_holder_${cIdx}${ext}`;
        const destFilePath = path.join(targetFolderPath, newFileName);
        copyFile(srcFilePath, destFilePath);
        carrotImages.push(`${targetFolderRelative}/${newFileName}`);
        cIdx++;
      } else {
        const newFileName = `flower_lipstick_holder_${fIdx}${ext}`;
        const destFilePath = path.join(targetFolderPath, newFileName);
        copyFile(srcFilePath, destFilePath);
        flowerImages.push(`${targetFolderRelative}/${newFileName}`);
        fIdx++;
      }
    }
  }

  if (flowerImages.length === 0) flowerImages.push("https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop");
  if (carrotImages.length === 0) carrotImages.push("https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop");

  // Seeding Flower Lipstick Holder
  await prisma.product.create({
    data: {
      slug: 'flower-lipstick-holder-keyring',
      name: 'Flower Lipstick Holder Keyring',
      categoryId: 'cat-acc',
      category: 'Keychain Accessories',
      categorySlug: 'accessories',
      priceFrom: 35,
      leadTimeDays: '1–2 days',
      shortDescription: 'Charming flower-shaped keyring sleeve for your lipstick.',
      description: 'A charming, hand-crocheted lipstick holder keyring that keeps your lip balm safe and accessible. Styled as a blooming flower. Available in various custom colors.',
      images: flowerImages,
      options: [
        {
          id: 'opt-color',
          name: 'Color Choice',
          required: true,
          values: [
            { id: 'v-pink', label: 'Blush Pink', priceDelta: 0 },
            { id: 'v-green', label: 'Sage Green', priceDelta: 0 },
            { id: 'v-lavender', label: 'Lavender Purple', priceDelta: 0 },
            { id: 'v-yellow', label: 'Buttercup Yellow', priceDelta: 0 },
            { id: 'v-blue', label: 'Pastel Blue', priceDelta: 0 }
          ]
        }
      ],
      featured: true,
      active: true
    }
  });
  console.log("Seeded Flower Lipstick Holder Keyring!");

  // Seeding Carrot Lipstick Holder
  await prisma.product.create({
    data: {
      slug: 'cute-carrot-lipstick-holder-keyring',
      name: 'Cute Carrot Lipstick Holder Keyring',
      categoryId: 'cat-acc',
      category: 'Keychain Accessories',
      categorySlug: 'accessories',
      priceFrom: 35,
      leadTimeDays: '1–2 days',
      shortDescription: 'Adorable carrot-shaped hand-crocheted lip balm holder keyring.',
      description: 'An adorable carrot-shaped hand-crocheted sleeve designed to hold lipstick or lip balm. Attaches easily to bags or keys.',
      images: carrotImages,
      options: [],
      featured: false,
      active: true
    }
  });
  console.log("Seeded Cute Carrot Lipstick Holder Keyring!");

  console.log("Database successfully populated with clean crochet inventory!");
  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
