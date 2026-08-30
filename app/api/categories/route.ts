import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// Matches the Category shape in types/index.ts. Prisma's `description` and
// `image` columns are nullable, but the frontend type declares them as
// required strings — so null is normalized to "" here at the API boundary.
// CatalogContext isn't wired up to this route yet, but this keeps the
// response shape compatible with what it (and the admin UI) already expect.
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

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
  // Optional: the admin form already derives a slug from the name, but the
  // API can generate one too if a caller omits it.
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
});

/** GET /api/categories — list all categories. */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(categories.map(serializeCategory));
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json(
      { error: "Failed to load categories." },
      { status: 500 }
    );
  }
}

/** POST /api/categories — create a new category. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category data.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? data.slug : slugify(data.name);

  if (!slug) {
    return NextResponse.json(
      { error: "Could not derive a valid slug from the category name." },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        image: data.image ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json(serializeCategory(created), { status: 201 });
  } catch (error) {
    // P2002 = unique constraint violation (the `slug` column is @unique).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }
    console.error("POST /api/categories failed:", error);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
