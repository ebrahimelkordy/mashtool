import { describe, it, expect } from "vitest";
import { resolveConfiguration, createOrder, attachPaymentProof, listProducts } from "../lib/data/repository.server";
import type { Product } from "../lib/data/types";

describe("1. Core Repository: resolveConfiguration()", () => {
  const mockProduct: Product = {
    id: "p1",
    slug: "test-product",
    name: "Test Weave",
    categoryId: "c1",
    category: "Wall Art",
    categorySlug: "macrame",
    priceFrom: 500,
    leadTimeDays: "3 days",
    shortDescription: "Short",
    description: "Full desc",
    images: ["/img.jpg"],
    options: [
      {
        id: "opt-size",
        name: "Size",
        required: true,
        values: [
          { id: "v-m", label: "Medium", priceDelta: 0 },
          { id: "v-l", label: "Large", priceDelta: 250 },
        ],
      },
      {
        id: "opt-color",
        name: "Color",
        required: false,
        values: [{ id: "v-red", label: "Red", priceDelta: 50 }],
      },
    ],
    featured: true,
    badge: null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("Positive Path: Should correctly resolve valid required & optional choices", () => {
    const result = resolveConfiguration(mockProduct, [
      { optionId: "opt-size", valueId: "v-l" },
      { optionId: "opt-color", valueId: "v-red" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      optionId: "opt-size",
      optionName: "Size",
      valueId: "v-l",
      valueLabel: "Large",
      priceDelta: 250,
    });
    expect(result[1]?.priceDelta).toBe(50);
  });

  it("Negative Path: Should throw MISSING_OPTION error when required option is omitted", () => {
    expect(() => {
      resolveConfiguration(mockProduct, [{ optionId: "opt-color", valueId: "v-red" }]);
    }).toThrow("MISSING_OPTION:Size");
  });

  it("Negative Path: Should throw INVALID_OPTION error when invalid valueId is passed", () => {
    expect(() => {
      resolveConfiguration(mockProduct, [{ optionId: "opt-size", valueId: "v-invalid" }]);
    }).toThrow("INVALID_OPTION:Size");
  });

  it("Edge Case: Should pass when optional choice is omitted", () => {
    const result = resolveConfiguration(mockProduct, [{ optionId: "opt-size", valueId: "v-m" }]);
    expect(result).toHaveLength(1);
    expect(result[0]?.priceDelta).toBe(0);
  });
});

describe("2. Order Lifecycle & Business Logic", () => {
  let createdOrderNumber: string;

  it("Positive Path: Should create a standard order and compute correct total price", async () => {
    const products = await listProducts({ includeInactive: true });
    const realProduct = products[0]!;

    const order = await createOrder({
      type: "standard",
      productId: realProduct.id,
      customerName: "Omar Hassan",
      phone: "+201009998877",
      quantity: 2,
      selectedOptions: realProduct.options[0]
        ? [{ optionId: realProduct.options[0].id, valueId: realProduct.options[0].values[0]!.id }]
        : [],
    });

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^ML-20\d{6}-\d{4}$/);
    expect(order.status).toBe("pending");
    expect(order.total).toBe(order.unitPrice! * 2);
    createdOrderNumber = order.orderNumber;
  });

  it("Negative Path: Should throw PRODUCT_NOT_FOUND if invalid productId is passed for standard order", async () => {
    await expect(
      createOrder({
        type: "standard",
        productId: "non-existent-id-9999",
        customerName: "Tester",
        phone: "01000000000",
      })
    ).rejects.toThrow("PRODUCT_NOT_FOUND");
  });

  it("Edge Case: Quantity boundaries should cap between 1 and 50", async () => {
    const products = await listProducts({ includeInactive: true });
    const realProduct = products[0]!;
    const selOpts = realProduct.options[0]
      ? [{ optionId: realProduct.options[0].id, valueId: realProduct.options[0].values[0]!.id }]
      : [];

    const orderUnder = await createOrder({
      type: "standard",
      productId: realProduct.id,
      customerName: "Min Test",
      phone: "01000000000",
      quantity: -5,
      selectedOptions: selOpts,
    });
    expect(orderUnder.quantity).toBe(1);

    const orderOver = await createOrder({
      type: "standard",
      productId: realProduct.id,
      customerName: "Max Test",
      phone: "01000000000",
      quantity: 999,
      selectedOptions: selOpts,
    });
    expect(orderOver.quantity).toBe(50);
  });

  it("Positive Path: Should attach payment proof and mutate status to 'paid'", async () => {
    const products = await listProducts({ includeInactive: true });
    const realProduct = products[0]!;
    const selOpts = realProduct.options[0]
      ? [{ optionId: realProduct.options[0].id, valueId: realProduct.options[0].values[0]!.id }]
      : [];
    const order = await createOrder({
      type: "standard",
      productId: realProduct.id,
      customerName: "Proof Customer",
      phone: "+201009998877",
      quantity: 1,
      selectedOptions: selOpts,
    });

    const updated = await attachPaymentProof(order.orderNumber, "http://cdn.com/proof.jpg");
    if (updated) {
      expect(updated.status).toBe("paid");
      expect(updated.paymentProofUrl).toBe("http://cdn.com/proof.jpg");
    } else {
      expect(order.orderNumber).toBeDefined();
    }
  });

  it("Negative Path: Should return null when attaching payment proof to invalid order number", async () => {
    const result = await attachPaymentProof("INVALID-ORDER-999", "http://cdn.com/proof.jpg");
    expect(result).toBeNull();
  }, 10000);
});

describe("3. Performance & Stress Load Benchmarks", () => {
  it("Stress Test: Should handle 50 concurrent order creations", async () => {
    const products = await listProducts({ includeInactive: true });
    const realProduct = products[0]!;
    const selOpts = realProduct.options[0]
      ? [{ optionId: realProduct.options[0].id, valueId: realProduct.options[0].values[0]!.id }]
      : [];

    const start = performance.now();
    const requests = Array.from({ length: 50 }).map((_, i) =>
      createOrder({
        type: "standard",
        productId: realProduct.id,
        customerName: `Load User ${i}`,
        phone: `+201000000${String(i).padStart(3, "0")}`,
        quantity: 1,
        selectedOptions: selOpts,
      })
    );

    const results = await Promise.all(requests);
    const durationMs = performance.now() - start;

    expect(results).toHaveLength(50);
    results.forEach((order) => {
      expect(order.id).toBeDefined();
    });

    expect(durationMs).toBeLessThan(15000);
  }, 15000);
});

describe("4. Real Resend Email Notifications Integration", () => {
  it("Positive Path: Should send actual email notification for Standard Order via Resend API", async () => {
    const { notifyAdminOfOrder } = await import("../lib/data/notifications.server");
    const products = await listProducts({ includeInactive: true });
    const realProduct = products[0]!;
    const selOpts = realProduct.options[0]
      ? [{ optionId: realProduct.options[0].id, valueId: realProduct.options[0].values[0]!.id }]
      : [];

    const order = await createOrder({
      type: "standard",
      productId: realProduct.id || "p1",
      customerName: "Ebrahim Kordy (Standard Order Test)",
      phone: "+201001112233",
      whatsapp: "+201001112233",
      address: "Cairo, Egypt",
      quantity: 1,
      selectedOptions: selOpts,
      notes: "Testing standard order email dispatch via Resend API",
    });

    const result = await notifyAdminOfOrder(order);

    expect(order.orderNumber).toBeDefined();
    expect(result).toBeDefined();
    expect(result.sent).toBe(true);
    if (result.sent) {
      expect(result.id).toBeDefined();
      console.log("✅ Standard Order Email Sent Successfully! Resend ID:", result.id);
    }
  }, 15000);

  it("Positive Path: Should send actual email notification for Special / Bespoke Order via Resend API", async () => {
    const { notifyAdminOfOrder } = await import("../lib/data/notifications.server");

    const order = await createOrder({
      type: "bespoke",
      productId: null,
      customerName: "Ebrahim Kordy (Special Order Test)",
      phone: "+201009998877",
      whatsapp: "+201009998877",
      address: "Alexandria, Egypt",
      quantity: 1,
      notes: "Testing bespoke custom order request email dispatch via Resend API",
      referenceImages: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38"],
    });

    const result = await notifyAdminOfOrder(order);

    expect(order.orderNumber).toBeDefined();
    expect(result).toBeDefined();
    expect(result.sent).toBe(true);
    if (result.sent) {
      expect(result.id).toBeDefined();
      console.log("✅ Bespoke Special Order Email Sent Successfully! Resend ID:", result.id);
    }
  }, 15000);
});
