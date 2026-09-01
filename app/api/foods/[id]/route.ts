import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeFood } from "@/lib/serializers";
import { foodInputSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/session";

interface Params {
  params: { id: string };
}

// PATCH /api/foods/[id] — partial update. Also used for the admin
// availability toggle switch, which sends just `{ isAvailable: boolean }`.
// Admin-only.
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const input = foodInputSchema.partial().parse(body);

  const existing = await prisma.food.findUnique({ where: { id: params.id } });
  if (!existing) {
    return apiError("Food not found.", 404);
  }

  const food = await prisma.food.update({
    where: { id: params.id },
    data: input,
  });
  return NextResponse.json(serializeFood(food));
});

// DELETE /api/foods/[id] — admin-only.
// Existing order line items keep their own snapshot of the food's name,
// price, and image (see OrderItem in schema.prisma), so deleting a food
// never changes historical orders — only OrderItem.foodId is nulled out.
export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.food.findUnique({ where: { id: params.id } });
  if (!existing) {
    return apiError("Food not found.", 404);
  }

  await prisma.food.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});
