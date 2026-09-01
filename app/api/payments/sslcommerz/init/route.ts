import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { initiateSSLCommerzPayment } from "@/lib/sslcommerz";
import { withErrorHandling, apiError } from "@/lib/api-helpers";

const initSchema = z.object({ orderId: z.string().min(1) });

// POST /api/payments/sslcommerz/init
// Called right after an order is created with paymentMethod "card" (or
// again from the payment-failed page's "Try Again" button — that's why
// this takes an existing orderId rather than creating a new order itself).
// Returns a gatewayUrl the browser should be redirected to.
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { orderId } = initSchema.parse(body);

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) {
    return apiError("Order not found.", 404);
  }
  if (order.paymentMethod !== "CARD") {
    return apiError("This order isn't set up for online payment.", 400);
  }
  if (order.paymentStatus === "PAID") {
    return apiError("This order has already been paid.", 400);
  }

  // Unique per attempt, not per order — see the comment in lib/sslcommerz.ts.
  const tranId = `${order.orderNumber}-${Date.now().toString(36)}`;

  const result = await initiateSSLCommerzPayment({
    orderId: order.id,
    tranId,
    amount: order.total,
    customerName: order.fullName,
    customerEmail: order.email,
    customerPhone: order.phone,
    customerAddress: order.address ?? "N/A",
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  });

  if (!result.success) {
    return apiError(result.error, 502);
  }

  return NextResponse.json({ gatewayUrl: result.gatewayUrl });
});
