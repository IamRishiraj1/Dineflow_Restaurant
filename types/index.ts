// ─────────────────────────────────────────────────────────────────────────
// Core domain types for DineFlow.
// These model the shape of data as it would eventually come from a real
// database (see README → "Future Architecture" for the Prisma migration
// plan). Keeping the types centralized here means the mock data layer and
// the real API layer (later) can share the same contracts.
// ─────────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface Food {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in BDT (Taka)
  image: string;
  categoryId: string;
  rating: number; // 0–5
  reviewCount: number;
  prepTimeMinutes: number;
  ingredients: string[];
  isAvailable: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  foodId: string;
  quantity: number;
}

export type OrderType = "delivery" | "pickup";

export type PaymentMethod = "card" | "cash";

export type PaymentStatus = "paid" | "pending" | "failed";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryInfo {
  address: string;
  city: string;
  postalCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  delivery: DeliveryInfo | null;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
  estimatedReadyMinutes: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface DailyStat {
  label: string; // e.g. short date or weekday
  revenue: number;
  orders: number;
}

export interface RestaurantSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  deliveryFee: number;
  minimumOrder: number;
  openingHours: {
    day: string;
    isOpen: boolean;
    open: string;
    close: string;
  }[];
}
