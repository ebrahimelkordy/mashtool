export type OrderStatus =
  | "pending"
  | "reviewing"
  | "quoted"
  | "awaiting_payment"
  | "paid"
  | "weaving"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: { value: OrderStatus; label: string; hint: string }[] = [
  { value: "pending", label: "Request Received", hint: "Your whisper reached the loom." },
  { value: "reviewing", label: "Under Review", hint: "Our artisans are studying your request." },
  { value: "quoted", label: "Quote Sent", hint: "A final price has been shared with you." },
  { value: "awaiting_payment", label: "Awaiting Payment", hint: "Upload your proof of payment." },
  { value: "paid", label: "Payment Confirmed", hint: "Payment verified. Threads are gathered." },
  { value: "weaving", label: "Weaving", hint: "Your piece is being crafted by hand." },
  { value: "shipped", label: "Shipped", hint: "Your piece is on its way." },
  { value: "delivered", label: "Delivered", hint: "Your piece has arrived home." },
  { value: "cancelled", label: "Cancelled", hint: "This request was cancelled." },
];

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

/** A configurable choice on a product (e.g. "Size", "Yarn colour"). */
export type ProductOptionValue = {
  id: string;
  label: string;
  /** Added to the product base price when selected. */
  priceDelta: number;
};

export type ProductOption = {
  id: string;
  name: string;
  required: boolean;
  values: ProductOptionValue[];
};

export type SelectedOption = {
  optionId: string;
  optionName: string;
  valueId: string;
  valueLabel: string;
  priceDelta: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  priceFrom: number;
  leadTimeDays: string;
  shortDescription: string;
  description: string;
  images: string[];
  options: ProductOption[];
  featured: boolean;
  badge: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderType = "standard" | "bespoke";

export type Order = {
  id: string;
  orderNumber: string;
  type: OrderType;
  productId: string | null;
  productName: string | null;
  customerName: string;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  quantity: number;
  notes: string | null;
  referenceImages: string[];
  selectedOptions: SelectedOption[];
  /** Server-computed unit price (base + option deltas). Null for bespoke. */
  unitPrice: number | null;
  /** Server-computed total (unitPrice × quantity). Null for bespoke. */
  total: number | null;
  status: OrderStatus;
  quotedPrice: number | null;
  paymentProofUrl: string | null;
  estimatedDelivery: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  initials: string;
  quote: string;
  rating: number;
};

export type StoredFile = {
  id: string;
  fileName: string;
  contentType: string;
  /** Raw base64 payload (no data-URL prefix). */
  base64: string;
  size: number;
  /** Public URL the app uses to render the file. */
  url: string;
  createdAt: string;
};

/** Business configuration edited by the admin — never hardcoded in components. */
export type Settings = {
  adminNotificationEmail: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  contactEmail: string;
  instagramUrl: string;
  addressLine: string;
  instapayHandle: string;
  vodafoneCashNumber: string;
  updatedAt: string;
};

/** Settings that are safe to expose on the public site. */
export type PublicSettings = Omit<Settings, "adminNotificationEmail" | "updatedAt">;

export type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  activeWeaves: number;
  deliveredOrders: number;
  unreadMessages: number;
  productCount: number;
  revenue: number;
  ordersByStatus: { status: OrderStatus; label: string; count: number }[];
  last7Days: { day: string; orders: number }[];
};