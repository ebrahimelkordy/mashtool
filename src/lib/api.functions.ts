import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import * as repo from "./data/repository.server";
import { assertAdmin, readAdminSession, signInAdmin, signOutAdmin } from "./data/auth.server";
import { notifyAdminOfOrder } from "./data/notifications.server";

const optionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  required: z.boolean(),
  values: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(60),
        priceDelta: z.number().min(-100000).max(100000),
      }),
    )
    .max(20),
});

/* ------------------------------- public API ------------------------------- */

export const getCategories = createServerFn({ method: "GET" }).handler(() => repo.listCategories());

export const getProducts = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({ categorySlug: z.string().optional(), featured: z.boolean().optional() })
      .parse(input ?? {}),
  )
  .handler(({ data }) => repo.listProducts(data));

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const product = await repo.getProductBySlug(data.slug);
    if (!product) return { product: null, related: [], testimonials: [], reviews: [] };
    const related = (await repo.listProducts({ categorySlug: product.categorySlug }))
      .filter((p) => p.id !== product.id)
      .slice(0, 3);
    const reviews = await repo.listProductReviews(product.id);
    return { product, related, testimonials: await repo.listTestimonials(), reviews };
  });

export const getProductReviews = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ productId: z.string() }).parse(input))
  .handler(({ data }) => repo.listProductReviews(data.productId));

export const submitReview = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        productId: z.string(),
        name: z.string().min(2).max(80),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(2).max(1000),
      })
      .parse(input),
  )
  .handler(({ data }) => repo.createReview(data));

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const featuredCategories = await repo.listCategories({ featuredOnly: true });
  const categories = featuredCategories.length > 0 ? featuredCategories : await repo.listCategories();
  return {
    categories,
    featured: await repo.listProducts({ featured: true }),
  };
});

export const getTestimonials = createServerFn({ method: "GET" }).handler(() =>
  repo.listTestimonials(),
);

/** Public business configuration (never exposes the admin notification email). */
export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { adminNotificationEmail: _admin, updatedAt: _updatedAt, ...rest } = await repo.getSettings();
  return rest;
});

export const getCategory = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const categories = await repo.listCategories();
    const category = categories.find((c) => c.slug === data.slug) ?? null;
    return {
      category,
      products: category ? await repo.listProducts({ categorySlug: category.slug }) : [],
    };
  });

export const submitOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        type: z.enum(["standard", "bespoke"]),
        productId: z.string().nullish(),
        customerName: z.string().min(2).max(120),
        phone: z.string().min(6).max(40),
        whatsapp: z.string().max(40).nullish(),
        address: z.string().max(400).nullish(),
        quantity: z.number().int().min(1).max(50).optional(),
        notes: z.string().max(2000).nullish(),
        referenceImages: z.array(z.string().max(200)).max(6).optional(),
        selectedOptions: z
          .array(z.object({ optionId: z.string(), valueId: z.string() }))
          .max(20)
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const order = await repo.createOrder(data);
    const notification = await notifyAdminOfOrder(order).catch((error: unknown) => ({
      sent: false as const,
      reason: "provider_error" as const,
      detail: error instanceof Error ? error.message : "Unknown notification error",
    }));
    return { order, notification };
  });

export const trackOrder = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ orderNumber: z.string().min(3) }).parse(input))
  .handler(({ data }) => repo.getOrderByNumber(data.orderNumber));

export const uploadPaymentProof = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        orderNumber: z.string().min(3),
        fileName: z.string().min(1).max(200),
        contentType: z.string().min(3).max(100),
        base64: z.string().min(10).max(8_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const file = await repo.saveFile({
      fileName: data.fileName,
      contentType: data.contentType,
      base64: data.base64,
    });
    return repo.attachPaymentProof(data.orderNumber, file.url);
  });

export const submitMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email().max(160),
        subject: z.string().min(2).max(160),
        body: z.string().min(5).max(4000),
      })
      .parse(input),
  )
  .handler(({ data }) => repo.createMessage(data));

/* -------------------------------- admin API ------------------------------- */

export const adminSession = createServerFn({ method: "GET" }).handler(() => readAdminSession());

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ passcode: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => ({ ok: await signInAdmin(data.passcode) }));

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  await signOutAdmin();
  return { ok: true };
});

export const adminStats = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  return repo.dashboardStats();
});

export const adminOrders = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ status: z.string().optional() }).parse(input ?? {}))
  .handler(async ({ data }) => {
    await assertAdmin();
    return repo.listOrders((data.status ?? "all") as "all");
  });

export const adminOrderDetail = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    const order = await repo.getOrderById(data.id);
    if (!order) return { order: null, product: null };
    return {
      order,
      product: order.productId ? await repo.getProductById(order.productId) : null,
    };
  });

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        id: z.string(),
        status: z
          .enum([
            "pending",
            "reviewing",
            "quoted",
            "awaiting_payment",
            "paid",
            "weaving",
            "shipped",
            "delivered",
            "cancelled",
          ])
          .optional(),
        quotedPrice: z.number().min(0).nullish(),
        estimatedDelivery: z.string().nullish(),
        adminNote: z.string().max(2000).nullish(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    const { id, ...patch } = data;
    return repo.updateOrder(id, patch);
  });

export const adminProducts = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  return repo.listProducts({ includeInactive: true });
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().nullish(),
        name: z.string().min(2).max(160),
        slug: z.string().max(160).optional(),
        categorySlug: z.string(),
        priceFrom: z.number().min(0),
        leadTimeDays: z.string().max(60),
        shortDescription: z.string().max(300),
        description: z.string().max(4000),
        images: z.array(z.string()).optional(),
        options: z.array(optionSchema).max(10).optional(),
        featured: z.boolean().optional(),
        badge: z.string().max(40).nullish(),
        active: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    return repo.upsertProduct(data);
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    return { ok: await repo.deleteProduct(data.id) };
  });

export const adminMessages = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  return repo.listMessages();
});

export const adminMarkMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ id: z.string(), read: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    return repo.markMessageRead(data.id, data.read);
  });

export const adminDeleteMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    return { ok: await repo.deleteMessage(data.id) };
  });

/* ------------------------------ admin uploads ----------------------------- */

export const adminUploadImage = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        contentType: z.string().regex(/^image\/(png|jpeg|jpg|webp|gif|avif)$/),
        base64: z.string().min(10).max(8_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    const file = await repo.saveFile(data);
    return { url: file.url, fileName: file.fileName, size: file.size };
  });

/* ------------------------------ admin settings ---------------------------- */

export const adminSettings = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  return repo.getSettings();
});

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        adminNotificationEmail: z.string().email().or(z.literal("")),
        whatsappNumber: z.string().max(30).regex(/^[0-9]*$/, "Digits only"),
        whatsappDisplay: z.string().max(40),
        contactEmail: z.string().email().or(z.literal("")),
        instagramUrl: z.string().url().or(z.literal("")),
        addressLine: z.string().max(200),
        instapayHandle: z.string().max(80),
        vodafoneCashNumber: z.string().max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    return repo.updateSettings(data);
  });

/* ----------------------------- admin categories --------------------------- */

export const adminSaveCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().nullish(),
        name: z.string().min(2).max(120),
        slug: z.string().max(120).optional(),
        tagline: z.string().max(200).optional(),
        description: z.string().max(2000).optional(),
        image: z.string().optional(),
        featured: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    return repo.upsertCategory(data);
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    return { ok: await repo.deleteCategory(data.id) };
  });

/* ------------------------------ admin reviews ----------------------------- */

export const adminReviews = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  return repo.adminListReviews();
});

export const adminDeleteReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    return { ok: await repo.deleteReview(data.id) };
  });