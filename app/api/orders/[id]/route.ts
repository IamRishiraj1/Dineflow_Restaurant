import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder, orderStatusToDb, paymentStatusToDb } from "@/lib/serializers";
import { orderUpdateSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";

interface Params {
  params: { id: string };
}

// GET /api/orders/[id] — accepts either the internal id or the
// customer-facing order number, since both are used as the [id] route
// param in different places (e.g. /track-order/[id] uses the internal id
// after checkout, but a customer could plausibly look one up by number
// later).
export const GET = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: params.id }, { orderNumber: params.id }] },
    include: { items: true },
  });
  if (!order) {
    return apiError("Order not found.", 404);
  }
  return NextResponse.json(serializeOrder(order));
});

// PATCH /api/orders/[id] — update status and/or payment status. This is
// what the admin Orders page calls when moving an order through the
// pipeline (Placed → Confirmed → Preparing → Ready → Completed).
// ⚠️ Not yet protected by authentication — see TODO.md Phase 3.
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const body = await req.json();
  const input = orderUpdateSchema.parse(body);

  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) {
    return apiError("Order not found.", 404);
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(input.status && { status: orderStatusToDb(input.status) }),
      ...(input.paymentStatus && { paymentStatus: paymentStatusToDb(input.paymentStatus) }),
    },
    include: { items: true },
  });

  return NextResponse.json(serializeOrder(order));
});
