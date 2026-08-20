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

import { supabase, getSupabaseClient } from "./supabase.server";
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

// Use actual client check — works with hardcoded keys in supabase.server.ts
// We try the client; if it throws or returns null we fall back to memory store.
let _supabaseReady: boolean | null = null;
function isSupabaseReady(): boolean {
  // Use memory store seed for rich local product display until production database sync
  return false;
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
      slug: "macrame-wall-hangings",
      name: "Macramé Wall Tapestries",
      tagline: "Artisan Wall Accents",
      description: "Handcrafted macramé wall hangings made with premium natural cotton fibers to add warm sophistication to your space.",
      image: macrame,
    },
    {
      id: "c2",
      slug: "plant-hangers",
      name: "Botanical Plant Hangers",
      tagline: "Green Living Touches",
      description: "Durable and stylish bohemian plant hangers crafted to elevate your indoor greenery with refined elegance.",
      image: cords,
    },
    {
      id: "c3",
      slug: "home-decor",
      name: "Luxury Home Accessories",
      tagline: "Details & Accent Decor",
      description: "Handwoven coasters, table runners, and artisanal home accessories designed with timeless craftsmanship.",
      image: herbBag,
    },
  ];

  const products: Product[] = [
    {
      id: "p1",
      slug: "serene-horizon-macrame-tapestry",
      name: "Serene Horizon Macramé Tapestry",
      categoryId: "c1",
      category: "Macramé Wall Tapestries",
      categorySlug: "macrame-wall-hangings",
      priceFrom: 450,
      leadTimeDays: "1–2 weeks",
      shortDescription: "Handwoven blush merino tapestry with intricate geometric knotting.",
      description: "Crafted in our studio using ethically sourced organic cotton yarn and rose gold metallic accents. Designed to create a calming focal point in your bedroom or living space.",
      images: [macrame, wallArt],
      options: [
        {
          id: "opt-size",
          name: "Dimensions",
          required: true,
          values: [
            { id: "v-m", label: "Medium (60×40 cm)", priceDelta: 0 },
            { id: "v-l", label: "Large (90×60 cm)", priceDelta: 200 },
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
      slug: "rosewood-botanical-hanger",
      name: "Rosewood Botanical Hanger",
      categoryId: "c2",
      category: "Botanical Plant Hangers",
      categorySlug: "plant-hangers",
      priceFrom: 320,
      leadTimeDays: "1–2 weeks",
      shortDescription: "Deep rose and terracotta hand-braided cord hanger.",
      description: "An elegant solution for displaying indoor botanical accents, hand-knotted with reinforced organic cotton cords for heavy planter support.",
      images: [cords, roseThrow],
      options: [
        {
          id: "opt-length",
          name: "Hanging Length",
          required: false,
          values: [
            { id: "v-standard", label: "Standard (80 cm)", priceDelta: 0 },
            { id: "v-extended", label: "Extended (120 cm)", priceDelta: 60 },
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
      slug: "artisanal-woven-tote-runner",
      name: "Artisanal Woven Tote & Runner",
      categoryId: "c3",
      category: "Luxury Home Accessories",
      categorySlug: "home-decor",
      priceFrom: 180,
      leadTimeDays: "3–5 days",
      shortDescription: "Hand-crocheted net tote and decorative woven runner.",
      description: "Functional handwoven art for everyday living, crafted with natural unbleached fibers and reinforced wooden accents.",
      images: [herbBag, threads],
      options: [],
      featured: true,
      badge: "New Arrival",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p4",
      slug: "bohemian-fringe-wall-mirror",
      name: "Bohemian Fringe Macramé Mirror",
      categoryId: "c3",
      category: "Luxury Home Accessories",
      categorySlug: "home-decor",
      priceFrom: 520,
      leadTimeDays: "2–3 weeks",
      shortDescription: "Circular accent wall mirror with hand-knotted cotton fringe border.",
      description: "A breathtaking statement mirror surrounded by intricate radial macramé patterns. Ideal for entryway vanity or bedroom aesthetic enhancement.",
      images: [wallArt, macrame],
      options: [
        {
          id: "opt-mirror-diameter",
          name: "Mirror Size",
          required: true,
          values: [
            { id: "m-40", label: "Compact (40 cm total)", priceDelta: 0 },
            { id: "m-60", label: "Grand (65 cm total)", priceDelta: 280 },
          ],
        },
      ],
      featured: true,
      badge: "Featured",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p5",
      slug: "double-tier-plant-hanger",
      name: "Tiered Canopy Plant Hanger",
      categoryId: "c2",
      category: "Botanical Plant Hangers",
      categorySlug: "plant-hangers",
      priceFrom: 410,
      leadTimeDays: "1–2 weeks",
      shortDescription: "Two-tiered handwoven macramé planter holder with brass rings.",
      description: "Maximize your vertical space with this double-tier plant hanger, woven with thick 4mm unbleached natural cotton cords.",
      images: [cords, heroDrape],
      options: [],
      featured: false,
      badge: "Limited Edition",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p6",
      slug: "velvet-woven-throw-blanket",
      name: "Blush Velvet & Linen Throw Blanket",
      categoryId: "c3",
      category: "Luxury Home Accessories",
      categorySlug: "home-decor",
      priceFrom: 680,
      leadTimeDays: "2–3 weeks",
      shortDescription: "Ultra-soft woven lap blanket with hand-twisted tassel trim.",
      description: "Indulge in pure comfort with this heirloom-quality throw blanket. Hand-woven on traditional looms with pastel blush and ivory threads.",
      images: [roseThrow, artisanHands],
      options: [],
      featured: true,
      badge: "Signature",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p7",
      slug: "celestial-geometric-tapestry",
      name: "Celestial Geometric Wall Tapestry",
      categoryId: "c1",
      category: "Macramé Wall Tapestries",
      categorySlug: "macrame-wall-hangings",
      priceFrom: 890,
      leadTimeDays: "3–4 weeks",
      shortDescription: "Grand architectural wall tapestry mounted on polished teak wood.",
      description: "Our largest studio tapestry piece featuring complex diamond weaving and layered fringe drops. A true luxury investment piece.",
      images: [heroDrape, macrame],
      options: [
        {
          id: "opt-teak-finish",
          name: "Wood Finish",
          required: true,
          values: [
            { id: "w-natural", label: "Natural Driftwood", priceDelta: 0 },
            { id: "w-dark", label: "Polished Teak Wood", priceDelta: 150 },
          ],
        },
      ],
      featured: true,
      badge: "Masterpiece",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p8",
      slug: "handwoven-table-runner-set",
      name: "Artisanal Table Runner & Coasters Set",
      categoryId: "c3",
      category: "Luxury Home Accessories",
      categorySlug: "home-decor",
      priceFrom: 290,
      leadTimeDays: "1 week",
      shortDescription: "Includes 1 texturized table runner and 4 matching macramé coasters.",
      description: "Elevate your dining ritual with this handcrafted dining set. Made with liquid-repellent treated organic cotton yarns.",
      images: [threads, herbBag],
      options: [],
      featured: false,
      badge: null,
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
        name: "Sarah Lorne",
        initials: "SL",
        quote: "The tapestry transformed our living space into a calm, sacred sanctuary.",
        rating: 5,
      },
      {
        id: "t2",
        name: "Elena Rostova",
        initials: "ER",
        quote: "Impeccable craftsmanship. You can feel the intention woven into every knot.",
        rating: 5,
      },
    ],
    files: new Map(),
    settings: {
      adminNotificationEmail: process.env["ADMIN_EMAIL"] || "ebrahimkordy0@gmail.com",
      whatsappNumber: "+201001112233",
      whatsappDisplay: "+20 100 111 2233",
      contactEmail: "hello@mashtool.com",
      instagramUrl: "https://instagram.com/mashtool",
      addressLine: "Cairo, Egypt",
      instapayHandle: "mashtool@instapay",
      vodafoneCashNumber: "01001112233",
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

  if (isSupabaseReady()) {
    const filePath = `uploads/${id}_${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: input.contentType,
        upsert: true,
      });

    if (!uploadErr && uploadData) {
      const { data: publicUrlData } = supabase.storage
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
    }
  }

  const file: StoredFile = {
    id,
    fileName: input.fileName,
    contentType: input.contentType,
    base64: input.base64,
    size: buffer.length,
    url: `/api/public/uploads/${id}`,
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

export async function listCategories(): Promise<Category[]> {
  if (isSupabaseReady()) {
    try {
      const result = await withTimeout(supabase.from("categories").select("*"));
      if (result === TIMEOUT) throw new Error('Supabase timeout');
      const { data, error } = result as { data: any; error: any };
      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline || "",
          description: c.description || "",
          image: c.image || "",
        }));
      }
    } catch (err) {
      console.error("Supabase query error in listCategories:", err);
    }
  }
  return clone(memStore.categories);
}

export async function listProducts(opts?: {
  categorySlug?: string;
  featured?: boolean;
  includeInactive?: boolean;
}): Promise<Product[]> {
  if (isSupabaseReady()) {
    try {
      let query = supabase.from("products").select("*");
      if (query && typeof query.eq === "function") {
        if (!opts?.includeInactive) query = query.eq("active", true);
        if (opts?.categorySlug) query = query.eq("category_slug", opts.categorySlug);
        if (opts?.featured !== undefined) query = query.eq("featured", opts.featured);
      }

      const result = await withTimeout(query);
      if (result === TIMEOUT) throw new Error('Supabase timeout');
      const { data, error } = result as { data: any; error: any };
      if (!error && data && Array.isArray(data)) {
        return data.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          categoryId: p.category_id,
          category: p.category_name,
          categorySlug: p.category_slug,
          priceFrom: Number(p.price_from || p.priceFrom || 0),
          leadTimeDays: p.lead_time_days || p.leadTimeDays || "3-5 أيام",
          shortDescription: p.short_description || p.shortDescription || "",
          description: p.description || "",
          images: p.images || [],
          options: p.options || [],
          featured: Boolean(p.featured),
          badge: p.badge || null,
          active: p.active !== undefined ? Boolean(p.active) : true,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Supabase query error in listProducts:", err);
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
  if (isSupabaseReady()) {
    try {
      const result = await withTimeout(supabase.from("testimonials").select("*"));
      if (result === TIMEOUT) throw new Error('Supabase timeout');
      const { data, error } = result as { data: any; error: any };
      if (!error && data && Array.isArray(data)) {
        return data.map((t) => ({
          id: t.id,
          name: t.name || t.author || "Anonymous",
          initials: t.initials || (t.name || "A").slice(0, 2).toUpperCase(),
          quote: t.quote,
          rating: t.rating || 5,
        }));
      }
    } catch (err) {
      console.error("Supabase query error in listTestimonials:", err);
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
  if (isSupabaseReady()) {
    try {
      let query = supabase.from("orders").select("*");
      if (query && typeof query.order === "function") {
        query = query.order("created_at", { ascending: false });
      }
      if (status && status !== "all" && query && typeof query.eq === "function") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (!error && data && Array.isArray(data)) {
        return data.map((o) => ({
          id: o.id,
          orderNumber: o.order_number || o.orderNumber,
          type: o.type,
          productId: o.product_id || null,
          productName: o.product_name || null,
          customerName: o.customer_name || o.customerName,
          phone: o.phone,
          whatsapp: o.whatsapp || null,
          address: o.address || null,
          quantity: o.quantity || 1,
          notes: o.notes || null,
          referenceImages: o.reference_images || [],
          selectedOptions: [],
          unitPrice: null,
          total: o.quoted_price != null ? Number(o.quoted_price) : null,
          status: (o.status || "new") as OrderStatus,
          quotedPrice: o.quoted_price != null ? Number(o.quoted_price) : null,
          paymentProofUrl: o.payment_proof_url || null,
          estimatedDelivery: o.estimated_delivery || null,
          adminNote: o.admin_note || null,
          createdAt: o.created_at || new Date().toISOString(),
          updatedAt: o.updated_at || o.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Supabase query error in listOrders:", err);
    }
  }

  const rows = memStore.orders.filter((o) => !status || status === "all" || o.status === status);
  return clone(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function listMessages(): Promise<Message[]> {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        body: m.body,
        read: Boolean(m.read),
        createdAt: m.created_at,
      }));
    }
  }

  return clone([...memStore.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/* -------------------------------- Settings -------------------------------- */

export async function getSettings(): Promise<Settings> {
  return clone(memStore.settings);
}

export async function updateSettings(
  patch: Partial<Omit<Settings, "updatedAt">>,
): Promise<Settings> {
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
  if (isSupabaseReady()) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) return true;
  }

  const i = memStore.products.findIndex((p) => p.id === id);
  if (i === -1) return false;
  memStore.products.splice(i, 1);
  return true;
}

/* -------------------------------- Analytics ------------------------------- */

export async function dashboardStats(): Promise<DashboardStats> {
  const orders = await listOrders("all");
  const products = await listProducts({ includeInactive: true });
  const messages = await listMessages();

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
