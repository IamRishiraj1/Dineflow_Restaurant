import { PrismaClient, OrderType, PaymentMethod, PaymentStatus, OrderStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { categories as mockCategories } from "../data/categories";
import { foods as mockFoods } from "../data/foods";
import { mockOrders } from "../data/orders";
import { defaultRestaurantSettings } from "../data/restaurant";

const prisma = new PrismaClient();

// Maps the old string ids from data/*.ts (e.g. "cat-burgers") to the real
// cuid()s Postgres generates, so foods/orders can reference the right rows.
const categoryIdMap = new Map<string, string>();
const foodIdMap = new Map<string, string>();

async function seedCategories() {
  for (const category of mockCategories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
      },
    });
    categoryIdMap.set(category.id, created.id);
  }
  console.log(`Seeded ${mockCategories.length} categories`);
}

async function seedFoods() {
  for (const food of mockFoods) {
    const categoryId = categoryIdMap.get(food.categoryId);
    if (!categoryId) {
      console.warn(`Skipping "${food.name}" — unknown category ${food.categoryId}`);
      continue;
    }
    const created = await prisma.food.create({
      data: {
        name: food.name,
        slug: food.slug,
        description: food.description,
        price: food.price,
        image: food.image,
        rating: food.rating,
        reviewCount: food.reviewCount,
        prepTimeMinutes: food.prepTimeMinutes,
        ingredients: food.ingredients,
        isAvailable: food.isAvailable,
        isPopular: food.isPopular ?? false,
        isFeatured: food.isFeatured ?? false,
        categoryId,
      },
    });
    foodIdMap.set(food.id, created.id);
  }
  console.log(`Seeded ${mockFoods.length} foods`);
}

const ORDER_TYPE_MAP: Record<string, OrderType> = { delivery: "DELIVERY", pickup: "PICKUP" };
const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = { card: "CARD", cash: "CASH" };
const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = { paid: "PAID", pending: "PENDING", failed: "FAILED" };
const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  placed: "PLACED",
  confirmed: "CONFIRMED",
  preparing: "PREPARING",
  ready: "READY",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

async function seedOrders() {
  for (const order of mockOrders) {
    await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        fullName: order.customer.fullName,
        email: order.customer.email,
        phone: order.customer.phone,
        orderType: ORDER_TYPE_MAP[order.orderType],
        address: order.delivery?.address ?? null,
        city: order.delivery?.city ?? null,
        postalCode: order.delivery?.postalCode ?? null,
        paymentMethod: PAYMENT_METHOD_MAP[order.paymentMethod],
        paymentStatus: PAYMENT_STATUS_MAP[order.paymentStatus],
        status: ORDER_STATUS_MAP[order.status],
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        estimatedReadyMinutes: order.estimatedReadyMinutes,
        createdAt: new Date(order.createdAt),
        items: {
          create: order.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            foodId: foodIdMap.get(item.foodId) ?? null,
          })),
        },
      },
    });
  }
  console.log(`Seeded ${mockOrders.length} orders`);
}

async function seedRestaurantSettings() {
  await prisma.restaurantSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: defaultRestaurantSettings.name,
      phone: defaultRestaurantSettings.phone,
      email: defaultRestaurantSettings.email,
      address: defaultRestaurantSettings.address,
      currency: defaultRestaurantSettings.currency,
      deliveryFee: defaultRestaurantSettings.deliveryFee,
      minimumOrder: defaultRestaurantSettings.minimumOrder,
      openingHours: defaultRestaurantSettings.openingHours,
    },
  });
  console.log("Seeded restaurant settings");
}

async function seedAdminUser() {
  const email = "admin@dineflow.example";

  // A hardcoded password here is a real, working credential for anyone
  // who reads this file — and this file is committed to git. Set
  // ADMIN_SEED_PASSWORD in your environment before seeding a *fresh*
  // database to choose your own; otherwise a random one is generated.
  // Either way, the password is never logged — if you used the random
  // fallback, set your own with scripts/set-admin-password.ts afterward.
  const plainPassword = process.env.ADMIN_SEED_PASSWORD ?? randomBytes(12).toString("base64url");
  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Restaurant Admin",
      email,
      password: hashed,
      role: Role.ADMIN,
    },
  });

  console.log(
    process.env.ADMIN_SEED_PASSWORD
      ? `Seeded admin user → email: ${email} (password set from ADMIN_SEED_PASSWORD)`
      : `Seeded admin user → email: ${email}. No ADMIN_SEED_PASSWORD was set, so a random password was ` +
          `generated and NOT logged — run scripts/set-admin-password.ts to set one you know.`
  );
}

async function main() {
  console.log("Seeding database…");
  await seedCategories();
  await seedFoods();
  await seedOrders();
  await seedRestaurantSettings();
  await seedAdminUser();
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
