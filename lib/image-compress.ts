/**
 * Resizes and compresses an image file entirely in the browser before it's
 * uploaded, so a 12MB photo straight off someone's phone doesn't turn into
 * a 12MB row in Supabase Storage (and a slow-loading food card for every
 * customer who views it forever after). Uses the browser's built-in
 * Canvas API — no image-processing library needed, and nothing server-side
 * has to install native dependencies (like `sharp`) to make this work,
 * which keeps the Vercel deployment simple.
 *
 * Downscales to fit within `maxDimension` on the longer side (upscaling
 * never happens — a small image is left alone) and re-encodes as JPEG at
 * the given quality.
 */
export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Extremely unlikely (means the browser has no 2D canvas support at
    // all), but fail gracefully by uploading the original rather than
    // blocking the admin from adding a photo at all.
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  // Only use the compressed version if it's actually smaller — a tiny
  // source image re-encoded as JPEG can occasionally end up larger than
  // the original (e.g. a small, already-optimized PNG).
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, checked before compression
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
