import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeSettings } from "@/lib/serializers";
import { settingsUpdateSchema } from "@/lib/validation";
import { withErrorHandling, apiError } from "@/lib/api-helpers";
import { defaultRestaurantSettings } from "@/data/restaurant";

const SETTINGS_ID = "singleton";

// GET /api/settings — there's exactly one settings row for the whole
// restaurant (see RestaurantSettings model — id defaults to "singleton").
// If it's somehow missing (e.g. the seed script hasn't run), fall back to
// the same defaults the mock data used, rather than erroring.
export const GET = withErrorHandling(async () => {
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings) {
    return NextResponse.json(defaultRestaurantSettings);
  }
  return NextResponse.json(serializeSettings(settings));
});

// PATCH /api/settings — update restaurant info, opening hours, or
// preferences. Upserts so this works even before the seed script has run.
// ⚠️ Not yet protected by authentication — see TODO.md Phase 3.
export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = settingsUpdateSchema.parse(body);

  if (Object.keys(input).length === 0) {
    return apiError("No fields to update.", 400);
  }

  const settings = await prisma.restaurantSettings.upsert({
    where: { id: SETTINGS_ID },
    update: input,
    create: { id: SETTINGS_ID, ...defaultRestaurantSettings, ...input },
  });

  return NextResponse.json(serializeSettings(settings));
});
