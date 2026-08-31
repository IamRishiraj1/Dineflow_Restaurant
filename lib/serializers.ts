import {
  Food as PrismaFood,
  Category as PrismaCategory,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  RestaurantSettings as PrismaSettings,
  OrderStatus as DbOrderStatus,
  OrderType as DbOrderType,
  PaymentMethod as DbPaymentMethod,
  PaymentStatus as DbPaymentStatus,
} from "@prisma/client";
import {
  Food,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  RestaurantSettings,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────
// The database (Prisma/Postgres) stores enums in UPPER_CASE, which is the
// Postgres/Prisma convention. The frontend — built before the database
// existed — uses lowercase string literals throughout (see types/index.ts).
// Rather than rewrite every component, these small maps translate between
// the two at the API boundary, so neither layer has to change.
// ─────────────────────────────────────────────────────────────────────────

const ORDER_TYPE_TO_APP: Record<string, OrderType> = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
};
const ORDER_TYPE_TO_DB: Record<OrderType, DbOrderType> = {
  delivery: "DELIVERY",
  pickup: "PICKUP",
};

const PAYMENT_METHOD_TO_APP: Record<string, PaymentMethod> = {
  CARD: "card",
  CASH: "cash",
};
const PAYMENT_METHOD_TO_DB: Record<PaymentMethod, DbPaymentMethod> = {
  card: "CARD",
  cash: "CASH",
};

const PAYMENT_STATUS_TO_APP: Record<string, PaymentStatus> = {
  PAID: "paid",
  PENDING: "pending",
  FAILED: "failed",
};
const PAYMENT_STATUS_TO_DB: Record<PaymentStatus, DbPaymentStatus> = {
  paid: "PAID",
  pending: "PENDING",
  failed: "FAILED",
};

const ORDER_STATUS_TO_APP: Record<string, OrderStatus> = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
const ORDER_STATUS_TO_DB: Record<OrderStatus, DbOrderStatus> = {
  placed: "PLACED",
  confirmed: "CONFIRMED",
  preparing: "PREPARING",
  ready: "READY",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export function orderTypeToDb(v: OrderType) {
  return ORDER_TYPE_TO_DB[v];
}
export function paymentMethodToDb(v: PaymentMethod) {
  return PAYMENT_METHOD_TO_DB[v];
}
export function paymentStatusToDb(v: PaymentStatus) {
  return PAYMENT_STATUS_TO_DB[v];
}
export function orderStatusToDb(v: OrderStatus) {
  return ORDER_STATUS_TO_DB[v];
}

// ─────────────────────────────────────────────────────────────────────────
// Prisma model -> frontend type
// ─────────────────────────────────────────────────────────────────────────

export function serializeCategory(c: PrismaCategory): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    image: c.image ?? "",
    isActive: c.isActive,
  };
}

export function serializeFood(f: PrismaFood): Food {
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    description: f.description,
    price: f.price,
    image: f.image ?? "",
    categoryId: f.categoryId ?? "",
    rating: f.rating,
    reviewCount: f.reviewCount,
    prepTimeMinutes: f.prepTimeMinutes,
    ingredients: f.ingredients,
    isAvailable: f.isAvailable,
    isPopular: f.isPopular,
    isFeatured: f.isFeatured,
  };
}

type PrismaOrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

export function serializeOrder(o: PrismaOrderWithItems): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customer: { fullName: o.fullName, email: o.email, phone: o.phone },
    delivery:
      o.orderType === "DELIVERY"
        ? { address: o.address ?? "", city: o.city ?? "", postalCode: o.postalCode ?? "" }
        : null,
    orderType: ORDER_TYPE_TO_APP[o.orderType],
    paymentMethod: PAYMENT_METHOD_TO_APP[o.paymentMethod],
    paymentStatus: PAYMENT_STATUS_TO_APP[o.paymentStatus],
    items: o.items.map(
      (item): OrderItem => ({
        foodId: item.foodId ?? "",
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? "",
      })
    ),
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: ORDER_STATUS_TO_APP[o.status],
    createdAt: o.createdAt.toISOString(),
    estimatedReadyMinutes: o.estimatedReadyMinutes,
  };
}

export function serializeSettings(s: PrismaSettings): RestaurantSettings {
  return {
    name: s.name,
    phone: s.phone,
    email: s.email,
    address: s.address,
    currency: s.currency,
    deliveryFee: s.deliveryFee,
    minimumOrder: s.minimumOrder,
    openingHours: s.openingHours as RestaurantSettings["openingHours"],
  };
}
