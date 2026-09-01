import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";
import { categoryInputSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/session";

interface Params {
  params: { id: string };
}

// PATCH /api/categories/[id] — partial update (also used for the
// admin availability/visibility toggle switch, which sends just
// `{ isActive: boolean }`). Admin-only.
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const input = categoryInputSchema.partial().parse(body);

  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) {
    return apiError("Category not found.", 404);
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: input,
  });
  return NextResponse.json(serializeCategory(category));
});

// DELETE /api/categories/[id] — admin-only.
// Foods that reference this category have their categoryId set to null by
// the database (see the Food.category relation's onDelete: SetNull in
// schema.prisma) — the frontend already falls back to "Uncategorized" in
// that case (see AdminCategoriesPage).
export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) {
    return apiError("Category not found.", 404);
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});
