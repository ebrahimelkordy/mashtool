import { queryOptions } from "@tanstack/react-query";

import {
  adminMessages,
  adminOrderDetail,
  adminOrders,
  adminProducts,
  adminSession,
  adminSettings,
  adminStats,
  getCategories,
  getCategory,
  getHomeData,
  getProductBySlug,
  getProducts,
  getPublicSettings,
} from "./api.functions";

export const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHomeData(),
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
});

export const productsQuery = (categorySlug?: string) =>
  queryOptions({
    queryKey: ["products", categorySlug ?? "all"],
    queryFn: () => getProducts({ data: categorySlug ? { categorySlug } : {} }),
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: () => getCategory({ data: { slug } }),
  });

export const adminSessionQuery = queryOptions({
  queryKey: ["admin", "session"],
  queryFn: () => adminSession(),
});

export const adminStatsQuery = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: () => adminStats(),
});

export const adminOrdersQuery = (status: string) =>
  queryOptions({
    queryKey: ["admin", "orders", status],
    queryFn: () => adminOrders({ data: { status } }),
  });

export const adminProductsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: () => adminProducts(),
});

export const adminMessagesQuery = queryOptions({
  queryKey: ["admin", "messages"],
  queryFn: () => adminMessages(),
});

export const adminSettingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: () => adminSettings(),
});

export const adminOrderQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "order", id],
    queryFn: () => adminOrderDetail({ data: { id } }),
  });

export const publicSettingsQuery = queryOptions({
  queryKey: ["settings", "public"],
  queryFn: () => getPublicSettings(),
  staleTime: 5 * 60_000,
});