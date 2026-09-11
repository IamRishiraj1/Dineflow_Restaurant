import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isDemoAccount, demoRestrictedError } from "@/lib/session";
import { apiError, withErrorHandling } from "@/lib/api-helpers";
import { supabaseAdmin, FOOD_IMAGES_BUCKET } from "@/lib/supabase-admin";

// POST /api/upload — accepts a single image file (multipart/form-data,
// field name "file") and stores it in the Supabase Storage bucket used for
// food/category photos. Admin-only — this is how the admin panel's
// FoodFormModal / CategoryFormModal upload real photos (Phase 5), replacing
// the old "paste any image URL" text field.
//
// The client (ImageUploadField) already compresses/resizes the image in the
// browser before sending it here (see lib/image-client.ts), but this route
// re-checks type and size on the server too — never trust the client alone,
// since the compression step can be bypassed by anyone calling this API
// directly.
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { session, error } = await requireAdmin();
  if (error) return error;
  // Real cloud storage, real cost, real abuse surface if left open to
  // anyone who finds the public demo login — no legitimate demo purpose
  // needs arbitrary file uploads anyway.
  if (isDemoAccount(session.user.email)) return demoRestrictedError();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return apiError("No file was uploaded.", 400);
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return apiError("Only JPEG, PNG, or WEBP images are allowed.", 400);
  }
  if (file.size > MAX_FILE_BYTES) {
    return apiError("Image is too large. Please use a file under 5MB.", 400);
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  // Random-ish, collision-safe filename — we don't need to preserve the
  // original filename, and not doing so avoids ever trusting user input in
  // a storage path.
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(FOOD_IMAGES_BUCKET)
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      cacheControl: "31536000", // 1 year — filenames are unique per upload, never reused
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase Storage upload error:", uploadError);
    // The most common cause here is the bucket not existing yet — see
    // docs/PHASE-5-IMAGE-UPLOADS-SETUP.md.
    return apiError(
      "Could not upload the image. Make sure the 'food-images' Storage bucket has been created in Supabase (see docs/PHASE-5-IMAGE-UPLOADS-SETUP.md).",
      500
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(FOOD_IMAGES_BUCKET)
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
});
