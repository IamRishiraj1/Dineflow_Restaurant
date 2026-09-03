"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader, X } from "lucide-react";
import { compressImageFile } from "@/lib/image-client";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

/**
 * Phase 5: real image uploads. Shows the current photo (if any), lets the
 * admin pick a file, compresses it in the browser (lib/image-client.ts),
 * uploads it to /api/upload (which stores it in Supabase Storage), and
 * reports the resulting public URL back via onChange.
 *
 * This replaces the old "Image URL" text field in FoodFormModal /
 * CategoryFormModal — admins no longer paste arbitrary URLs.
 */
export function ImageUploadField({ label, value, onChange, hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A local, instant preview (from the file the admin just picked) while
  // the network upload is still in flight — avoids a blank gap between
  // "picked a file" and "server responded with the real URL."
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    setError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WEBP image.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setIsUploading(true);

    try {
      const compressed = await compressImageFile(file);

      const body = new FormData();
      body.append("file", compressed);

      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  function handleRemove() {
    onChange("");
    setLocalPreview(null);
    setError(null);
  }

  const previewSrc = localPreview || value || null;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-ink-800">{label}</label>

      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-50",
            "flex items-center justify-center"
          )}
        >
          {previewSrc ? (
            // A plain <img>, not next/image: this can briefly be a local
            // blob: URL before the upload finishes, which next/image can't
            // optimize anyway.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-ink-300" />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader className="h-5 w-5 animate-spin text-ember-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </button>
          {value && !isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-error-500"
            >
              <X className="h-3.5 w-3.5" />
              Remove photo
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
