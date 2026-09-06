import { z } from "zod";

// These validate the shape of incoming request bodies before they touch
// Prisma. They're intentionally lightweight for now — Phase 8 (security
// hardening) is where these get tightened further (stricter string
// lengths, sanitization, etc.) across every route.

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(100),
  description: z.string().max(300).optional().default(""),
  image: z.string().max(2000).optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const foodInputSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140),
  description: z.string().min(1).max(500),
  price: z.number().int().positive(),
  image: z.string().max(2000).optional().default(""),
  categoryId: z.string().min(1),
  prepTimeMinutes: z.number().int().positive(),
  ingredients: z.array(z.string().max(60)).max(30).default([]),
  isAvailable: z.boolean().optional().default(true),
  isPopular: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
});

export const orderItemInputSchema = z.object({
  foodId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().max(2000).optional().default(""),
});

export const placeOrderInputSchema = z.object({
  customer: z.object({
    fullName: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().min(6).max(30),
  }),
  delivery: z
    .object({
      address: z.string().min(1).max(300),
      city: z.string().min(1).max(100),
      postalCode: z.string().min(1).max(20),
    })
    .nullable(),
  orderType: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["card", "cash"]),
  items: z.array(orderItemInputSchema).min(1),
  subtotal: z.number().int().nonnegative(),
  deliveryFee: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["placed", "confirmed", "preparing", "ready", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["paid", "pending", "failed"]).optional(),
});

export const settingsUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(1).max(40).optional(),
  email: z.string().email().optional(),
  address: z.string().min(1).max(300).optional(),
  currency: z.string().min(1).max(10).optional(),
  deliveryFee: z.number().int().nonnegative().optional(),
  minimumOrder: z.number().int().nonnegative().optional(),
  openingHours: z
    .array(
      z.object({
        day: z.string(),
        isOpen: z.boolean(),
        open: z.string(),
        close: z.string(),
      })
    )
    .optional(),
});

export const contactMessageInputSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

// The four SSLCommerz callback routes (success/fail/cancel/ipn) all
// receive the same shape of form-encoded payload, just used slightly
// differently by each — this is the single source of truth for what a
// well-formed callback looks like, instead of each route reading fields
// with ad hoc formData.get(...)?.toString() calls and no real guarantee
// they're non-empty strings. val_id is optional here because the
// success-redirect handler treats "no val_id yet" as a valid, if
// incomplete, state rather than an error — the IPN route (the
// authoritative one) enforces its own presence on top of this.
export const sslcommerzCallbackSchema = z.object({
  value_a: z.string().min(1, "Missing order reference (value_a)"), // orderId, set by us in lib/sslcommerz.ts
  val_id: z.string().min(1).optional(),
  status: z.string().optional(),
});
