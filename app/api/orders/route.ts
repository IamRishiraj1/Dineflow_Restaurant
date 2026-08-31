import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder, orderTypeToDb, paymentMethodToDb } from "@/lib/serializers";
import { placeOrderInputSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api-helpers";
import { generateOrderNumber } from "@/lib/utils";

// GET /api/orders — every order, newest first.
// ⚠️ Returns ALL orders with no per-customer filtering — fine while the
// admin dashboard is the only consumer, but this MUST be scoped to the
// logged-in user once Phase 3 (auth) lands, or any customer could see
// every other customer's order history. See TODO.md Phase 3 + Phase 8.
export const GET = withErrorHandling(async () => {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders.map(serializeOrder));
});

// POST /api/orders — place a new order from checkout.
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = placeOrderInputSchema.parse(body);

  // Card payments are treated as paid immediately in this mock-payment
  // phase (see TODO.md Phase 4 for the real gateway integration); cash
  // stays pending until the order is delivered/collected.
  const paymentStatus = input.paymentMethod === "cash" ? "PENDING" : "PAID";

  // Order numbers are short and human-friendly (e.g. "DF-48213"), but two
  // near-simultaneous orders could in theory collide — retry a handful of
  // times with a fresh number rather than fail the checkout outright.
  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      order = await prisma.order.create({
        data: {
          orderNumber,
          fullName: input.customer.fullName,
          email: input.customer.email,
          phone: input.customer.phone,
          orderType: orderTypeToDb(input.orderType),
          address: input.delivery?.address ?? null,
          city: input.delivery?.city ?? null,
          postalCode: input.delivery?.postalCode ?? null,
          paymentMethod: paymentMethodToDb(input.paymentMethod),
          paymentStatus,
          status: "PLACED",
          subtotal: input.subtotal,
          deliveryFee: input.deliveryFee,
          total: input.total,
          estimatedReadyMinutes: 25 + Math.round(Math.random() * 15),
          items: {
            create: input.items.map((item) => ({
              foodId: item.foodId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
        include: { items: true },
      });
    } catch (err: unknown) {
      // Prisma's unique-constraint error code — retry with a new number.
      const isUniqueViolation =
        typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
      if (!isUniqueViolation) throw err;
    }
  }

  if (!order) {
    throw new Error("Could not generate a unique order number after several attempts.");
  }

  return NextResponse.json(serializeOrder(order), { status: 201 });
});
