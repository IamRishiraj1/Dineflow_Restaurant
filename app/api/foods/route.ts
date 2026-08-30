import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// Matches the Food shape in types/index.ts (image is a required string there,
// but nullable in the DB) plus a lightweight nested `category` object — the
// existing frontend types don't have this field, but nothing consumes this
// route yet, so adding it is additive and helps whichever CatalogContext
// migration reads from here next without another schema lookup.
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

const createFoodSchema = z.object({
  name: z.string().trim().min(1, "Food name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .regex(slugPattern, "Slug may only contain lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().trim().min(1, "Description is required").max(1000),
  price: z.number().int("Price must be a whole number").positive("Price must be greater than 0"),
  image: z.string().trim().max(2000).optional(),
  categoryId: z.string().trim().min(1, "categoryId is required"),
  ingredients: z.array(z.string().trim().min(1)).optional(),
  prepTimeMinutes: z
    .number()
    .int("Prep time must be a whole number of minutes")
    .positive("Prep time must be greater than 0"),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
});

/** GET /api/foods — list all foods, including their category's id/name/slug. */
export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      include: { category: { select: categorySelect } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(foods.map(serializeFood));
  } catch (error) {
    console.error("GET /api/foods failed:", error);
    return NextResponse.json({ error: "Failed to load foods." }, { status: 500 });
  }
}

/** POST /api/foods — create a new food item. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = createFoodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid food data.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? data.slug : slugify(data.name);

  if (!slug) {
    return NextResponse.json(
      { error: "Could not derive a valid slug from the food name." },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.food.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        image: data.image ?? null,
        categoryId: data.categoryId,
        ingredients: data.ingredients ?? [],
        prepTimeMinutes: data.prepTimeMinutes,
        isAvailable: data.isAvailable ?? true,
        isPopular: data.isPopular ?? false,
        isFeatured: data.isFeatured ?? false,
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.reviewCount !== undefined && { reviewCount: data.reviewCount }),
      },
      include: { category: { select: categorySelect } },
    });
    return NextResponse.json(serializeFood(created), { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = unique constraint violation (the `slug` column is @unique).
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: `A food with slug "${slug}" already exists.` },
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
    console.error("POST /api/foods failed:", error);
    return NextResponse.json({ error: "Failed to create food." }, { status: 500 });
  }
}
