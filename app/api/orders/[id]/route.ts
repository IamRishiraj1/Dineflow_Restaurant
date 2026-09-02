import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder, orderStatusToDb, paymentStatusToDb } from "@/lib/serializers";
import { orderUpdateSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/session";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

interface Params {
  params: { id: string };
}

// GET /api/orders/[id] — accepts either the internal id or the
// customer-facing order number, since both are used as the [id] route
// param in different places (e.g. /track-order/[id] uses the internal id
// after checkout).
//
// Deliberately left open (no auth required): a guest who just checked out
// without an account still needs to view their own confirmation/tracking
// page, and the only "key" they have is this id/order number. This is the
// same pattern most delivery sites use for guest order tracking.
//
// ⚠️ Known limitation (see TODO.md Phase 8): the order number is a short
// random 5-digit code, which is low-entropy as a secret — someone could
// feasibly guess a valid one. A future hardening pass should require the
// customer's email as a second factor for lookups by order NUMBER (not
// needed when looking up by the internal cuid id, which is effectively
// unguessable).
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
// Admin-only.
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const { error } = await requireAdmin();
  if (error) return error;

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

  const serialized = serializeOrder(order);

  // Only email the customer when the STATUS actually changed (not when
  // this call only touched paymentStatus), and only if it's genuinely
  // different from before — an admin re-selecting the same status in the
  // dropdown shouldn't re-send an email. Comparing against the DB-format
  // value (orderStatusToDb(input.status)) rather than input.status
  // directly, since `existing.status` is Prisma's UPPERCASE enum
  // ("CONFIRMED") while input.status is the frontend's lowercase string
  // ("confirmed") — comparing those directly would never be equal, and
  // the email would fire on every single status PATCH regardless of
  // whether anything actually changed.
  if (input.status && orderStatusToDb(input.status) !== existing.status) {
    await sendOrderStatusUpdateEmail(serialized);
  }

  return NextResponse.json(serialized);
});
