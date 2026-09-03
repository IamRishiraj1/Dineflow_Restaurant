// Client-side image compression, run in the browser before a file is
// uploaded via ImageUploadField. This is deliberately dependency-free (no
// sharp, no extra npm package) — the browser's own <canvas> can resize and
// re-encode an image just fine, which keeps this a "smallest correct
// change" per CLAUDE.md rather than adding a new dependency for something
// the platform already does.
//
// Why this matters: a photo straight off a phone camera is commonly
// 3-10MB. Nobody needs a 4000px-wide image for a menu card — resizing to a
// sane max width and re-encoding as JPEG at a reasonable quality routinely
// gets that down to a few hundred KB, which is faster for every customer
// who loads the menu.

const MAX_DIMENSION = 1600; // px, longest side
const JPEG_QUALITY = 0.82;

/**
 * Resizes an image file to fit within MAX_DIMENSION (preserving aspect
 * ratio) and re-encodes it as JPEG. Returns a new File so it can be sent to
 * the upload API the same way the original would have been.
 *
 * Falls back to returning the original file unchanged if anything about
 * this fails (e.g. an unsupported browser) — better to upload a large
 * original than to block the admin from uploading at all.
 */
export async function compressImageFile(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (err) {
    console.warn("Image compression skipped, uploading original file:", err);
    return file;
  }
}
