import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";
import { categoryInputSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { requireAdmin, isDemoAccount, demoRestrictedError } from "@/lib/session";

// GET /api/categories — list every category. Left open (no auth required)
// on purpose: this is public menu data the customer-facing site needs to
// render for anyone, logged in or not.
export const GET = withErrorHandling(async () => {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories.map(serializeCategory));
});

// POST /api/categories — create a new category. Admin-only.
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { session, error } = await requireAdmin();
  if (error) return error;
  if (isDemoAccount(session.user.email)) return demoRestrictedError();

  const body = await req.json();
  const input = categoryInputSchema.parse(body);

  const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
  if (existing) {
    return apiError(`A category with the slug "${input.slug}" already exists.`, 409);
  }

  const category = await prisma.category.create({ data: input });
  return NextResponse.json(serializeCategory(category), { status: 201 });
});
