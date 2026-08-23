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
  { id: "cat-bags", slug: "crochet-bags", name: "Atelier Bags", tagline: "Luxury Knitted Purses & Bags", description: "Vibrant and durable handcrafted bags, carefully lined and designed with premium yarn.", image: "/images/uploaded/bag/boho-blossom-crochet-handbag_1.jpeg" },
  { id: "cat-bookmarks", slug: "crochet-bookmarks", name: "Artisan Bookmarks", tagline: "Artistic Reading Companions", description: "Charming hand-crocheted bookmarks to sit between your favorite pages.", image: "/images/uploaded/bookmarks/daisy/daisy-flower-chain-bookmark_1.jpeg" },
  { id: "cat-bouquets", slug: "crochet-bouquets", name: "Floral Bouquets", tagline: "Everlasting Hand-Knit Blooms", description: "Premium handcrafted bouquets and single-stem flowers that never fade.", image: "/images/uploaded/bouquets/bouq-1/calla-lily-elegance-bouquet_1.jpeg" },
  { id: "cat-gloves", slug: "cactus-gloves", name: "Winter Cactus Gloves", tagline: "Cozy Wool Fingerless Warmers", description: "Warm fingerless wool gloves adorned with detailed cactus embroidery.", image: "/images/uploaded/cactus-gloves/desert-cactus-fingerless-gloves_1.jpeg" },
  { id: "cat-shoes", slug: "baby-shoes", name: "Rabbit Baby Shoes", tagline: "Gentle Cotton Infant Booties", description: "Baby booties knitted with organic cotton threads and adorned with soft rabbit ears.", image: "/images/uploaded/baby-shoes/cotton-rabbit-ear-baby-booties_1.jpeg" },
  { id: "cat-covers", slug: "quran-covers", name: "Embellished Quran Covers", tagline: "Beautiful Book Sleeves", description: "Intricate hand-crocheted sleeves to protect books, Qurans, and notebooks.", image: "/images/uploaded/quran-covers/premium-quran-sleeve-with-badges_1.png" },
  { id: "cat-toys", slug: "crochet-toys", name: "Amigurumi Toys", tagline: "Hypoallergenic Soft Companions", description: "Plush sheep and chicken toys crafted with child-safe organic yarns.", image: "/images/uploaded/toys/sheep/plush-little-lamb-amigurumi_1.jpeg" },
  { id: "cat-wall", slug: "wall-hangings", name: "Woven Wall Hangings", tagline: "Artisan Fabric Wall Art", description: "Hand-embroidered meadows and mounted 3D crochet floral wall canvas frames.", image: "/images/uploaded/wall-hangings/ramadan/ramadan-mubarak-floral-crescent-wall-art_1.png" },
  { id: "cat-acc", slug: "accessories", name: "Keychain Accessories", tagline: "Charming Keyring Sleeves", description: "Flower and carrot-shaped hand-crocheted lip balm holder keychains.", image: "/images/uploaded/accessories/flower_lipstick_holder_1.jpeg" }
];

const productMappings = [
  {
    folder: 'bag',
    targetFolder: 'bag',
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
    targetFolder: 'bookmarks/daisy',
    slug: 'daisy-flower-chain-bookmark',
    name: 'Daisy Flower Chain Bookmark',
    categorySlug: 'crochet-bookmarks',
    categoryId: 'cat-bookmarks',
    category: 'Artisan Bookmarks',
    priceFrom: 45,
    leadTimeDays: '1–2 days',
    shortDescription: 'Delicate floral bookmark hand-knitted for book lovers.',
    description: 'A delicate, hand-crocheted daisy chain bookmark that brings a touch of spring to your reading. Made with high-quality soft cotton threads.',
    options: [],
    imagePriority: ['3.42.13 PM (1)', '3.42.13 PM (2)', '3.42.12 PM.jpeg', '3.42.12 PM (1)', '3.42.13 PM.jpeg']
  },
  {
    folder: 'بوك ماركس/بوك مارك 2',
    targetFolder: 'bookmarks/blossom',
    slug: 'scalloped-blossom-crochet-bookmark',
    name: 'Scalloped Blossom Crochet Bookmark',
    categorySlug: 'crochet-bookmarks',
    categoryId: 'cat-bookmarks',
    category: 'Artisan Bookmarks',
    priceFrom: 35,
    leadTimeDays: '1–2 days',
    shortDescription: 'Intricately crocheted blossom chain bookmark with scalloped edges and tassels.',
    description: 'An intricately crocheted blossom chain bookmark featuring multi-colored granny square details, a delicate scalloped border, and a vibrant hanging tassel.',
    options: [],
    imagePriority: ['3.42.14 PM (1)', '3.39.16 PM', '3.42.13 PM (3)', 'ff3609b9']
  },
  {
    folder: 'جوانتي صبارة',
    targetFolder: 'cactus-gloves',
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
    targetFolder: 'baby-shoes',
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
    targetFolder: 'quran-covers',
    slug: 'premium-quran-sleeve-with-badges',
    name: 'Premium Quran Sleeve with Quranic Badges',
    categorySlug: 'quran-covers',
    categoryId: 'cat-covers',
    category: 'Embellished Quran Covers',
    priceFrom: 220,
    leadTimeDays: '4–5 days',
    shortDescription: 'Beautiful hand-crocheted sleeve for protecting Qurans and books.',
    description: 'A beautifully hand-crocheted protective sleeve for your Quran, decorated with three wooden badges (Hifdh, Tilawah, Muraja\'ah) and a matching bow closure.',
    options: []
  },
  {
    folder: 'لعب/لعب خراف',
    targetFolder: 'toys/sheep',
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
    targetFolder: 'toys/chicken',
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
    targetFolder: 'wall-hangings/ramadan',
    slug: 'ramadan-mubarak-floral-crescent-wall-art',
    name: 'Ramadan Mubarak Floral Crescent Wall Art',
    categorySlug: 'wall-hangings',
    categoryId: 'cat-wall',
    category: 'Woven Wall Hangings',
    priceFrom: 450,
    leadTimeDays: '7–10 days',
    shortDescription: 'Beautiful canvas featuring a crochet floral crescent moon and Ramadan calligraphy.',
    description: 'A stunning handmade wall canvas displaying a vibrant crescent moon arrangement of crochet flowers paired with wooden Arabic calligraphy reading "Ramadan Mubarak".',
    options: []
  },
  {
    folder: 'لوح/لوحة 2',
    targetFolder: 'wall-hangings/coffee-sign',
    slug: 'crochet-floral-coffee-shop-sign',
    name: 'Crochet Floral Coffee Shop Sign',
    categorySlug: 'wall-hangings',
    categoryId: 'cat-wall',
    category: 'Woven Wall Hangings',
    priceFrom: 380,
    leadTimeDays: '5–7 days',
    shortDescription: 'Charming wooden cafe sign with crocheted Coffee lettering and flowers.',
    description: 'A charming handmade wooden sign featuring crocheted "Coffee" lettering, borders of vibrant sunflowers, and delicate floral accents, ideal for home coffee stations or local cafes.',
    options: []
  },
  // Bouquets
  {
    folder: 'بوكيهات/lily fl',
    targetFolder: 'bouquets/lily-fl',
    slug: 'blushing-lily-lavender-bouquet',
    name: 'Blushing Lily & Lavender Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 110,
    leadTimeDays: '2–3 days',
    shortDescription: 'Handcrafted mixed bouquet featuring lilies and lavender spikes.',
    description: 'A stunning hand-crocheted mixed bouquet featuring pink and purple lilies, lavender spikes, and white accent blossoms.',
    options: []
  },
  {
    folder: 'بوكيهات/lily fl 2',
    targetFolder: 'bouquets/lily-fl-2',
    slug: 'pastel-purple-lily-single-stem',
    name: 'Pastel Purple Lily Single Stem',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 120,
    leadTimeDays: '2–3 days',
    shortDescription: 'Pastel purple lily blossom wrapped in translucent tulle.',
    description: 'A beautiful hand-crocheted single stem of a pastel purple lily with a single leaf, wrapped in premium translucent tulle.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه',
    targetFolder: 'bouquets/bouq-1',
    slug: 'calla-lily-elegance-bouquet',
    name: 'Calla Lily Elegance Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 480,
    leadTimeDays: '4–6 days',
    shortDescription: 'Everlasting mixed bouquet featuring hand-knitted calla lilies.',
    description: 'A gorgeous mixed bouquet featuring hand-crocheted calla lilies (زنبق الكالا) wrapped in premium textured paper with a white ribbon.',
    options: [],
    featured: true,
    badge: 'Popular'
  },
  {
    folder: 'بوكيهات/بوكيه 2',
    targetFolder: 'bouquets/bouq-2',
    slug: 'sunny-tulip-daisy-bouquet',
    name: 'Sunny Tulip & Daisy Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 350,
    leadTimeDays: '3–5 days',
    shortDescription: 'Cheerful mixed bouquet with yellow tulips and daisies.',
    description: 'A cheerful mixed bouquet featuring yellow and white tulips combined with white daisies, bound in clean white paper and ribbon.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه 4',
    targetFolder: 'bouquets/bouq-4',
    slug: 'purple-rose-lavender-bouquet',
    name: 'Purple Rose & Lavender Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 420,
    leadTimeDays: '3–5 days',
    shortDescription: 'Stunning mixed bouquet with purple roses and lavender.',
    description: 'A premium mixed bouquet featuring hand-knitted purple roses, carnations, and lavender spikes.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه 5',
    targetFolder: 'bouquets/bouq-5',
    slug: 'sky-blue-forget-me-not-bouquet',
    name: 'Sky Blue Forget-Me-Not Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 390,
    leadTimeDays: '3–5 days',
    shortDescription: 'Sweet forget-me-not and white daisy bouquet.',
    description: 'A beautiful mixed bouquet of sky-blue forget-me-nots and white daisies wrapped in delicate light blue tulle.',
    options: []
  },
  {
    folder: 'بوكيهات/بوكيه3',
    targetFolder: 'bouquets/bouq-3',
    slug: 'graceful-heart-lily-bouquet',
    name: 'Graceful Heart & Lily Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 320,
    leadTimeDays: '2–3 days',
    shortDescription: 'Charming bouquet with calla lilies and heart ornament.',
    description: 'A gorgeous bouquet featuring hand-crocheted calla lilies, a white cosmos flower, and a cream-colored heart ornament.',
    options: []
  },
  {
    folder: 'بوكيهات/توليب',
    targetFolder: 'bouquets/tulip-1',
    slug: 'pastel-purple-tulip-potted-plant',
    name: 'Pastel Purple Tulip Potted Plant',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 60,
    leadTimeDays: '1–2 days',
    shortDescription: 'Sweet crochet potted plant with three purple tulips.',
    description: 'A sweet crochet potted plant with three lavender/purple tulips, potted in a white knitted cup with a pink bow.',
    options: []
  },
  {
    folder: 'بوكيهات/توليب2',
    targetFolder: 'bouquets/tulip-2',
    slug: 'graceful-white-tulip-bouquet',
    name: 'Graceful White Tulip Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 110,
    leadTimeDays: '2 days',
    shortDescription: 'Wrapped bouquet featuring three white tulips.',
    description: 'A beautiful hand-crocheted bunch of three white tulips wrapped in premium translucent paper.',
    options: []
  },
  {
    folder: 'بوكيهات/ورد جوري',
    targetFolder: 'bouquets/rose-jouri',
    slug: 'velvet-red-rose-bouquet',
    name: 'Velvet Red Rose Bouquet',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 90,
    leadTimeDays: '2 days',
    shortDescription: 'Classic bunch of three deep red roses tied with a ribbon.',
    description: 'A classic bunch of three deep red roses tied together with a velvet ribbon.',
    options: []
  },
  {
    folder: 'بوكيهات/ورد دوار',
    targetFolder: 'bouquets/sunflower',
    slug: 'sunny-sunflower-wrapped-stem',
    name: 'Sunny Sunflower Wrapped Stem',
    categorySlug: 'crochet-bouquets',
    categoryId: 'cat-bouquets',
    category: 'Floral Bouquets',
    priceFrom: 290,
    leadTimeDays: '2–3 days',
    shortDescription: 'Single sunflower wrapped stem with leaf detail.',
    description: 'A single large hand-knitted sunflower wrapped in custom newspaper wrapping with a white ribbon.',
    options: []
  }
];

async function run() {
  console.log("Starting database cleanup and restructuring with URL-safe filenames...");

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
      image: cat.image
    };
    await prisma.category.create({ data: formattedCategory });
  }
  console.log("Categories seeded!");

  // 3. Process image files and seed products
  for (const mapping of productMappings) {
    const productFolderPath = path.join(SOURCE_DIR, mapping.folder);
    const targetFolderRelative = `/images/uploaded/${mapping.targetFolder}`;
    const targetFolderPath = path.join(TARGET_DIR, mapping.targetFolder);

    ensureDirExists(targetFolderPath);

    const imagesList = [];

    if (fs.existsSync(productFolderPath)) {
      let files = fs.readdirSync(productFolderPath);
      
      // Sort files based on imagePriority if defined
      if (mapping.imagePriority) {
        files.sort((a, b) => {
          const aIndex = mapping.imagePriority.findIndex(term => a.includes(term));
          const bIndex = mapping.imagePriority.findIndex(term => b.includes(term));
          const aScore = aIndex === -1 ? 999 : aIndex;
          const bScore = bIndex === -1 ? 999 : bIndex;
          return aScore - bScore;
        });
      }

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
      
      // Determine if image contains flower (previously mapped to carrot due to swap)
      const isFlower = file.includes('3.36.27') || file.includes('3.39.18');
      
      if (isFlower) {
        const newFileName = `flower_lipstick_holder_${fIdx}${ext}`;
        const destFilePath = path.join(targetFolderPath, newFileName);
        copyFile(srcFilePath, destFilePath);
        flowerImages.push(`${targetFolderRelative}/${newFileName}`);
        fIdx++;
      } else {
        const newFileName = `carrot_lipstick_holder_${cIdx}${ext}`;
        const destFilePath = path.join(targetFolderPath, newFileName);
        copyFile(srcFilePath, destFilePath);
        carrotImages.push(`${targetFolderRelative}/${newFileName}`);
        cIdx++;
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
