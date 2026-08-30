import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Kept identical to app/api/foods/route.ts — see the comments there for why
// image is normalized and why `category` is included alongside `categoryId`.
type FoodWithCategory = Prisma.FoodGetPayload<{
  include: { category: { select: { id: true; name: true; slug: true } } };
}>;

function serializeFood(food: FoodWithCategory) {
  return {
    id: food.id,
    name: food.name,
    slug: food.slug,
    description: food.description,
    price: food.price,
    image: food.image ?? "",
    categoryId: food.categoryId,
    category: food.category,
    rating: food.rating,
    reviewCount: food.reviewCount,
    prepTimeMinutes: food.prepTimeMinutes,
    ingredients: food.ingredients ?? [],
    isAvailable: food.isAvailable,
    isPopular: food.isPopular,
    isFeatured: food.isFeatured,
    createdAt: food.createdAt,
    updatedAt: food.updatedAt,
  };
}

const categorySelect = { id: true, name: true, slug: true } as const;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const updateFoodSchema = z
  .object({
    name: z.string().trim().min(1, "Food name is required").max(150).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(150)
      .regex(slugPattern, "Slug may only contain lowercase letters, numbers, and hyphens")
      .optional(),
    description: z.string().trim().min(1, "Description is required").max(1000).optional(),
    price: z
      .number()
      .int("Price must be a whole number")
      .positive("Price must be greater than 0")
      .optional(),
    image: z.string().trim().max(2000).optional(),
    categoryId: z.string().trim().min(1, "categoryId is required").optional(),
    ingredients: z.array(z.string().trim().min(1)).optional(),
    prepTimeMinutes: z
      .number()
      .int("Prep time must be a whole number of minutes")
      .positive("Prep time must be greater than 0")
      .optional(),
    isAvailable: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });

interface RouteParams {
  params: { id: string };
}

/** PATCH /api/foods/[id] — update an existing food item. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Food id is required." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = updateFoodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid food data.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const updated = await prisma.food.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.ingredients !== undefined && { ingredients: data.ingredients }),
        ...(data.prepTimeMinutes !== undefined && { prepTimeMinutes: data.prepTimeMinutes }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.isPopular !== undefined && { isPopular: data.isPopular }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.reviewCount !== undefined && { reviewCount: data.reviewCount }),
      },
      include: { category: { select: categorySelect } },
    });
    return NextResponse.json(serializeFood(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025 = record to update not found.
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Food not found." }, { status: 404 });
      }
      // P2002 = unique constraint violation (the `slug` column is @unique).
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: `A food with slug "${data.slug}" already exists.` },
          { status: 409 }
        );
      }
      // P2003 = foreign key constraint failed — categoryId doesn't exist.
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: `Category "${data.categoryId}" does not exist.` },
          { status: 400 }
        );
      }
    }
    console.error(`PATCH /api/foods/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to update food." }, { status: 500 });
  }
}

/**
 * DELETE /api/foods/[id] — delete a food item.
 *
 * Unlike categories, this is safe to delete directly: OrderItem.foodId is
 * nullable with onDelete: SetNull (see prisma/schema.prisma), so past orders
 * keep their snapshotted name/price/quantity/image and simply lose the live
 * food reference. No blocking check is needed here.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Food id is required." }, { status: 400 });
  }

  try {
    await prisma.food.delete({ where: { id } });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Food not found." }, { status: 404 });
    }
    console.error(`DELETE /api/foods/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to delete food." }, { status: 500 });
  }
}
