import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Kept identical to the version in app/api/categories/route.ts — see the
// comment there for why null description/image are normalized to "".
function serializeCategory(category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1, "Category name is required").max(100).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(slugPattern, "Slug may only contain lowercase letters, numbers, and hyphens")
      .optional(),
    description: z.string().trim().max(500).optional(),
    image: z.string().trim().max(2000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });

interface RouteParams {
  params: { id: string };
}

/** PATCH /api/categories/[id] — update an existing category. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Category id is required." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category data.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return NextResponse.json(serializeCategory(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025 = record to update not found.
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Category not found." }, { status: 404 });
      }
      // P2002 = unique constraint violation (the `slug` column is @unique).
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: `A category with slug "${data.slug}" already exists.` },
          { status: 409 }
        );
      }
    }
    console.error(`PATCH /api/categories/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

/** DELETE /api/categories/[id] — delete a category. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Category id is required." }, { status: 400 });
  }

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Food.categoryId is required (not nullable), so deleting a category
    // that still has foods would otherwise fail with a raw foreign-key
    // error. Check first and return a clear, actionable message instead.
    const foodCount = await prisma.food.count({ where: { categoryId: id } });
    if (foodCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${existing.name}" — ${foodCount} food item${
            foodCount === 1 ? " still references" : "s still reference"
          } this category. Reassign or delete those food items first.`,
          foodCount,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(`DELETE /api/categories/${id} failed:`, error);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
