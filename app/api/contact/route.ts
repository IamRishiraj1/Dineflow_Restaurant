// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageInputSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { sendContactMessageEmail } from "@/lib/email";
import { defaultRestaurantSettings } from "@/data/restaurant";

// POST /api/contact — the contact page's real submit handler. Open to
// anyone, same pattern as guest checkout on POST /api/orders:
// withErrorHandling() + schema.parse() directly (ZodErrors are caught by
// the wrapper and turned into a 400 via apiValidationError automatically).
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = contactMessageInputSchema.parse(body);

  // Same lookup POST /api/orders uses for sendNewOrderAlertEmail.
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: "singleton" } });
  const restaurantEmail = settings?.email || defaultRestaurantSettings.email;

  // Awaited and checked (unlike the fire-and-forget order emails) — this
  // route's whole job is sending this email, so a real failure needs to
  // reach the customer as a real error, not a false success.
  const result = await sendContactMessageEmail(input, restaurantEmail);

  if (!result.sent) {
    return apiError("We couldn't send your message right now. Please try again shortly.", 502);
  }

  return NextResponse.json({ success: true }, { status: 201 });
});
