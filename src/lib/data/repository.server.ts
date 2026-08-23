/**
 * DATA ACCESS LAYER (SUPABASE INTEGRATION)
 * ----------------------------------------
 * All data operations read and write to Supabase PostgreSQL database & Storage.
 * If Supabase is not configured yet, it gracefully falls back to local memory store.
 */
import wallArt from "@/assets/wall-art.jpg";
import macrame from "@/assets/macrame-wall.jpg";
import cords from "@/assets/cords-shadow.jpg";
import herbBag from "@/assets/herb-bag.jpg";
import roseThrow from "@/assets/rose-throw.jpg";
import heroDrape from "@/assets/hero-drape.jpg";
import threads from "@/assets/threads.jpg";
import artisanHands from "@/assets/artisan-hands.jpg";
import fs from "fs";
import path from "path";

import { supabase, getSupabaseClient } from "./supabase.server";
import { prismaDb } from "./prisma.server";
import type {
  Category,
  DashboardStats,
  Message,
  Order,
  OrderStatus,
  Product,
  ProductOption,
  SelectedOption,
  Settings,
  StoredFile,
  Testimonial,
} from "./types";
import { ORDER_STATUSES } from "./types";

export const heroImage = heroDrape;

// Prisma is active — reads/writes go directly to PostgreSQL via Prisma Data Platform
function isSupabaseReady(): boolean {
  return false; // Supabase disabled; using Prisma instead
}

// Prisma availability check
function isPrismaReady(): boolean {
  return true;
}

// Automatic retry helper for serverless database proxies that reset idle connections
async function withPrismaRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const msg: string = err?.message ?? '';
    const code: string = err?.code ?? '';
    const isRetryable =
      code === 'P1017' ||
      code === 'P1001' ||
      msg.includes('Connection terminated') ||
      msg.includes('ConnectionClosed') ||
      msg.includes('closed the connection') ||
      msg.includes('socket') ||
      msg.includes('timeout') ||
      msg.includes('ECONNRESET') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('connection pool');
    if (isRetryable) {
      console.warn('Prisma connection issue, retrying in 500ms...', code || msg.slice(0, 80));
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await fn();
    }
    throw err;
  }
}

/* ----------------------------- In-Memory Fallback ---------------------------- */
type Store = {
  categories: Category[];
  products: Product[];
  orders: Order[];
  messages: Message[];
  testimonials: Testimonial[];
  files: Map<string, StoredFile>;
  settings: Settings;
};

function seed(): Store {
  const categories: Category[] = [
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

  const products: Product[] = [
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    categories,
    products,
    orders: [],
    messages: [],
    testimonials: [
      {
        id: "t1",
        name: "Yasmine K.",
        initials: "YK",
        quote: "The rose bouquet is stunning! My mother was so happy with it. Excellent knitting quality.",
        rating: 5,
      },
      {
        id: "t2",
        name: "Farida A.",
        initials: "FA",
        quote: "Delicate and cute tulip pot. It sits on my desk and makes me smile every morning. Thank you Mashtool!",
        rating: 5,
      },
      {
        id: "t3",
        name: "Nour M.",
        initials: "NM",
        quote: "The boho tote bag exceeded my expectations. Very durable and beautiful details!",
        rating: 5,
      },
    ],
    files: new Map(),
    settings: {
      adminNotificationEmail: process.env["ADMIN_EMAIL"] || "mashtool0@gmail.com",
      whatsappNumber: "+201117252662",
      whatsappDisplay: "+20 11 1725 2662",
      contactEmail: "mashtool0@gmail.com",
      instagramUrl: "@mashtool.atelier",
      addressLine: "Cairo, Egypt",
      instapayHandle: "mashtool@instapay",
      vodafoneCashNumber: "01117252662",
      updatedAt: new Date().toISOString(),
    },
  };
}

const globalRef = globalThis as unknown as { __mysticLoomStore?: Store };
const memStore: Store = (globalRef.__mysticLoomStore = seed());
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const uid = () => Math.random().toString(36).slice(2, 10);

/* --------------------------------- Storage / Files --------------------------------- */

export async function saveFile(input: {
  fileName: string;
  contentType: string;
  base64: string;
}): Promise<StoredFile> {
  const id = uid() + uid();
  const buffer = Buffer.from(input.base64, "base64");

  // 1. Try Supabase Storage if client is available
  const supabaseClient = getSupabaseClient();
  if (supabaseClient) {
    try {
      const filePath = `uploads/${id}_${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data: uploadData, error: uploadErr } = await supabaseClient.storage
        .from("product-images")
        .upload(filePath, buffer, {
          contentType: input.contentType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabaseClient.storage
          .from("product-images")
          .getPublicUrl(filePath);

        return {
          id,
          fileName: input.fileName,
          contentType: input.contentType,
          base64: "",
          size: buffer.length,
          url: publicUrlData.publicUrl,
          createdAt: new Date().toISOString(),
        };
      } else {
        console.warn("Supabase upload error, trying local filesystem:", uploadErr);
      }
    } catch (err) {
      console.warn("Supabase storage exception, trying local filesystem:", err);
    }
  }

  // 2. Try local filesystem if process.cwd() is available
  if (typeof process !== "undefined" && process.cwd) {
    try {
      const uploadDir = path.join(process.cwd(), "public/images/uploaded/dashboard");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileExt = input.contentType.split("/")[1] || "png";
      const fileName = `${id}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      
      return {
        id,
        fileName: input.fileName,
        contentType: input.contentType,
        base64: "",
        size: buffer.length,
        url: `/images/uploaded/dashboard/${fileName}`,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("Local file save failed, using base64 fallback:", err);
    }
  }

  // 3. Absolute fallback: Base64 data URL
  const dataUrl = `data:${input.contentType};base64,${input.base64}`;
  const file: StoredFile = {
    id,
    fileName: input.fileName,
    contentType: input.contentType,
    base64: input.base64,
    size: buffer.length,
    url: dataUrl,
    createdAt: new Date().toISOString(),
  };
  memStore.files.set(id, file);
  return { ...file };
}

export async function getFile(id: string): Promise<StoredFile | null> {
  return memStore.files.get(id) ?? null;
}

/* ---------------------------------- Reads --------------------------------- */

/** Wrap any promise with a timeout; rejects with 'TIMEOUT' symbol if exceeded */
const TIMEOUT = Symbol('TIMEOUT');
async function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T | typeof TIMEOUT> {
  return Promise.race([
    promise,
    new Promise<typeof TIMEOUT>((res) => setTimeout(() => res(TIMEOUT), ms)),
  ]);
}

export async function listCategories(opts?: { featuredOnly?: boolean }): Promise<Category[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() =>
        prismaDb.category.findMany({
          where: opts?.featuredOnly ? { featured: true } : {},
          orderBy: { createdAt: "asc" },
        }),
      );
      if (rows && rows.length > 0) {
        return rows.map((c: { id: string; slug: string; name: string; tagline: string; description: string; image: string; featured?: boolean }) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline,
          description: c.description,
          image: c.image,
          featured: c.featured ?? false,
        }));
      }
    } catch (err) {
      console.error("Prisma error in listCategories:", err);
    }
  }
  if (isSupabaseReady()) {
    try {
      let query = supabase.from("categories").select("*");
      if (opts?.featuredOnly) query = query.eq("featured", true);
      const result = await withTimeout(query);
      if (result === TIMEOUT) throw new Error("Supabase timeout");
      const { data, error } = result as { data: any; error: any };
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline || "",
          description: c.description || "",
          image: c.image || "",
          featured: c.featured ?? false,
        }));
      }
    } catch (err) {
      console.error("Supabase query error in listCategories:", err);
    }
  }
  const all = memStore.categories;
  if (opts?.featuredOnly) {
    return clone(all.filter((c) => c.featured));
  }
  return clone(all);
}

export async function listProducts(opts?: {
  categorySlug?: string;
  featured?: boolean;
  includeInactive?: boolean;
}): Promise<Product[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() =>
        prismaDb.product.findMany({
          where: {
            ...(opts?.includeInactive ? {} : { active: true }),
            ...(opts?.categorySlug ? { categorySlug: opts.categorySlug } : {}),
            ...(opts?.featured !== undefined ? { featured: opts.featured } : {}),
          },
          orderBy: { createdAt: 'asc' },
        }),
      );
      if (rows && Array.isArray(rows)) {
        return rows.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          categoryId: (p.categoryId ?? '') as string,
          category: p.category,
          categorySlug: p.categorySlug,
          priceFrom: Number(p.priceFrom || 0),
          leadTimeDays: p.leadTimeDays || '1–2 weeks',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          images: (p.images as string[]) || [],
          options: (p.options as any[]) || [],
          featured: Boolean(p.featured),
          badge: p.badge ?? null,
          active: Boolean(p.active),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.error('Prisma error in listProducts:', err);
    }
  }

  return clone(
    memStore.products.filter(
      (p) =>
        (opts?.includeInactive || p.active) &&
        (!opts?.categorySlug || p.categorySlug === opts.categorySlug) &&
        (opts?.featured === undefined || p.featured === opts.featured),
    ),
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await listProducts({ includeInactive: true });
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await listProducts({ includeInactive: true });
  return products.find((p) => p.id === id) ?? null;
}

export async function listTestimonials(): Promise<Testimonial[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() => prismaDb.testimonial.findMany({ orderBy: { createdAt: 'asc' } }));
      if (rows && rows.length > 0) {
        return rows.map((t) => ({
          id: t.id,
          name: t.name,
          initials: t.initials || t.name.slice(0, 2).toUpperCase(),
          quote: t.quote,
          rating: t.rating,
        }));
      }
    } catch (err) {
      console.error('Prisma error in listTestimonials:', err);
    }
  }
  return clone(memStore.testimonials);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const orders = await listOrders("all");
  const found = orders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase(),
  );
  return found ?? null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await listOrders("all");
  return orders.find((o) => o.id === id) ?? null;
}

export async function listOrders(status?: OrderStatus | "all"): Promise<Order[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() =>
        prismaDb.order.findMany({
          where: status && status !== 'all' ? { status } : {},
          orderBy: { createdAt: 'desc' },
        }),
      );
      if (rows && Array.isArray(rows)) {
        return rows.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          type: o.type as 'standard' | 'bespoke',
          productId: o.productId ?? null,
          productName: o.productName ?? null,
          customerName: o.customerName,
          phone: o.phone,
          whatsapp: o.whatsapp ?? null,
          address: o.address ?? null,
          quantity: o.quantity,
          notes: o.notes ?? null,
          referenceImages: (o.referenceImages as string[]) || [],
          selectedOptions: (o.selectedOptions as any[]) || [],
          unitPrice: o.unitPrice ?? null,
          total: o.total ?? null,
          status: (o.status || 'new') as OrderStatus,
          quotedPrice: o.quotedPrice ?? null,
          paymentProofUrl: o.paymentProofUrl ?? null,
          estimatedDelivery: o.estimatedDelivery?.toISOString().split('T')[0] ?? null,
          adminNote: o.adminNote ?? null,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.error('Prisma error in listOrders:', err);
    }
  }

  const rows = memStore.orders.filter((o) => !status || status === "all" || o.status === status);
  return clone(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function listMessages(): Promise<Message[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() => prismaDb.message.findMany({ orderBy: { createdAt: 'desc' } }));
      return rows.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email ?? '',
        phone: m.phone ?? '',
        subject: m.subject,
        body: m.body,
        read: m.read,
        createdAt: m.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('Prisma error in listMessages:', err);
    }
  }

  return clone([...memStore.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/* -------------------------------- Settings -------------------------------- */

export async function getSettings(): Promise<Settings> {
  if (isPrismaReady()) {
    try {
      const s = await withPrismaRetry(() => prismaDb.setting.findUnique({ where: { id: 'main' } }));
      if (s) {
        return {
          adminNotificationEmail: memStore.settings.adminNotificationEmail,
          whatsappNumber: s.whatsapp,
          whatsappDisplay: s.whatsapp,
          contactEmail: memStore.settings.contactEmail,
          instagramUrl: s.instagram,
          addressLine: memStore.settings.addressLine,
          instapayHandle: memStore.settings.instapayHandle,
          vodafoneCashNumber: memStore.settings.vodafoneCashNumber,
          updatedAt: s.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.error('Prisma error in getSettings:', err);
    }
  }
  return clone(memStore.settings);
}

export async function updateSettings(
  patch: Partial<Omit<Settings, "updatedAt">>,
): Promise<Settings> {
  if (isPrismaReady()) {
    try {
      const s = await prismaDb.setting.upsert({
        where: { id: 'main' },
        create: { id: 'main', whatsapp: (patch as any).whatsappNumber ?? (patch as any).whatsapp ?? '', instagram: (patch as any).instagramUrl ?? (patch as any).instagram ?? '' },
        update: { whatsapp: (patch as any).whatsappNumber ?? (patch as any).whatsapp ?? undefined, instagram: (patch as any).instagramUrl ?? (patch as any).instagram ?? undefined },
      });
      const base = clone(memStore.settings);
      base.whatsappNumber = s.whatsapp;
      base.whatsappDisplay = s.whatsapp;
      base.instagramUrl = s.instagram;
      base.updatedAt = s.updatedAt.toISOString();
      return base;
    } catch (err) {
      console.error('Prisma error in updateSettings:', err);
    }
  }
  Object.assign(memStore.settings, patch, { updatedAt: new Date().toISOString() });
  return clone(memStore.settings);
}

/* --------------------------------- Writes --------------------------------- */

function nextOrderNumber(type: "standard" | "bespoke") {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `ML-${type === "bespoke" ? "B-" : ""}${stamp}-${seq}`;
}

export function resolveConfiguration(
  product: Product,
  choices: { optionId: string; valueId: string }[],
): SelectedOption[] {
  const selected: SelectedOption[] = [];
  for (const option of product.options) {
    const choice = choices.find((c) => c.optionId === option.id);
    if (!choice) {
      if (option.required) throw new Error(`MISSING_OPTION:${option.name}`);
      continue;
    }
    const value = option.values.find((v) => v.id === choice.valueId);
    if (!value) throw new Error(`INVALID_OPTION:${option.name}`);
    selected.push({
      optionId: option.id,
      optionName: option.name,
      valueId: value.id,
      valueLabel: value.label,
      priceDelta: value.priceDelta,
    });
  }
  return selected;
}

export async function createOrder(input: {
  type: "standard" | "bespoke";
  productId?: string | null;
  customerName: string;
  phone: string;
  whatsapp?: string | null;
  address?: string | null;
  quantity?: number;
  notes?: string | null;
  referenceImages?: string[];
  selectedOptions?: { optionId: string; valueId: string }[];
}): Promise<Order> {
  const products = await listProducts({ includeInactive: true });
  const product = input.productId ? products.find((p) => p.id === input.productId) ?? null : null;

  if (input.type === "standard") {
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (!product.active) throw new Error("PRODUCT_UNAVAILABLE");
  }

  const quantity = Math.max(1, Math.min(50, input.quantity ?? 1));
  const selectedOptions = product
    ? resolveConfiguration(product, input.selectedOptions ?? [])
    : [];

  const unitPrice = product
    ? product.priceFrom + selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0)
    : null;

  const orderNum = nextOrderNumber(input.type);
  const total = unitPrice === null ? null : unitPrice * quantity;
  const iso = new Date().toISOString();

  if (isPrismaReady()) {
    try {
      const created = await prismaDb.order.create({
        data: {
          orderNumber: orderNum,
          type: input.type,
          productId: product?.id ?? null,
          productName: product?.name ?? (input.type === 'bespoke' ? 'Bespoke commission' : null),
          customerName: input.customerName,
          phone: input.phone,
          whatsapp: input.whatsapp ?? null,
          address: input.address ?? null,
          quantity,
          notes: input.notes ?? null,
          referenceImages: input.referenceImages ?? [],
          selectedOptions: selectedOptions as any,
          unitPrice,
          total,
          status: 'new',
          quotedPrice: null,
        },
      });
      return {
        id: created.id,
        orderNumber: created.orderNumber,
        type: created.type as 'standard' | 'bespoke',
        productId: created.productId ?? null,
        productName: created.productName ?? null,
        customerName: created.customerName,
        phone: created.phone,
        whatsapp: created.whatsapp ?? null,
        address: created.address ?? null,
        quantity: created.quantity,
        notes: created.notes ?? null,
        referenceImages: (created.referenceImages as string[]) || [],
        selectedOptions,
        unitPrice,
        total,
        status: (created.status || 'new') as OrderStatus,
        quotedPrice: created.quotedPrice ?? null,
        paymentProofUrl: created.paymentProofUrl ?? null,
        estimatedDelivery: null,
        adminNote: created.adminNote ?? null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Prisma error in createOrder:', err);
    }
  }

  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNum,
        type: input.type,
        product_id: product?.id ?? null,
        product_name: product?.name ?? (input.type === "bespoke" ? "Bespoke commission" : null),
        customer_name: input.customerName,
        phone: input.phone,
        whatsapp: input.whatsapp ?? null,
        address: input.address ?? null,
        quantity,
        notes: input.notes ?? null,
        reference_images: input.referenceImages ?? [],
        status: "pending",
        quoted_price: total,
      })
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        orderNumber: data.order_number,
        type: data.type,
        productId: data.product_id || null,
        productName: data.product_name || null,
        customerName: data.customer_name,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        address: data.address || null,
        quantity: data.quantity || 1,
        notes: data.notes || null,
        referenceImages: data.reference_images || [],
        selectedOptions,
        unitPrice,
        total,
        status: data.status as OrderStatus,
        quotedPrice: data.quoted_price != null ? Number(data.quoted_price) : null,
        paymentProofUrl: data.payment_proof_url || null,
        estimatedDelivery: data.estimated_delivery || null,
        adminNote: data.admin_note || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      };
    }
  }

  const order: Order = {
    id: uid(),
    orderNumber: orderNum,
    type: input.type,
    productId: product?.id ?? null,
    productName: product?.name ?? (input.type === "bespoke" ? "Bespoke commission" : null),
    customerName: input.customerName,
    phone: input.phone,
    whatsapp: input.whatsapp ?? null,
    address: input.address ?? null,
    quantity,
    notes: input.notes ?? null,
    referenceImages: input.referenceImages ?? [],
    selectedOptions,
    unitPrice,
    total,
    status: "pending",
    quotedPrice: null,
    paymentProofUrl: null,
    estimatedDelivery: null,
    adminNote: null,
    createdAt: iso,
    updatedAt: iso,
  };
  memStore.orders.unshift(order);
  return clone(order);
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<Order, "status" | "quotedPrice" | "estimatedDelivery" | "adminNote" | "paymentProofUrl">
  >,
): Promise<Order | null> {
  if (isPrismaReady()) {
    try {
      await prismaDb.order.update({
        where: { id },
        data: {
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.quotedPrice !== undefined ? { quotedPrice: patch.quotedPrice, total: patch.quotedPrice } : {}),
          ...(patch.estimatedDelivery !== undefined ? { estimatedDelivery: patch.estimatedDelivery ? new Date(patch.estimatedDelivery) : null } : {}),
          ...(patch.adminNote !== undefined ? { adminNote: patch.adminNote } : {}),
          ...(patch.paymentProofUrl !== undefined ? { paymentProofUrl: patch.paymentProofUrl } : {}),
        },
      });
      return getOrderById(id);
    } catch (err) {
      console.error('Prisma error in updateOrder:', err);
    }
  }

  if (isSupabaseReady()) {
    const updateData: Record<string, unknown> = {};
    if (patch.status !== undefined) updateData["status"] = patch.status;
    if (patch.quotedPrice !== undefined) updateData["quoted_price"] = patch.quotedPrice;
    if (patch.estimatedDelivery !== undefined) updateData["estimated_delivery"] = patch.estimatedDelivery;
    if (patch.adminNote !== undefined) updateData["admin_note"] = patch.adminNote;
    if (patch.paymentProofUrl !== undefined) updateData["payment_proof_url"] = patch.paymentProofUrl;
    updateData["updated_at"] = new Date().toISOString();

    const { error } = await supabase.from("orders").update(updateData).eq("id", id);
    if (!error) return getOrderById(id);
  }

  const order = memStore.orders.find((o) => o.id === id);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: new Date().toISOString() });
  return clone(order);
}

export async function attachPaymentProof(
  orderNumber: string,
  fileUrl: string,
): Promise<Order | null> {
  if (isPrismaReady()) {
    try {
      const order = await prismaDb.order.findFirst({ where: { orderNumber } });
      if (!order) return null;
      await prismaDb.order.update({
        where: { id: order.id },
        data: { paymentProofUrl: fileUrl, status: 'paid' },
      });
      return getOrderByNumber(orderNumber);
    } catch (err) {
      console.error('Prisma error in attachPaymentProof:', err);
    }
  }

  if (isSupabaseReady()) {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_proof_url: fileUrl,
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);

    if (!error) return getOrderByNumber(orderNumber);
  }

  const order = memStore.orders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase(),
  );
  if (!order) return null;
  order.paymentProofUrl = fileUrl;
  order.status = "paid";
  order.updatedAt = new Date().toISOString();
  return clone(order);
}

export async function createMessage(input: {
  name: string;
  email: string;
  subject: string;
  body: string;
}): Promise<Message> {
  const iso = new Date().toISOString();

  if (isPrismaReady()) {
    try {
      const created = await prismaDb.message.create({
        data: {
          name: input.name,
          email: input.email,
          subject: input.subject,
          body: input.body,
          read: false,
        },
      });
      return {
        id: created.id,
        name: created.name,
        email: created.email ?? '',
        subject: created.subject,
        body: created.body,
        read: created.read,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.error('Prisma error in createMessage:', err);
    }
  }

  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        name: input.name,
        email: input.email,
        subject: input.subject,
        body: input.body,
        read: false,
      })
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        body: data.body,
        read: Boolean(data.read),
        createdAt: data.created_at,
      };
    }
  }

  const message: Message = {
    id: uid(),
    ...input,
    read: false,
    createdAt: iso,
  };
  memStore.messages.unshift(message);
  return clone(message);
}

export async function markMessageRead(id: string, read: boolean): Promise<Message | null> {
  if (isPrismaReady()) {
    try {
      await prismaDb.message.update({ where: { id }, data: { read } });
      const messages = await listMessages();
      return messages.find((m) => m.id === id) ?? null;
    } catch (err) {
      console.error('Prisma error in markMessageRead:', err);
    }
  }

  if (isSupabaseReady()) {
    const { error } = await supabase.from("messages").update({ read }).eq("id", id);
    if (!error) {
      const messages = await listMessages();
      return messages.find((m) => m.id === id) ?? null;
    }
  }

  const m = memStore.messages.find((x) => x.id === id);
  if (!m) return null;
  m.read = read;
  return clone(m);
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (isSupabaseReady()) {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (!error) return true;
  }

  const i = memStore.messages.findIndex((x) => x.id === id);
  if (i === -1) return false;
  memStore.messages.splice(i, 1);
  return true;
}

/* ----------------------------- Categories Write ----------------------------- */

export async function upsertCategory(input: {
  id?: string | null;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  image?: string;
  featured?: boolean;
}): Promise<Category> {
  const slug =
    input.slug?.trim() ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  if (isPrismaReady()) {
    try {
      if (input.id) {
        const updated = await prismaDb.category.update({
          where: { id: input.id },
          data: {
            name: input.name,
            slug,
            tagline: input.tagline ?? "",
            description: input.description ?? "",
            image: input.image ?? "",
            featured: input.featured ?? false,
          },
        });
        return { ...updated };
      } else {
        const created = await prismaDb.category.create({
          data: {
            name: input.name,
            slug,
            tagline: input.tagline ?? "",
            description: input.description ?? "",
            image: input.image ?? "",
            featured: input.featured ?? false,
          },
        });
        return { ...created };
      }
    } catch (err) {
      console.error("Prisma error in upsertCategory:", err);
      throw err;
    }
  }

  const existing = input.id ? memStore.categories.find((c) => c.id === input.id) : undefined;
  if (existing) {
    Object.assign(existing, {
      name: input.name,
      slug,
      tagline: input.tagline ?? existing.tagline,
      description: input.description ?? existing.description,
      image: input.image ?? existing.image,
      featured: input.featured ?? existing.featured ?? false,
    });
    return clone(existing);
  }

  const category: Category = {
    id: uid(),
    slug,
    name: input.name,
    tagline: input.tagline ?? "",
    description: input.description ?? "",
    image: input.image ?? "",
    featured: input.featured ?? false,
  };
  memStore.categories.push(category);
  return clone(category);
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isPrismaReady()) {
    try {
      await prismaDb.category.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("Prisma error in deleteCategory:", err);
      throw err;
    }
  }

  const idx = memStore.categories.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  memStore.categories.splice(idx, 1);
  return true;
}

/* -------------------------------- Products Write ------------------------------- */

export async function upsertProduct(input: {
  id?: string | null;
  name: string;
  slug?: string;
  categorySlug: string;
  priceFrom: number;
  leadTimeDays: string;
  shortDescription: string;
  description: string;
  images?: string[];
  options?: ProductOption[];
  featured?: boolean;
  badge?: string | null;
  active?: boolean;
}): Promise<Product> {
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === input.categorySlug) ?? categories[0]!;
  const slug =
    input.slug?.trim() ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const now = new Date().toISOString();

  if (isPrismaReady()) {
    try {
      const dataPayload = {
        name: input.name,
        slug,
        categoryId: category.id,
        category: category.name,
        categorySlug: category.slug,
        priceFrom: Number(input.priceFrom || 0),
        leadTimeDays: input.leadTimeDays,
        shortDescription: input.shortDescription,
        description: input.description,
        images: (input.images ?? []) as any,
        options: (input.options ?? []) as any,
        featured: input.featured ?? false,
        badge: input.badge ?? null,
        active: input.active ?? true,
      };

      if (input.id) {
        const p = await prismaDb.product.update({
          where: { id: input.id },
          data: dataPayload,
        });
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          categoryId: p.categoryId ?? category.id,
          category: p.category,
          categorySlug: p.categorySlug,
          priceFrom: Number(p.priceFrom),
          leadTimeDays: p.leadTimeDays,
          shortDescription: p.shortDescription,
          description: p.description,
          images: (p.images as string[]) || [],
          options: (p.options as any[]) || [],
          featured: p.featured,
          badge: p.badge,
          active: p.active,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      } else {
        const p = await prismaDb.product.create({
          data: dataPayload,
        });
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          categoryId: p.categoryId ?? category.id,
          category: p.category,
          categorySlug: p.categorySlug,
          priceFrom: Number(p.priceFrom),
          leadTimeDays: p.leadTimeDays,
          shortDescription: p.shortDescription,
          description: p.description,
          images: (p.images as string[]) || [],
          options: (p.options as any[]) || [],
          featured: p.featured,
          badge: p.badge,
          active: p.active,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("Prisma error in upsertProduct:", err);
      throw err;
    }
  }

  if (isSupabaseReady()) {
    const payload = {
      name: input.name,
      slug,
      category_id: category.id,
      category_name: category.name,
      category_slug: category.slug,
      price_from: input.priceFrom,
      lead_time_days: input.leadTimeDays,
      short_description: input.shortDescription,
      description: input.description,
      images: input.images ?? [],
      featured: input.featured ?? false,
      badge: input.badge ?? null,
      active: input.active ?? true,
    };

    if (input.id) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", input.id)
        .select()
        .single();
      if (!error && data) return getProductById(data.id) as Promise<Product>;
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      if (!error && data) return getProductById(data.id) as Promise<Product>;
    }
  }

  const existing = input.id ? memStore.products.find((p) => p.id === input.id) : undefined;
  if (existing) {
    Object.assign(existing, {
      name: input.name,
      slug,
      categoryId: category.id,
      category: category.name,
      categorySlug: category.slug,
      priceFrom: input.priceFrom,
      leadTimeDays: input.leadTimeDays,
      shortDescription: input.shortDescription,
      description: input.description,
      images: input.images ?? existing.images,
      options: input.options ?? existing.options,
      featured: input.featured ?? existing.featured,
      badge: input.badge ?? null,
      active: input.active ?? existing.active,
      updatedAt: now,
    });
    return clone(existing);
  }

  const product: Product = {
    id: uid(),
    slug,
    name: input.name,
    categoryId: category.id,
    category: category.name,
    categorySlug: category.slug,
    priceFrom: input.priceFrom,
    leadTimeDays: input.leadTimeDays,
    shortDescription: input.shortDescription,
    description: input.description,
    images: input.images ?? [],
    options: input.options ?? [],
    featured: input.featured ?? false,
    badge: input.badge ?? null,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  memStore.products.unshift(product);
  return clone(product);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isPrismaReady()) {
    try {
      await prismaDb.product.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("Prisma error in deleteProduct:", err);
      throw err;
    }
  }

  if (isSupabaseReady()) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) return true;
  }

  const i = memStore.products.findIndex((p) => p.id === id);
  if (i === -1) return false;
  memStore.products.splice(i, 1);
  return true;
}

/* --------------------------------- Reviews -------------------------------- */

const memReviews: Review[] = [
  {
    id: "r1",
    productId: "p1",
    name: "Mariam Hassan",
    rating: 5,
    comment: "المظهر والتقفيل ممتاز جداً! الورد متماسك وعجب والدتي جداً فالعيد.",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "r2",
    productId: "p1",
    name: "Sarah Ahmed",
    rating: 5,
    comment: "Beautiful crochet bouquet! The cotton yarn is high quality and wrapping is elegant.",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "r3",
    productId: "p2",
    name: "Salma Mahmoud",
    rating: 5,
    comment: "أصيص التوليب تحفة جداً على مكتبي وشكله شيك أوي ❤️",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export async function listProductReviews(productId: string): Promise<Review[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() =>
        prismaDb.review.findMany({
          where: { productId, approved: true },
          orderBy: { createdAt: "desc" },
        }),
      );
      if (rows && Array.isArray(rows)) {
        return rows.map((r) => ({
          id: r.id,
          productId: r.productId,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          approved: r.approved,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.error("Prisma error in listProductReviews:", err);
    }
  }

  return clone(memReviews.filter((r) => r.productId === productId && r.approved));
}

export async function createReview(input: {
  productId: string;
  name: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const rating = Math.max(1, Math.min(5, Number(input.rating) || 5));
  const iso = new Date().toISOString();

  if (isPrismaReady()) {
    try {
      const created = await prismaDb.review.create({
        data: {
          productId: input.productId,
          name: input.name,
          rating,
          comment: input.comment,
          approved: true,
        },
      });
      return {
        id: created.id,
        productId: created.productId,
        name: created.name,
        rating: created.rating,
        comment: created.comment,
        approved: created.approved,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.error("Prisma error in createReview:", err);
      throw err;
    }
  }

  const review: Review = {
    id: uid(),
    productId: input.productId,
    name: input.name,
    rating,
    comment: input.comment,
    approved: true,
    createdAt: iso,
  };
  memReviews.unshift(review);
  return clone(review);
}

export async function adminListReviews(): Promise<Review[]> {
  if (isPrismaReady()) {
    try {
      const rows = await withPrismaRetry(() =>
        prismaDb.review.findMany({ orderBy: { createdAt: "desc" } }),
      );
      return rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        approved: r.approved,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error("Prisma error in adminListReviews:", err);
    }
  }

  return clone(memReviews);
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isPrismaReady()) {
    try {
      await prismaDb.review.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("Prisma error in deleteReview:", err);
    }
  }

  const idx = memReviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  memReviews.splice(idx, 1);
  return true;
}

/* -------------------------------- Analytics ------------------------------- */

export async function dashboardStats(): Promise<DashboardStats> {
  const orders = await listOrders("all");
  const products = await listProducts({ includeInactive: true });
  const messages = await listMessages();
  const categories = await listCategories();

  const dayMs = 86_400_000;
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() - (6 - i) * dayMs);
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      orders: orders.filter((o) => o.createdAt.slice(0, 10) === key).length,
    };
  });

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "reviewing").length,
    activeWeaves: orders.filter((o) => o.status === "weaving" || o.status === "paid").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    unreadMessages: messages.filter((m) => !m.read).length,
    productCount: products.filter((p) => p.active).length,
    categoryCount: categories.length,
    revenue: orders
      .filter((o) => ["paid", "weaving", "shipped", "delivered"].includes(o.status))
      .reduce((sum, o) => sum + (o.quotedPrice ?? o.total ?? 0), 0),
    ordersByStatus: ORDER_STATUSES.map((s) => ({
      status: s.value,
      label: s.label,
      count: orders.filter((o) => o.status === s.value).length,
    })),
    last7Days,
  };
}
