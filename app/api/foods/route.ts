import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeFood } from "@/lib/serializers";
import { foodInputSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { requireAdmin, isDemoAccount, demoRestrictedError } from "@/lib/session";

// GET /api/foods — the full menu. Both the customer-facing menu browser and
// the admin food table load from this single endpoint. Left open (no auth
// required) — this is public menu data.
export const GET = withErrorHandling(async () => {
  const foods = await prisma.food.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(foods.map(serializeFood));
});

// POST /api/foods — create a new menu item. Admin-only.
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { session, error } = await requireAdmin();
  if (error) return error;
  if (isDemoAccount(session.user.email)) return demoRestrictedError();

  const body = await req.json();
  const input = foodInputSchema.parse(body);

  const existing = await prisma.food.findUnique({ where: { slug: input.slug } });
  if (existing) {
    // Two foods with the same name would collide on the unique slug — make
    // the new one unique instead of failing, since the admin form doesn't
    // ask the user to pick a slug themselves.
    input.slug = `${input.slug}-${Date.now().toString(36)}`;
  }

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    return apiError("Selected category does not exist.", 400);
  }

  const food = await prisma.food.create({ data: input });
  return NextResponse.json(serializeFood(food), { status: 201 });
});
