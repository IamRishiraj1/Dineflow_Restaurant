import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withErrorHandling, apiError } from "@/lib/api-helpers";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

// POST /api/register — creates a new customer account (role defaults to
// CUSTOMER in the schema; there is no way to self-register as an admin).
// Does NOT log the user in — the Register page calls signIn() itself right
// after this succeeds, so NextAuth issues the session cookie the normal way.
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = registerSchema.parse(body);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return apiError("An account with this email already exists.", 409);
  }

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hashed },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
});
